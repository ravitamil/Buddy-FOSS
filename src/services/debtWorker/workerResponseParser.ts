import {GroupBalanceCalculation} from '../../utils/groupBalanceUtils.optimized';
import {
  DebtWorkerResponse,
  WorkerErrorPayload,
  WorkerProgressPayload,
  WorkerResultPayload,
} from './types';

export function parseWorkerResponse(message: unknown): DebtWorkerResponse | null {
  if (!isRecord(message) || typeof message.type !== 'string') {
    return null;
  }

  if (message.type === 'PROGRESS' && isWorkerProgressPayload(message.payload)) {
    return {type: 'PROGRESS', payload: message.payload};
  }

  if (message.type === 'RESULT' && isWorkerResultPayload(message.payload)) {
    return {type: 'RESULT', payload: message.payload};
  }

  if (message.type === 'ERROR' && isWorkerErrorPayload(message.payload)) {
    return {type: 'ERROR', payload: message.payload};
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWorkerProgressPayload(value: unknown): value is WorkerProgressPayload {
  return (
    isRecord(value) &&
    typeof value.requestId === 'string' &&
    typeof value.progress === 'number' &&
    typeof value.stage === 'string'
  );
}

function isWorkerResultPayload(value: unknown): value is WorkerResultPayload {
  return (
    isRecord(value) &&
    typeof value.requestId === 'string' &&
    typeof value.executionTime === 'number' &&
    isGroupBalanceCalculation(value.result)
  );
}

function isWorkerErrorPayload(value: unknown): value is WorkerErrorPayload {
  return isRecord(value) && typeof value.requestId === 'string' && typeof value.error === 'string';
}

function isGroupBalanceCalculation(value: unknown): value is GroupBalanceCalculation {
  return (
    isRecord(value) &&
    typeof value.totalExpenses === 'number' &&
    typeof value.totalPayments === 'number' &&
    typeof value.netBalance === 'number' &&
    typeof value.memberCount === 'number' &&
    typeof value.transactionCount === 'number' &&
    typeof value.averageExpensePerMember === 'number' &&
    Array.isArray(value.memberBalances) &&
    isRecord(value.debtMatrix) &&
    Array.isArray(value.settlementSuggestions) &&
    isRecord(value.performanceMetrics) &&
    typeof value.isCached === 'boolean'
  );
}
