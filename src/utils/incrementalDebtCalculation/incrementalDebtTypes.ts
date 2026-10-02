import type {MemberDebt, Transaction} from '../../types';
import type {MemberBalance} from '../groupBalanceUtils.optimized';

export interface TransactionDependency {
  transactionId: string;
  affectsDebts: string[];
  affectedMembers: string[];
  lastModified: number;
}

export interface DebtMatrixDelta {
  added: Array<{creditorId: string; debtorId: string; amount: number}>;
  modified: Array<{creditorId: string; debtorId: string; oldAmount: number; newAmount: number}>;
  removed: Array<{creditorId: string; debtorId: string; amount: number}>;
}

export interface IncrementalUpdate {
  transactionId: string;
  memberId: string;
  delta: number;
  affectedDebts: string[];
}

export interface CachedDebtState {
  debtMatrix: Record<string, Record<string, number>>;
  memberBalances: Record<string, MemberBalance>;
  transactionDependencies: Map<string, TransactionDependency>;
  lastTransactionHash: string;
  version: number;
}

export type SettlementReceiver = Transaction['receivedBy'];
export type DebtList = MemberDebt[];
