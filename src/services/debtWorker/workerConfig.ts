import {PerformanceStats, WorkerPoolConfig} from './types';

export function createDefaultWorkerConfig(): WorkerPoolConfig {
  return {
    maxWorkers: Math.min(4, navigator.hardwareConcurrency || 2),
    workerTimeout: 30000,
    enablePriorityQueue: true,
    fallbackToMainThread: true,
  };
}

export function createInitialPerformanceStats(): PerformanceStats {
  return {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageExecutionTime: 0,
    workerUtilization: 0,
    lastJobTime: 0,
  };
}

export function updateWorkerPerformanceStats(
  stats: PerformanceStats,
  executionTime: number,
  success: boolean,
  activeJobCount: number,
  workerCount: number,
): PerformanceStats {
  const totalJobs = stats.totalJobs + 1;
  const completedJobs = success ? stats.completedJobs + 1 : stats.completedJobs;
  const failedJobs = success ? stats.failedJobs : stats.failedJobs + 1;

  const averageExecutionTime =
    completedJobs > 0
      ? (stats.averageExecutionTime * (completedJobs - 1) + executionTime) / completedJobs
      : stats.averageExecutionTime;

  return {
    totalJobs,
    completedJobs,
    failedJobs,
    averageExecutionTime,
    lastJobTime: executionTime,
    workerUtilization: workerCount > 0 ? activeJobCount / workerCount : 0,
  };
}
