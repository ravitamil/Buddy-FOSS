/**
 * Context Index - Domain Access
 *
 * Focused runtime contexts remain for auth, settings, transactions, groups,
 * loans, subscriptions, investments, and UI concerns.
 *
 * Budget, savings, and wallet access should come from feature hooks.
 */

// Core Context Architecture (5 focused contexts)
export {AuthProvider, useAuth} from './AuthContext';
export type {AuthContextType} from '../types/context-foundation';

export {UserProvider, useUser} from './UserContext';
export type {UserContextType} from './UserContext';

export {SettingsProvider, useSettings} from './SettingsContext';
export type {SettingsContextType} from './SettingsContext';

// Modular Financial Contexts (Replaces EnhancedFinancialContext god object)
export {TransactionProvider, useTransaction} from './TransactionContext';
export type {TransactionContextType} from './TransactionContext';

export {CategoryProvider, useCategory} from './CategoryContext';
export type {CategoryContextType} from './CategoryContext';

export {
  useFinancialSummary as useFinancialAnalytics,
  useSpendingTrends,
  useCategoryComparisons,
} from '@/features/analytics';
export type {FinancialSummary, SpendingTrend, CategoryComparison} from '@/features/analytics';

// Modular Tracker Contexts
export {LoanQueryProvider as LoanProvider, useLoanQuery as useLoan} from './LoanContext.query';
export type {LoanContextType} from './LoanContext.query';

export {
  SubscriptionQueryProvider as SubscriptionProvider,
  useSubscriptionQuery as useSubscription,
} from './SubscriptionContext.query';
export type {SubscriptionContextType} from './SubscriptionContext.query';

export {InvestmentProvider, useInvestment} from './InvestmentContext';
export type {InvestmentContextType} from './InvestmentContext';

export {GroupProvider, useGroups} from './GroupContext';
export type {GroupContextType} from '@/features/groups/context/groupContextTypes';

// Utility contexts
export {ToastProvider, useToast} from './ToastContext';

// Feature module re-exports
export {useTransactions as useTransactionsQuery} from '@/features/transactions/queries';
export {useCategories as useCategoriesQuery} from '@/features/categories/queries';
export {useBudgetState as useBudget} from '@/features/budgets/hooks/useBudgetState';
export type {BudgetFeatureState as BudgetContextType} from '@/features/budgets/hooks/useBudgetState';
export {useBudgets as useBudgetsQuery} from '@/features/budgets/queries';
export {useSavingsState as useSavings} from '@/features/savings/hooks/useSavingsState';
export type {SavingsFeatureState as SavingsContextType} from '@/features/savings/hooks/useSavingsState';
export {useSavings as useSavingsQuery} from '@/features/savings/queries';
export {useWallets as useWalletsQuery} from '@/features/wallets/queries';
export {useGroups as useGroupsQuery} from '@/features/groups/queries';
export {useLoans as useLoansQuery} from '@/features/loans/queries';
export {useSubscriptions as useSubscriptionsQuery} from '@/features/subscriptions/queries';
export {useInvestments as useInvestmentsQuery} from '@/features/investments/queries';
