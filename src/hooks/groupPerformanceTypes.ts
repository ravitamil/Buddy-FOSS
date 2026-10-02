import type {GroupMember, Transaction} from '../types';

export interface TransactionFilters {
  type?: 'expense' | 'income' | 'all';
  memberId?: string;
  dateRange?: {start: Date; end: Date};
  amountRange?: {min: number; max: number};
  searchTerm?: string;
}

export interface TransactionFilterResult {
  transactions: Transaction[];
  count: number;
  totalAmount: number;
  hasResults: boolean;
}

export interface MemberActivityResult {
  member: GroupMember;
  totalPaid: number;
  totalOwed: number;
  balance: number;
  paidTransactionCount: number;
  involvedTransactionCount: number;
  totalTransactionCount: number;
  recentPaidCount: number;
  recentInvolvedCount: number;
  recentPaidAmount: number;
  lastPaidDate: Date | null;
  lastInvolvedDate: Date | null;
  isActive: boolean;
  hasBalance: boolean;
  owes: boolean;
  isOwed: boolean;
}

export interface GroupPerformanceMetrics {
  transactionCount: number;
  memberCount: number;
  complexityScore: number;
  recommendations: string[];
  isLargeGroup: boolean;
  hasManyTransactions: boolean;
  needsOptimization: boolean;
}
