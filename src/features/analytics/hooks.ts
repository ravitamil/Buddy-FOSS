/**
 * Derived Analytics Hooks
 *
 * These hooks compute analytics synchronously from existing TanStack Query caches.
 * They do NOT make separate network requests - they read data via queryClient.getQueryData().
 *
 * This eliminates the need for a separate analytics provider because analytics
 * are computed on-demand from cached transaction, category, and budget data.
 */

import {useMemo} from 'react';
import {useBudgets} from '@/features/budgets/queries';
import {useCategories} from '@/features/categories/queries';
import {useTransactions} from '@/features/transactions/queries';

export type {FinancialSummary, SpendingTrend, CategoryComparison} from './utils/calculations';
import {
  calculateFinancialSummary,
  calculateSpendingTrends,
  calculateCategoryComparisons,
  type FinancialSummary,
  type SpendingTrend,
  type CategoryComparison,
} from './utils/calculations';

/**
 * Derived hook that computes financial summary from cached data
 *
 * @param userId - User ID for cache lookup
 * @returns FinancialSummary computed from transaction, category, and budget caches
 */
export function useFinancialSummary(userId: string): FinancialSummary {
  const {data: transactions = []} = useTransactions(userId);
  const {data: categories = []} = useCategories(userId);
  const {data: budgets = []} = useBudgets(userId);

  return useMemo(() => {
    const activeBudget = budgets.find((budget) => budget.isActive) ?? budgets[0] ?? null;

    // Compute summary using pure calculation function
    return calculateFinancialSummary(transactions, categories, activeBudget, new Date(), userId);
  }, [budgets, categories, transactions, userId]);
}

/**
 * Derived hook that computes spending trends from cached transaction data
 *
 * @param userId - User ID for cache lookup
 * @param months - Number of months to analyze (default: 6)
 * @returns Array of SpendingTrend objects
 */
export function useSpendingTrends(userId: string, months: number = 6): SpendingTrend[] {
  const {data: transactions = []} = useTransactions(userId);

  return useMemo(
    () => calculateSpendingTrends(transactions, months, userId),
    [months, transactions, userId],
  );
}

/**
 * Derived hook that computes category comparisons from cached data
 *
 * @param userId - User ID for cache lookup
 * @param months - Number of months to compare (default: 3)
 * @returns Array of CategoryComparison objects
 */
export function useCategoryComparisons(userId: string, months: number = 3): CategoryComparison[] {
  const {data: transactions = []} = useTransactions(userId);
  const {data: categories = []} = useCategories(userId);

  return useMemo(
    () => calculateCategoryComparisons(transactions, categories, months, userId),
    [categories, months, transactions, userId],
  );
}
