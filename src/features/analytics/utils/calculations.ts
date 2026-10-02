/**
 * Pure calculation functions for financial analytics
 *
 * These functions are stateless and synchronous, taking input data
 * and returning computed results. They are used by the derived hooks
 * to compute analytics from query cache data.
 */

import type {Transaction, Category, Budget} from '@/types';
import {getBudgetPeriodBounds} from '@/features/budgets/model/budgetCycle';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    transactionCount: number;
    percentage: number;
  }>;
  budgetHealth: {
    remainingBudget: number;
    averageDailySpending: number;
    isOnTrack: boolean;
  };
}

export interface SpendingTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

/**
 * Calculate financial summary from transactions, categories, and active budget
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  categories: Category[],
  activeBudget: Budget | null,
  referenceDate = new Date(),
  userId?: string,
): FinancialSummary {
  const defaultPeriod = {
    start: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
    endExclusive: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1),
  };
  const period = activeBudget ? getBudgetPeriodBounds(activeBudget, referenceDate) : defaultPeriod;
  const periodTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= period.start && date < period.endExclusive;
  });
  const income = periodTransactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'income', userId),
    0,
  );

  const expenses = periodTransactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense', userId),
    0,
  );

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Category Breakdown
  const expenseTransactions = periodTransactions.filter(
    (transaction) => getUserTransactionAmountForType(transaction, 'expense', userId) > 0,
  );
  const totalExpenseAmount = expenses;
  const categoryMap = new Map<string, {amount: number; count: number}>();

  expenseTransactions.forEach((t) => {
    const categoryKey = t.categoryId ?? t.category;
    const existing = categoryMap.get(categoryKey) || {amount: 0, count: 0};
    categoryMap.set(categoryKey, {
      amount: existing.amount + getUserTransactionAmountForType(t, 'expense', userId),
      count: existing.count + 1,
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryId, data]) => {
    const category = categories.find((c) => c.id === categoryId || c.name === categoryId);
    return {
      category: category?.name || 'Unknown',
      amount: data.amount,
      transactionCount: data.count,
      percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0,
    };
  });

  // Budget Health
  const remainingBudget = activeBudget ? activeBudget.plannedExpenses - expenses : 0;
  const elapsedDays = Math.max(
    1,
    Math.floor((referenceDate.getTime() - period.start.getTime()) / 86_400_000) + 1,
  );
  const averageDailySpending = expenses / elapsedDays;
  const isOnTrack = activeBudget ? expenses <= activeBudget.plannedExpenses : true;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netWorth: income - expenses,
    balance: income - expenses,
    monthlyIncome: income,
    monthlyExpenses: expenses,
    savingsRate,
    categoryBreakdown,
    budgetHealth: {
      remainingBudget,
      averageDailySpending,
      isOnTrack,
    },
  };
}

/**
 * Calculate spending trends over the last N months (default: 6)
 */
export function calculateSpendingTrends(
  transactions: Transaction[],
  months: number = 6,
  userId?: string,
): SpendingTrend[] {
  const monthlyData = new Map<string, {income: number; expenses: number}>();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (transactionDate >= cutoffDate) {
      const monthKey = transactionDate.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyData.get(monthKey) || {income: 0, expenses: 0};

      if (transaction.type === 'income') {
        current.income += getUserTransactionAmountForType(transaction, 'income', userId);
      } else {
        current.expenses += getUserTransactionAmountForType(transaction, 'expense', userId);
      }

      monthlyData.set(monthKey, current);
    }
  });

  const trends = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      savingsRate: data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return trends;
}

/**
 * Calculate category comparisons between current and previous periods
 */
export function calculateCategoryComparisons(
  transactions: Transaction[],
  categories: Category[],
  months: number = 3,
  userId?: string,
): CategoryComparison[] {
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);

  return categories.map((cat) => {
    let currentPeriodSpending = 0;
    let previousPeriodSpending = 0;

    transactions.forEach((transaction) => {
      const matchesCategory =
        transaction.categoryId === cat.id ||
        transaction.category === cat.id ||
        transaction.category?.toLowerCase() === cat.name.toLowerCase();

      if (transaction.type === 'expense' && matchesCategory) {
        const transactionDate = new Date(transaction.date);

        if (transactionDate >= currentPeriodStart && transactionDate < now) {
          currentPeriodSpending += getUserTransactionAmountForType(transaction, 'expense', userId);
        } else if (transactionDate >= previousPeriodStart && transactionDate < currentPeriodStart) {
          previousPeriodSpending += getUserTransactionAmountForType(transaction, 'expense', userId);
        }
      }
    });

    const change = currentPeriodSpending - previousPeriodSpending;
    const changePercentage =
      previousPeriodSpending > 0 ? (change / previousPeriodSpending) * 100 : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      current: currentPeriodSpending,
      previous: previousPeriodSpending,
      change,
      changePercentage,
    };
  });
}
