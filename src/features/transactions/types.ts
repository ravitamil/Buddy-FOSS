import type {Category, RecurrenceFrequency, Transaction} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';

export type {Transaction} from '@/types';

export type TransactionTypeFilter = 'income' | 'expense' | 'all';

export type TransactionSortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'category'
  | 'type';

export type TransactionGroupingOption = 'none' | 'date' | 'category' | 'type' | 'group';

export interface TransactionGroupSection {
  title: string;
  data: Transaction[];
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface TransactionAnalyticsDatum {
  value: number;
  color: string;
  label: string;
  text: string;
}

export interface TransactionCategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: Category['type'];
}

export interface TransactionListItemViewModel {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: Transaction['type'];
  category: {
    name: string;
    icon: string;
    color: string;
  };
  groupName: string | null;
  groupEmoji?: string;
  settlementStatus?: 'settled' | 'unsettled' | 'partial';
  isRecurring: boolean;
  recurrenceFrequency?: string;
}

export interface TransactionScreenGroups {
  items: EnhancedGroup[];
}

export type AddTransactionRouteType = Extract<Transaction['type'], 'income' | 'expense'>;

export interface RecurrenceFrequencyOption {
  value: RecurrenceFrequency;
  label: string;
}

export interface RecurringTransactionTemplateResult {
  id: string;
  nextOccurrenceDate: string;
}
