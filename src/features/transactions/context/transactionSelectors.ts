import type {Transaction} from '@/types';
import {getUserTransactionAmountForType} from '../transactionAmounts';

const getCategoryId = (transaction: Transaction): string => {
  return typeof transaction.category === 'object' && transaction.category !== null
    ? (transaction.category as {id: string}).id
    : transaction.category;
};

export const getTransactionsByCategoryId = (
  transactions: Transaction[],
  categoryId: string,
): Transaction[] => transactions.filter((transaction) => getCategoryId(transaction) === categoryId);

export const getTransactionsBetweenDates = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
): Transaction[] =>
  transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

export const getTransactionIncomeTotal = (transactions: Transaction[], userId?: string): number =>
  transactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'income', userId),
    0,
  );

export const getTransactionExpenseTotal = (transactions: Transaction[], userId?: string): number =>
  transactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense', userId),
    0,
  );

export const getTransactionMonthlySpendingTrend = (
  transactions: Transaction[],
  userId?: string,
): Array<{month: string; amount: number}> => {
  const monthlyData = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (transaction.type === 'expense') {
      const monthKey = new Date(transaction.date).toISOString().slice(0, 7);
      const currentAmount = monthlyData.get(monthKey) || 0;
      monthlyData.set(
        monthKey,
        currentAmount + getUserTransactionAmountForType(transaction, 'expense', userId),
      );
    }
  });

  return Array.from(monthlyData.entries())
    .map(([month, amount]) => ({month, amount}))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getTransactionCategoryTotal = (
  transactions: Transaction[],
  categoryId: string,
  userId?: string,
): number =>
  transactions
    .filter((transaction) => getCategoryId(transaction) === categoryId)
    .reduce(
      (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense', userId),
      0,
    );
