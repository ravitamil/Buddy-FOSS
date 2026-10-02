import type {Transaction} from '@/types';

export const getTransactionError = (...errors: unknown[]): string | null => {
  const error = errors.find((candidate): candidate is Error => candidate instanceof Error);
  return error?.message ?? null;
};

export const prependOptimisticTransaction = (
  transactions: Transaction[],
  transaction: Transaction,
): Transaction[] => [transaction, ...transactions];

export const updateCachedTransaction = (
  transactions: Transaction[],
  id: string,
  updates: Partial<Transaction>,
): Transaction[] =>
  transactions.map((transaction) =>
    transaction.id === id ? {...transaction, ...updates} : transaction,
  );

export const removeCachedTransaction = (transactions: Transaction[], id: string): Transaction[] =>
  transactions.filter((transaction) => transaction.id !== id);

export const createTransactionsWithIds = (
  transactions: Omit<Transaction, 'id'>[],
  createId: () => string,
): Transaction[] =>
  transactions.map((transaction) => ({
    ...transaction,
    id: createId(),
  }));

export const createTransactionExport = (
  transactions: Transaction[],
  exportDate = new Date(),
): {transactions: Transaction[]; exportDate: Date; version: string} => ({
  transactions: [...transactions],
  exportDate,
  version: '1.0.0',
});
