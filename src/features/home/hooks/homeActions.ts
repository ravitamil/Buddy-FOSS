import type {HomeScreenModel} from '../types';
import {budgetRoutes} from '@/features/budgets/routes';

interface CreateHomeActionsParams {
  navigate: (path: string) => void;
  scrollToTop: () => void;
  hasActiveBudget: boolean;
  activeBudgetId?: string;
  retirementGoalId?: string;
}

export const createHomeActions = ({
  navigate,
  scrollToTop,
  hasActiveBudget,
  activeBudgetId,
  retirementGoalId,
}: CreateHomeActionsParams): HomeScreenModel['actions'] => {
  void hasActiveBudget;

  return {
    scrollToTop,
    openProfile: () => navigate('/profile-settings'),
    openNotifications: () => navigate('/active-notifications'),
    openAnalytics: () => navigate('/analytics'),
    openTransactions: () => navigate('/transactions'),
    editBudget: () =>
      navigate(activeBudgetId ? budgetRoutes.edit(activeBudgetId) : budgetRoutes.create()),
    viewBudgetDetails: () =>
      navigate(activeBudgetId ? budgetRoutes.details(activeBudgetId) : budgetRoutes.create()),
    setupBudget: () => navigate(budgetRoutes.create()),
    openDebtPayoff: () => navigate('/debt-payoff'),
    openRetirement: () =>
      navigate(retirementGoalId ? `/savings/${retirementGoalId}` : '/retirement-planning'),
    openNetWorth: () => navigate('/net-worth'),
    openGroups: () => navigate('/groups'),
    addGroup: () => navigate('/add-group'),
    addTransaction: () => navigate('/add-transaction'),
  };
};
