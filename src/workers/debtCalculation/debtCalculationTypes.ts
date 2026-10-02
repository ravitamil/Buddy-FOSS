import type {GroupMember, MemberBalance, Transaction} from '../../types';
import type {GroupBalanceCalculation} from '../../utils/groupBalanceUtils.optimized';

export interface CalculateBalancePayload {
  transactions: Transaction[];
  members: GroupMember[];
  options?: {
    chunkSize?: number;
    enableProgressUpdates?: boolean;
  };
}

export type WorkerMessage =
  | {
      type: 'CALCULATE_BALANCE';
      payload?: CalculateBalancePayload;
      requestId?: string;
    }
  | {
      type: 'CANCEL' | 'PROGRESS';
      requestId?: string;
    };

export interface ProgressMessage {
  type: 'PROGRESS';
  payload: {
    requestId: string;
    progress: number;
    stage: string;
    estimatedTimeRemaining?: number;
  };
}

export interface ResultMessage {
  type: 'RESULT';
  payload: {
    requestId: string;
    result: GroupBalanceCalculation;
    executionTime: number;
  };
}

export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    requestId: string;
    error: string;
  };
}

export interface WorkerCalculationState {
  debtMatrix: Record<string, Record<string, number>>;
  debtTransactionMatrix: Record<string, Record<string, string[]>>;
  memberBalances: Record<string, MemberBalance>;
}

export interface WorkerCalculationTotals {
  totalExpenses: number;
  totalPayments: number;
}

export type WorkerResponse = ProgressMessage | ResultMessage | ErrorMessage;
