import type {Budget} from '@/types';

export interface BudgetRemovalResult {
  budgets: Budget[];
  activeBudgetId: string | null;
}

export const getActiveBudget = (budgets: Budget[]): Budget | null =>
  budgets.find((budget) => budget.isActive) ?? budgets[0] ?? null;

export const withActiveBudget = (budgets: Budget[], activeBudgetId: string | null): Budget[] =>
  budgets.map((budget) => ({
    ...budget,
    isActive: activeBudgetId !== null && budget.id === activeBudgetId,
  }));

export const removeBudgetWithActiveFallback = (
  budgets: Budget[],
  budgetId: string,
): BudgetRemovalResult => {
  const currentActiveBudgetId = getActiveBudget(budgets)?.id ?? null;
  const remainingBudgets = budgets.filter((budget) => budget.id !== budgetId);
  const activeBudgetId =
    remainingBudgets.find((budget) => budget.id === currentActiveBudgetId)?.id ??
    remainingBudgets[0]?.id ??
    null;

  return {
    budgets: withActiveBudget(remainingBudgets, activeBudgetId),
    activeBudgetId,
  };
};
