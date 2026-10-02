export interface BudgetData {
  budgetName?: string;
  period?: string;
  daysRemaining?: number;
  periodLabel: string;
  periodStart: string;
  periodEndExclusive: string;
  monthlyIncome: number;
  plannedExpenses: number;
  plannedSavings: number;
  actualSpent: number;
  actualIncome: number;
  totalSpendingPlan: number;
  remainingSpending: number;
  utilizationPercentage: number;
  dailySafeToSpend: number;
  customSplits: {
    id: string;
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  monthlyLoanEMIs?: number;
  monthlySubscriptions?: number;
  monthlyRecurringExpenses?: number;
  financialHealthScore?: number;
  topBudgetCategories: BudgetCategorySummary[];
}

export interface BudgetPlanningCardProps {
  budgetData: BudgetData;
  formatCurrency: (amount: number) => string;
  onEditBudget: () => void;
  onViewDetails: () => void;
  onSetupBudget: () => void;
}

export interface BudgetCategorySummary {
  name: string;
  amount: number;
  icon: string;
  color: string;
}
