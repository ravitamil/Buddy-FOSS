import type {GroupMember, Transaction} from '../../types';
import type {
  DebtWorkerRequest,
  PerformanceStats,
  WorkerCalculationOptions,
  WorkerJob,
} from './types';

export function createWorkerJob(params: {
  jobId: string;
  transactions: Transaction[];
  members: GroupMember[];
  resolve: WorkerJob['resolve'];
  reject: WorkerJob['reject'];
  options: WorkerCalculationOptions;
}): WorkerJob {
  return {
    id: params.jobId,
    transactions: params.transactions,
    members: params.members,
    resolve: params.resolve,
    reject: params.reject,
    startTime: performance.now(),
    priority: params.options.priority || 'normal',
    timeout: params.options.timeout,
  };
}

export function createBalanceWorkerRequest(params: {
  jobId: string;
  transactions: Transaction[];
  members: GroupMember[];
  enableProgressUpdates: boolean;
  chunkSize: number;
}): DebtWorkerRequest {
  return {
    type: 'CALCULATE_BALANCE',
    payload: {
      transactions: params.transactions,
      members: params.members,
      options: {
        enableProgressUpdates: params.enableProgressUpdates,
        chunkSize: params.chunkSize,
      },
    },
    requestId: params.jobId,
  };
}

export function createCancelWorkerRequest(jobId: string): DebtWorkerRequest {
  return {
    type: 'CANCEL',
    requestId: jobId,
  };
}

export function selectRandomWorker(workers: Worker[]): Worker | null {
  if (workers.length === 0) return null;
  return workers[Math.floor(Math.random() * workers.length)];
}

export function generateWorkerJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function shouldUseDebtWorker(transactions: Transaction[], members: GroupMember[]): boolean {
  const complexityScore = transactions.length * members.length + members.length * members.length;
  return complexityScore > 1000 || transactions.length > 50 || members.length > 15;
}

export function calculateOptimalWorkerChunkSize(transactionCount: number): number {
  if (transactionCount <= 10) return 10;
  if (transactionCount <= 50) return 25;
  if (transactionCount <= 100) return 50;
  return 100;
}

export function createWorkerPerformanceSnapshot(params: {
  performanceStats: PerformanceStats;
  activeJobs: number;
  availableWorkers: number;
  queueSize: number;
}): PerformanceStats & {
  activeJobs: number;
  availableWorkers: number;
  queueSize: number;
} {
  return {
    ...params.performanceStats,
    activeJobs: params.activeJobs,
    availableWorkers: params.availableWorkers,
    queueSize: params.queueSize,
  };
}
