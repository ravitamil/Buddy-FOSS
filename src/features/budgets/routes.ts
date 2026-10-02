const budgetSetupPath = '/budget-setup';
const budgetDetailsPath = '/budget-details';

export type BudgetCreateRoute = '/budget-setup?mode=create';
export type BudgetEditRoute = `/budget-setup?budgetId=${string}`;
export type BudgetDetailsRoute = `/budget-details?budgetId=${string}`;

export const budgetRoutes = {
  create: (): BudgetCreateRoute => `${budgetSetupPath}?mode=create`,
  edit: (budgetId: string): BudgetEditRoute =>
    `${budgetSetupPath}?budgetId=${encodeURIComponent(budgetId)}`,
  details: (budgetId: string): BudgetDetailsRoute =>
    `${budgetDetailsPath}?budgetId=${encodeURIComponent(budgetId)}`,
};
