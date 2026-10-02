import type {
  Budget,
  BudgetPeriod,
  BudgetSplit,
  CategoryBudgetAllocation,
  IncomeSource,
  RecurringBudgetItem,
} from '@/types';

import type {BudgetSetupTotalsViewModel} from './useBudgetSetupScreenTypes';

interface RecurringTemplateLike {
  id: string;
  description: string;
  amount: number;
  type: RecurringBudgetItem['type'];
}

export function isValidNumericInput(value: string): boolean {
  if (value === '') return true;
  if (value === '.') return false;
  if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) return false;

  const numericRegex = /^\d+(\.\d{1,2})?$/;
  if (!numericRegex.test(value)) return false;

  const numericValue = Number.parseFloat(value);
  return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= 999999999;
}

export function toRecurringBudgetItems(templates: RecurringTemplateLike[]): RecurringBudgetItem[] {
  return templates.map((template) => ({
    templateId: template.id,
    description: template.description,
    amount: template.amount,
    categoryId: undefined,
    type: template.type,
    isAutoPopulated: true,
  }));
}

export function getRecurringExpensesTotal(items: RecurringBudgetItem[]): number {
  return items
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
}

export function calculateBudgetSetupTotals(params: {
  monthlyIncome: string;
  plannedExpenses: string;
  plannedSavings: string;
  customSplits: BudgetSplit[];
  committedLoanAmount?: number;
  committedSubscriptionAmount?: number;
  committedRecurringAmount?: number;
}): BudgetSetupTotalsViewModel {
  const incomeAmount = Number.parseFloat(params.monthlyIncome) || 0;
  const expensesAmount = Number.parseFloat(params.plannedExpenses) || 0;
  const savingsAmount = Number.parseFloat(params.plannedSavings) || 0;
  const splitsTotal = params.customSplits.reduce((sum, split) => sum + split.amount, 0);
  const committedLoanAmount = params.committedLoanAmount ?? 0;
  const committedSubscriptionAmount = params.committedSubscriptionAmount ?? 0;
  const committedRecurringAmount = params.committedRecurringAmount ?? 0;
  const totalCommittedAmount =
    committedLoanAmount + committedSubscriptionAmount + committedRecurringAmount;
  const totalAllocations = expensesAmount + savingsAmount + splitsTotal + totalCommittedAmount;

  return {
    incomeAmount,
    expensesAmount,
    savingsAmount,
    totalAllocations,
    remainingAmount: incomeAmount - totalAllocations,
    committedLoanAmount,
    committedSubscriptionAmount,
    committedRecurringAmount,
    totalCommittedAmount,
  };
}

export function createBudgetSplit(params: {
  name: string;
  amountText: string;
  monthlyIncome: string;
  splitCount: number;
}): BudgetSplit {
  const amount = Number.parseFloat(params.amountText);
  const totalIncome = Number.parseFloat(params.monthlyIncome) || 0;
  const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;

  return {
    id: Date.now().toString(),
    name: params.name.trim(),
    amount,
    percentage: Math.round(percentage * 100) / 100,
    color: '$colorSubtitle',
  };
}

export function createIncomeSource(params: {
  name: string;
  amountText: string;
  type: IncomeSource['type'];
  sourceCount: number;
}): IncomeSource {
  return {
    id: Date.now().toString(),
    name: params.name.trim(),
    amount: Number.parseFloat(params.amountText),
    type: params.type,
    frequency: 'monthly',
    isRecurring: true,
  };
}

export function createBudgetPayload(params: {
  planName: string;
  monthlyIncome: string;
  currencyCode: string;
  plannedExpenses: string;
  plannedSavings: string;
  customSplits: BudgetSplit[];
  selectedPeriod: BudgetPeriod;
  enableCategoryBudgets: boolean;
  categoryAllocations: CategoryBudgetAllocation[];
  trackIncomeSources: boolean;
  incomeSources: IncomeSource[];
  autoPopulateFromRecurring: boolean;
  linkedRecurringItems: RecurringBudgetItem[];
  savingsGoalAllocations: NonNullable<Budget['savingsGoalsAllocation']>;
}): Omit<Budget, 'id'> {
  return {
    name: params.planName.trim(),
    currencyCode: params.currencyCode,
    monthlyIncome: Number.parseFloat(params.monthlyIncome),
    plannedExpenses: Number.parseFloat(params.plannedExpenses) || 0,
    plannedSavings: Number.parseFloat(params.plannedSavings) || 0,
    customSplits: params.customSplits,
    period: params.selectedPeriod,
    periodConfig: {type: params.selectedPeriod, rolloverEnabled: false},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryAllocations: params.enableCategoryBudgets ? params.categoryAllocations : undefined,
    enableCategoryAlerts: params.enableCategoryBudgets,
    incomeSources: params.trackIncomeSources ? params.incomeSources : undefined,
    trackIncomeSources: params.trackIncomeSources,
    linkedRecurringItems: params.autoPopulateFromRecurring
      ? params.linkedRecurringItems
      : undefined,
    autoPopulateFromRecurring: params.autoPopulateFromRecurring,
    savingsGoalsAllocation: params.savingsGoalAllocations,
  };
}
