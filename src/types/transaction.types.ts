import type {RecurrenceFrequency} from './common.types';

export interface SplitDetail {
  memberId: string;
  memberName: string;
  amount: number;
  percentage?: number;
  shares?: number;
  isPaid?: boolean;
  settledAmount?: number;
  settledDate?: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  categoryId?: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  groupId?: string;
  groupName?: string;
  groupEmoji?: string;
  paidBy?: string;
  splitAmong?: string[];
  splitAmounts?: Record<string, number>;
  splitMethod?: 'equal' | 'custom' | 'percentage' | 'shares';
  splitDetails?: SplitDetail[];
  isSettlement?: boolean;
  settledDebts?: string[];
  settledDebtAmounts?: Record<string, number>;
  receivedBy?: string[];
  receiptUrl?: string;
  receiptUrls?: string[];
  notes?: string;
  createdBy?: string;
  lastModified?: Date;
  transactionCurrency?: string;
  fxRateApplied?: number;
  loanId?: string;
  subscriptionId?: string;
  savingsGoalId?: string;
  walletId?: string;
  tags?: string[];
  scheduledDate?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  isRecurring?: boolean;
  parentRecurringId?: string;
  recurrenceEndDate?: string;
  nextOccurrenceDate?: string;
}

export interface RecurringTransaction {
  id: string;
  templateId: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  recurrenceFrequency: RecurrenceFrequency;
  nextOccurrenceDate: string;
  recurrenceEndDate?: string;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  notes?: string;
}

export interface RecurringTransactionTemplate {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  recurrenceFrequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrenceDate: string;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  notes?: string;
}
