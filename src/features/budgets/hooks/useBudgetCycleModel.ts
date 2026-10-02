import {useMemo} from 'react';

import {useCategory} from '@/context/CategoryContext';
import {useLoanQuery} from '@/context/LoanContext.query';
import {useSubscriptionQuery} from '@/context/SubscriptionContext.query';
import {useTransaction} from '@/context/TransactionContext';
import {useSavingsState} from '@/features/savings/hooks/useSavingsState';
import type {Budget} from '@/types';
import {useAuth} from '@/context/AuthContext';

import {createBudgetCycleModel, type BudgetCycleModel} from '../model/budgetCycle';

export function useBudgetCycleModel(budget: Budget | null | undefined): BudgetCycleModel | null {
  const {transactions} = useTransaction();
  const {categories} = useCategory();
  const {loans} = useLoanQuery();
  const {subscriptions} = useSubscriptionQuery();
  const {savingsGoals} = useSavingsState();
  const {user} = useAuth();

  return useMemo(() => {
    if (!budget) return null;

    return createBudgetCycleModel({
      budget,
      transactions,
      categories,
      loans: loans.items,
      subscriptions,
      savingsGoals,
      userId: user?.uid,
    });
  }, [budget, categories, loans.items, savingsGoals, subscriptions, transactions, user?.uid]);
}
