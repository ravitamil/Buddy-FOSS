import {GroupMember, Transaction} from '../../types';
import {GroupBalanceCalculation} from '../../utils/groupBalanceUtils.optimized';

export type JobPriority = 'low' | 'normal' | 'high';

export interface BalanceCalculationWorkerRequest {
  type: 'CALCULATE_BALANCE';
  payload: {
    transactions: Transaction[];
    members: GroupMember[];
    options: {
      enableProgressUpdates: boolean;
      chunkSize: number;
    };
  };
  requestId: string;
}

export interface CancelWorkerRequest {
  type: 'CANCEL';
  requestId: string;
}

export type DebtWorkerRequest = BalanceCalculationWorkerRequest | CancelWorkerRequest;

export interface WorkerProgressPayload {
  requestId: string;
  progress: number;
  stage: string;
}

export interface WorkerResultPayload {
  requestId: string;
  result: GroupBalanceCalculation;
  executionTime: number;
}

export interface WorkerErrorPayload {
  requestId: string;
  error: string;
}

export type DebtWorkerResponse =
  | {type: 'PROGRESS'; payload: WorkerProgressPayload}
  | {type: 'RESULT'; payload: WorkerResultPayload}
  | {type: 'ERROR'; payload: WorkerErrorPayload};

export interface WorkerJob {
  id: string;
  transactions: Transaction[];
  members: GroupMember[];
  resolve: (result: GroupBalanceCalculation) => void;
  reject: (error: Error) => void;
  startTime: number;
  priority: JobPriority;
  timeout?: number;
}

export interface ActiveWorkerJob {
  job: WorkerJob;
  worker: Worker;
  progressHandler?: (event: MessageEvent<unknown>) => void;
}

export interface WorkerPoolConfig {
  maxWorkers: number;
  workerTimeout: number;
  enablePriorityQueue: boolean;
  fallbackToMainThread: boolean;
}

export interface PerformanceStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  workerUtilization: number;
  lastJobTime: number;
}

export interface WorkerCalculationOptions {
  useWorker?: boolean;
  priority?: JobPriority;
  timeout?: number;
  onProgress?: (progress: number, stage: string) => void;
}

export interface WorkerServiceStatus {
  isInitialized: boolean;
  workerCount: number;
  activeJobs: number;
  queueSize: number;
  supportsWorkers: boolean;
  performanceStats: PerformanceStats;
}
