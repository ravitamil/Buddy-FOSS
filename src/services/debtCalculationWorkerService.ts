import type {GroupMember, Transaction} from '../types';
import type {GroupBalanceCalculation} from '../utils/groupBalanceUtils.optimized';
import {
  createDefaultWorkerConfig,
  createInitialPerformanceStats,
  updateWorkerPerformanceStats,
} from './debtWorker/workerConfig';
import {parseWorkerResponse} from './debtWorker/workerResponseParser';
import {
  calculateOptimalWorkerChunkSize,
  createBalanceWorkerRequest,
  createCancelWorkerRequest,
  createWorkerJob,
  createWorkerPerformanceSnapshot,
  generateWorkerJobId,
  selectRandomWorker,
  shouldUseDebtWorker,
} from './debtWorker/workerServiceHelpers';
import {
  ActiveWorkerJob,
  PerformanceStats,
  WorkerCalculationOptions,
  WorkerJob,
  WorkerPoolConfig,
  WorkerServiceStatus,
} from './debtWorker/types';
import {logger as appLogger} from './LoggerService';

class DebtCalculationWorkerService {
  private static instance: DebtCalculationWorkerService;
  private workers: Worker[] = [];
  private jobQueue: WorkerJob[] = [];
  private activeJobs = new Map<string, ActiveWorkerJob>();
  private config: WorkerPoolConfig;
  private performanceStats: PerformanceStats;
  private isInitialized = false;

  private constructor() {
    this.config = createDefaultWorkerConfig();
    this.performanceStats = createInitialPerformanceStats();
  }

  static getInstance(): DebtCalculationWorkerService {
    if (!DebtCalculationWorkerService.instance) {
      DebtCalculationWorkerService.instance = new DebtCalculationWorkerService();
    }
    return DebtCalculationWorkerService.instance;
  }

  initialize(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();

    try {
      if (typeof Worker === 'undefined') {
        appLogger.warn('Web Workers not supported, falling back to main thread calculations');
        return Promise.resolve();
      }

      const workerCount = Math.min(this.config.maxWorkers, 2);
      for (let i = 0; i < workerCount; i++) {
        try {
          const worker = new Worker(
            new URL('../workers/debtCalculation.worker.ts', import.meta.url),
            {
              type: 'module',
            },
          );

          worker.onmessage = this.handleWorkerMessage.bind(this);
          worker.onerror = this.handleWorkerError.bind(this);
          worker.onmessageerror = this.handleWorkerMessageError.bind(this);

          this.workers.push(worker);
        } catch (error) {
          appLogger.error(`Failed to create worker ${i}:`, error);
        }
      }

      if (this.workers.length === 0) {
        appLogger.warn('No workers could be created, falling back to main thread');
        return Promise.resolve();
      }

      this.isInitialized = true;
      appLogger.debug(
        `Debt calculation worker service initialized with ${this.workers.length} workers`,
      );
    } catch (error) {
      appLogger.error('Failed to initialize worker service:', error);
    }

    return Promise.resolve();
  }

  async calculateGroupBalance(
    transactions: Transaction[],
    members: GroupMember[],
    options: WorkerCalculationOptions = {},
  ): Promise<GroupBalanceCalculation> {
    const {useWorker = true, priority = 'normal', timeout, onProgress} = options;

    const jobId = generateWorkerJobId();

    const shouldUseWorker =
      useWorker &&
      this.isInitialized &&
      this.workers.length > 0 &&
      shouldUseDebtWorker(transactions, members);

    if (shouldUseWorker) {
      try {
        return await this.submitToWorker(jobId, transactions, members, {
          priority,
          timeout,
          onProgress,
        });
      } catch (error) {
        appLogger.error('Worker calculation failed, falling back to main thread:', error);
        if (!this.config.fallbackToMainThread) {
          throw error;
        }
      }
    }

    return this.calculateOnMainThread(transactions, members, options);
  }

