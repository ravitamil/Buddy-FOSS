import type {SplitDetail, Transaction} from './transaction.types';

export interface Group {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  members: GroupMember[];
  transactions: Transaction[];
  createdAt: Date;
  createdBy: string;
  currency?: string;
  isActive?: boolean;
  settings?: GroupSettings;
}

export interface GroupMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  joinedAt: Date;
  isActive: boolean;
  role: 'creator' | 'member';
  lastActivity?: Date;
  supabaseUserId?: string;
}

export interface GroupSettings {
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  defaultSplitMethod: 'equal' | 'custom' | 'percentage' | 'shares';
  notificationPreferences: {
    newExpenses: boolean;
    payments: boolean;
    reminders: boolean;
  };
  expenseCategories: string[];
  groupCurrency?: string;
  settlementStrategy?: 'pairwise' | 'minimize_transactions';
}

export interface MemberDebt {
  creditorId: string;
  creditorName: string;
  debtorId: string;
  debtorName: string;
  amount: number;
  transactionIds: string[];
  settledTransactionIds?: string[];
  lastUpdated: Date;
}

export interface SettlementSuggestion {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  description: string;
  resolvesDebts: MemberDebt[];
  priority: number;
  strategyUsed?: 'pairwise' | 'minimize_transactions';
  routingTrace?: {
    from: string;
    to: string;
    via: string[];
    amount: number;
  };
}

export interface GroupExpense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  splitAmong: string[];
  date: Date;
  category: string;
  categoryId?: string;
  splitMethod: 'equal' | 'custom' | 'percentage' | 'shares';
  splitDetails: SplitDetail[];
  receiptUrl?: string;
  receiptUrls?: string[];
  notes?: string;
  approvedBy?: string[];
  isApproved?: boolean;
}

export interface GroupStatistics {
  totalExpenses: number;
  totalPayments: number;
  netBalance: number;
  memberCount: number;
  transactionCount: number;
  averageExpensePerMember: number;
  lastActivityDate: Date;
  memberBalances: MemberBalance[];
  topExpenseCategories: ExpenseCategory[];
  monthlyTrends: MonthlyTrend[];
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  percentageOfTotalExpenses: number;
  outstandingDebts: MemberDebt[];
  creditedAmounts: MemberDebt[];
  creditBalance: number;
  advancePayments: Record<string, number>;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransactionAmount?: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalExpenses: number;
  transactionCount: number;
  averagePerTransaction: number;
}
