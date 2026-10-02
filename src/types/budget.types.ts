export interface BudgetSplit {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CategoryBudgetAllocation {
  categoryId: string;
  categoryName: string;
  amount: number;
  color?: string;
  icon?: string;
  alertThreshold?: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  type: 'salary' | 'freelance' | 'investment' | 'rental' | 'business' | 'other';
  frequency: 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'annually' | 'one_time';
  isRecurring: boolean;
  nextExpectedDate?: Date;
  color?: string;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface BudgetPeriodConfig {
  type: BudgetPeriod;
  startDate?: Date;
  endDate?: Date;
  rolloverEnabled?: boolean;
  rolloverAmount?: number;
}

export interface RecurringBudgetItem {
  templateId: string;
  description: string;
  amount: number;
  categoryId?: string;
  type: 'income' | 'expense';
  isAutoPopulated: boolean;
}

export interface BudgetSuggestion {
  categoryId: string;
  categoryName: string;
  currentBudget: number;
  suggestedBudget: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  createdAt: string;
  isAccepted: boolean;
}

export interface SpendingPattern {
  categoryId: string;
  categoryName: string;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  monthlyAmounts: number[];
  lastUpdated: string;
}

export interface Budget {
  id: string;
  name: string;
  currencyCode: string;
  monthlyIncome: number;
  plannedExpenses: number;
  plannedSavings: number;
  customSplits: BudgetSplit[];
  period: BudgetPeriod;
  periodConfig?: BudgetPeriodConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryAllocations?: CategoryBudgetAllocation[];
  enableCategoryAlerts?: boolean;
  incomeSources?: IncomeSource[];
  trackIncomeSources?: boolean;
  linkedRecurringItems?: RecurringBudgetItem[];
  autoPopulateFromRecurring?: boolean;
  savingsGoalsAllocation?: {
    goalId: string;
    allocatedAmount: number;
    percentageOfIncome: number;
  }[];
  emergencyFundTarget?: number;
}
