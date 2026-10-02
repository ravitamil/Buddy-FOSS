import type {Transaction} from '@/types';

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;

  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  addManyTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<Transaction[]>;
  deleteManyTransactions: (ids: string[]) => Promise<void>;

  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];
  findTransactions: (predicate: (transaction: Transaction) => boolean) => Transaction[];

  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetAmount: () => number;
  getMonthlySpendingTrend: () => Array<{month: string; amount: number}>;
  getCategoryTotal: (categoryId: string) => number;

  importTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<Transaction[]>;
  exportTransactions: () => {transactions: Transaction[]; exportDate: Date; version: string};
  syncWithRemote: () => Promise<void>;
  syncEntityWithRemote: (id: string) => Promise<void>;
  loadFromRemote: () => Promise<void>;
}
