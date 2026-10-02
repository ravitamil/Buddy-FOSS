/**
 * Analytics Feature Module - Barrel Export
 *
 * This module provides derived hooks for financial analytics that compute
 * synchronously from existing TanStack Query caches.
 *
 * No separate queries or network requests are made - all data is read from
 * cached transaction, category, and budget data via queryClient.getQueryData().
 */

export {useFinancialSummary, useSpendingTrends, useCategoryComparisons} from './hooks';
export {AnalyticsGlassCard, AnalyticsPeriodSelector} from './components';

export type {FinancialSummary, SpendingTrend, CategoryComparison} from './hooks';

export {
  calculateFinancialSummary,
  calculateSpendingTrends,
  calculateCategoryComparisons,
} from './utils/calculations';