  private submitToWorker(
    jobId: string,
    transactions: Transaction[],
    members: GroupMember[],
    options: WorkerCalculationOptions,
  ): Promise<GroupBalanceCalculation> {
    return new Promise((resolve, reject) => {
      const job = createWorkerJob({
        jobId,
        transactions,
        members,
        resolve,
        reject,
        options,
      });

      const worker = this.selectWorker();
      if (!worker) {
        reject(new Error('No available workers'));
        return;
      }

      const progressHandler = (event: MessageEvent<unknown>) => {
        const message = parseWorkerResponse(event.data);
        if (message?.type === 'PROGRESS' && message.payload.requestId === jobId) {
          options.onProgress?.(message.payload.progress, message.payload.stage);
        }
      };

      worker.addEventListener('message', progressHandler);

      const workerMessage = createBalanceWorkerRequest({
        jobId,
        transactions,
        members,
        enableProgressUpdates: !!options.onProgress,
        chunkSize: calculateOptimalWorkerChunkSize(transactions.length),
      });

      worker.postMessage(workerMessage);
      this.activeJobs.set(jobId, {job, worker, progressHandler});

      const timeout = options.timeout || this.config.workerTimeout;
      setTimeout(() => {
        if (this.activeJobs.has(jobId)) {
          this.cancelJob(jobId);
          reject(new Error(`Calculation timed out after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  private async calculateOnMainThread(
    transactions: Transaction[],
    members: GroupMember[],
    options: {
      onProgress?: (progress: number, stage: string) => void;
    },
  ): Promise<GroupBalanceCalculation> {
    const {calculateGroupBalanceOptimized} = await import('../utils/groupBalanceUtils.optimized');

    options.onProgress?.(50, 'Calculating on main thread');

    const result = calculateGroupBalanceOptimized(transactions, members);

    options.onProgress?.(100, 'Complete');

    return result;
  }

  private handleWorkerMessage(event: MessageEvent<unknown>): void {
    const message = parseWorkerResponse(event.data);
    if (!message) {
      appLogger.warn('Received invalid worker message');
      return;
    }

    const {type, payload} = message;
    const {requestId} = payload;

    const activeJob = this.activeJobs.get(requestId);
    if (!activeJob) {
      appLogger.warn(`Received message for unknown job: ${requestId}`);
      return;
    }

    switch (type) {
      case 'RESULT':
        this.handleJobSuccess(requestId, payload.result, payload.executionTime);
        break;
      case 'ERROR':
        this.handleJobError(requestId, payload.error);
        break;
      case 'PROGRESS':
        break;
    }
  }

  private handleJobSuccess(
    requestId: string,
    result: GroupBalanceCalculation,
    executionTime: number,
  ): void {
    const activeJob = this.activeJobs.get(requestId);
    if (!activeJob) return;

    const {job} = activeJob;
    this.cleanupActiveJob(requestId, activeJob);

    this.updatePerformanceStats(executionTime, true);

    job.resolve(result);
  }

  private handleJobError(requestId: string, error: string): void {
    const activeJob = this.activeJobs.get(requestId);
    if (!activeJob) return;

    const {job} = activeJob;
    this.cleanupActiveJob(requestId, activeJob);

    this.updatePerformanceStats(performance.now() - job.startTime, false);

    job.reject(new Error(error));
  }

  private handleWorkerError(error: ErrorEvent): void {
    appLogger.error('Worker error:', error);
  }

  private handleWorkerMessageError(error: MessageEvent): void {
    appLogger.error('Worker message error:', error);
  }

  private cleanupActiveJob(requestId: string, activeJob: ActiveWorkerJob): void {
    if (activeJob.progressHandler) {
      activeJob.worker.removeEventListener('message', activeJob.progressHandler);
    }
    this.activeJobs.delete(requestId);
  }

  private selectWorker(): Worker | null {
    return selectRandomWorker(this.workers);
  }

  private updatePerformanceStats(executionTime: number, success: boolean): void {
    this.performanceStats = updateWorkerPerformanceStats(
      this.performanceStats,
      executionTime,
      success,
      this.activeJobs.size,
      this.workers.length,
    );
  }

  cancelJob(jobId: string): boolean {
    const activeJob = this.activeJobs.get(jobId);
    if (!activeJob) return false;

    const {worker, job} = activeJob;

    worker.postMessage(createCancelWorkerRequest(jobId));
    this.cleanupActiveJob(jobId, activeJob);
    job.reject(new Error('Job cancelled'));

    return true;
  }

  getPerformanceStats(): PerformanceStats & {
    activeJobs: number;
    availableWorkers: number;
    queueSize: number;
  } {
    return createWorkerPerformanceSnapshot({
      performanceStats: this.performanceStats,
      activeJobs: this.activeJobs.size,
      availableWorkers: this.workers.length,
      queueSize: this.jobQueue.length,
    });
  }

  clearQueue(): void {
    this.jobQueue = [];
  }

  shutdown(): void {
    for (const [jobId] of this.activeJobs) {
      this.cancelJob(jobId);
    }

    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];

    this.isInitialized = false;
  }

  getStatus(): WorkerServiceStatus {
    return {
      isInitialized: this.isInitialized,
      workerCount: this.workers.length,
      activeJobs: this.activeJobs.size,
      queueSize: this.jobQueue.length,
      supportsWorkers: typeof Worker !== 'undefined',
      performanceStats: this.performanceStats,
    };
  }
}

export const debtCalculationWorkerService = DebtCalculationWorkerService.getInstance();
