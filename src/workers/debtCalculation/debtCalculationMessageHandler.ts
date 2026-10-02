import {calculateGroupBalanceInWorker} from './debtCalculationEngine';
import {estimateTimeRemaining} from './debtCalculationMetrics';
import type {
  CalculateBalancePayload,
  ErrorMessage,
  ProgressMessage,
  ResultMessage,
  WorkerMessage,
} from './debtCalculationTypes';

const activeJobs = new Map<string, AbortController>();

export function handleWorkerMessage(message: WorkerMessage) {
  const {type, requestId} = message;

  switch (type) {
    case 'CALCULATE_BALANCE':
      if (requestId) {
        handleCalculateBalance(requestId, message.payload);
      }
      break;
    case 'CANCEL':
      if (requestId) {
        handleCancel(requestId);
      }
      break;
  }
}

function handleCalculateBalance(requestId: string, payload?: CalculateBalancePayload) {
  const abortController = new AbortController();
  activeJobs.set(requestId, abortController);

  try {
    const startTime = performance.now();
    if (!payload) {
      throw new Error('Missing calculation payload');
    }

    const {transactions, members, options = {}} = payload;
    const {chunkSize = 50, enableProgressUpdates = true} = options;

    if (abortController.signal.aborted) {
      throw new Error('Calculation cancelled');
    }

    const totalStages = 5;
    let currentStage = 1;

    const sendProgress = (stage: string, progress: number) => {
      if (enableProgressUpdates) {
        const progressMessage: ProgressMessage = {
          type: 'PROGRESS',
          payload: {
            requestId,
            progress: ((currentStage + progress) / totalStages) * 100,
            stage,
            estimatedTimeRemaining: estimateTimeRemaining(startTime, currentStage, totalStages),
          },
        };
        self.postMessage(progressMessage);
      }
    };

    sendProgress('Initializing...', 0);

    const result = calculateGroupBalanceInWorker(
      transactions,
      members,
      chunkSize,
      abortController.signal,
      (stage, progress) => sendProgress(stage, progress),
    );

    if (abortController.signal.aborted) {
      throw new Error('Calculation cancelled');
    }

    currentStage = totalStages;

    const resultMessage: ResultMessage = {
      type: 'RESULT',
      payload: {
        requestId,
        result,
        executionTime: performance.now() - startTime,
      },
    };

    self.postMessage(resultMessage);
  } catch (error) {
    const errorMessage: ErrorMessage = {
      type: 'ERROR',
      payload: {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
    self.postMessage(errorMessage);
  } finally {
    activeJobs.delete(requestId);
  }
}

function handleCancel(requestId: string) {
  const controller = activeJobs.get(requestId);
  if (controller) {
    controller.abort();
    activeJobs.delete(requestId);
  }
}
