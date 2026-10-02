import type {Budget, Category, CategoryBudgetAllocation, SavingsGoal, Transaction} from '@/types';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';

export interface BudgetLoanLike {
  status: string;
  emiAmount: number;
}

export interface BudgetSubscriptionLike {
  status: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface BudgetPeriodBounds {
  start: Date;
  endExclusive: Date;
}

export interface BudgetCategoryProgress extends CategoryBudgetAllocation {
  spent: number;
  remaining: number;
  utilizationPercentage: number;
}

export interface BudgetSavingsAllocationProgress {
  goalId: string;
  goalName: string;
  allocatedAmount: number;
  percentageOfIncome: number;
  currentAmount: number;
  targetAmount: number;
}

export interface BudgetCycleModel {
  period: BudgetPeriodBounds;
  plannedIncome: number;
  actualIncome: number;
  plannedVariableSpending: number;
  plannedSavings: number;
  plannedCustomAllocations: number;
  committedLoans: number;
  committedSubscriptions: number;
  committedRecurringExpenses: number;
  totalCommitted: number;
  totalPlannedOutflow: number;
  safeToSpend: number;
  unallocated: number;
  actualSpent: number;
  remainingSpending: number;
  utilizationPercentage: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  financialHealthScore: number;
  daysRemaining: number;
  dailySafeToSpend: number;
  categoryProgress: BudgetCategoryProgress[];
  savingsAllocations: BudgetSavingsAllocationProgress[];
}

function getPeriodMultiplier(budget: Budget, period: BudgetPeriodBounds): number {
  if (budget.period === 'weekly') return 12 / 52;
  if (budget.period === 'yearly') return 12;
  if (budget.period === 'custom') {
    const days = Math.max(1, (period.endExclusive.getTime() - period.start.getTime()) / 86_400_000);
    return days / 30.4375;
  }
  return 1;
}

interface CreateBudgetCycleModelParams {
  budget: Budget;
  transactions: Transaction[];
  categories?: Category[];
  loans?: BudgetLoanLike[];
  subscriptions?: BudgetSubscriptionLike[];
  savingsGoals?: SavingsGoal[];
  referenceDate?: Date;
  userId?: string;
}

const startOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export function getBudgetPeriodBounds(
  budget: Pick<Budget, 'period' | 'periodConfig'>,
  referenceDate = new Date(),
): BudgetPeriodBounds {
  const reference = startOfDay(referenceDate);

  if (budget.period === 'custom' && budget.periodConfig?.startDate && budget.periodConfig.endDate) {
    const start = startOfDay(new Date(budget.periodConfig.startDate));
    const endExclusive = startOfDay(new Date(budget.periodConfig.endDate));
    endExclusive.setDate(endExclusive.getDate() + 1);
    return {start, endExclusive};
  }

  if (budget.period === 'weekly') {
    const start = new Date(reference);
    const mondayOffset = (reference.getDay() + 6) % 7;
    start.setDate(reference.getDate() - mondayOffset);
    const endExclusive = new Date(start);
    endExclusive.setDate(start.getDate() + 7);
    return {start, endExclusive};
  }

  if (budget.period === 'yearly') {
    return {
      start: new Date(reference.getFullYear(), 0, 1),
      endExclusive: new Date(reference.getFullYear() + 1, 0, 1),
    };
  }

  return {
    start: new Date(reference.getFullYear(), reference.getMonth(), 1),
    endExclusive: new Date(reference.getFullYear(), reference.getMonth() + 1, 1),
  };
}

const isInsidePeriod = (date: string, period: BudgetPeriodBounds): boolean => {
  const value = new Date(date);
  return value >= period.start && value < period.endExclusive;
};

const monthlySubscriptionAmount = (subscription: BudgetSubscriptionLike): number => {
  switch (subscription.billingCycle) {
    case 'weekly':
      return (subscription.amount * 52) / 12;
    case 'quarterly':
      return subscription.amount / 3;
    case 'yearly':
      return subscription.amount / 12;
    case 'monthly':
      return subscription.amount;
  }
};

const normalizeCategoryKey = (value?: string): string => value?.trim().toLocaleLowerCase() ?? '';

function getTransactionCategoryKeys(transaction: Transaction, categories: Category[]): Set<string> {
  const keys = new Set<string>();
  const addKey = (value?: string) => {
    const key = normalizeCategoryKey(value);
    if (key) keys.add(key);
  };

  addKey(transaction.categoryId);
  addKey(transaction.category);

  const category = categories.find(
    (candidate) =>
      candidate.id === transaction.categoryId ||
      candidate.id === transaction.category ||
      normalizeCategoryKey(candidate.name) === normalizeCategoryKey(transaction.category),
  );
  addKey(category?.id);
  addKey(category?.name);

  return keys;
}

function calculateCategoryProgress(
  allocations: CategoryBudgetAllocation[],
  expenseTransactions: Transaction[],
  categories: Category[],
  userId?: string,
): BudgetCategoryProgress[] {
  return allocations.map((allocation) => {
    const allocationKeys = new Set([
      normalizeCategoryKey(allocation.categoryId),
      normalizeCategoryKey(allocation.categoryName),
    ]);
    const spent = expenseTransactions.reduce((total, transaction) => {
      const transactionKeys = getTransactionCategoryKeys(transaction, categories);
      const matches = [...allocationKeys].some((key) => key && transactionKeys.has(key));
      return matches ? total + getBudgetTransactionAmount(transaction, userId) : total;
    }, 0);
    const remaining = allocation.amount - spent;

    return {
      ...allocation,
      spent,
      remaining,
      utilizationPercentage: allocation.amount > 0 ? (spent / allocation.amount) * 100 : 0,
    };
  });
}

export function getBudgetTransactionAmount(transaction: Transaction, userId?: string): number {
  return getUserTransactionAmountForType(transaction, 'expense', userId);
}

function calculateHealthScore(params: {
  plannedIncome: number;
  totalPlannedOutflow: number;
  utilizationPercentage: number;
  savingsRate: number;
  debtToIncomeRatio: number;
}): number {
  if (params.plannedIncome <= 0) return 0;

  let score = 100;
  if (params.totalPlannedOutflow > params.plannedIncome) score -= 35;
  if (params.debtToIncomeRatio > 40) score -= 25;
  else if (params.debtToIncomeRatio > 20) score -= 10;
  if (params.savingsRate < 10) score -= 20;
  else if (params.savingsRate < 20) score -= 10;
  if (params.utilizationPercentage > 100) score -= 25;
  else if (params.utilizationPercentage > 85) score -= 10;

  return Math.max(0, Math.round(score));
}

export function createBudgetCycleModel({
  budget,
  transactions,
  categories = [],
  loans = [],
  subscriptions = [],
  savingsGoals = [],
  referenceDate = new Date(),
  userId,
}: CreateBudgetCycleModelParams): BudgetCycleModel {
  const period = getBudgetPeriodBounds(budget, referenceDate);
  const periodMultiplier = getPeriodMultiplier(budget, period);
  const periodTransactions = transactions.filter((transaction) =>
    isInsidePeriod(transaction.date, period),
  );
  const expenseTransactions = periodTransactions.filter(
    (transaction) => transaction.type === 'expense',
  );
  const actualSpent = expenseTransactions.reduce(
    (total, transaction) => total + getBudgetTransactionAmount(transaction, userId),
    0,
  );
  const actualIncome = periodTransactions.reduce(
    (total, transaction) => total + getUserTransactionAmountForType(transaction, 'income', userId),
    0,
  );
  const committedLoans =
    loans
      .filter((loan) => loan.status.toLocaleUpperCase() === 'ACTIVE')
      .reduce((total, loan) => total + Math.max(0, loan.emiAmount), 0) * periodMultiplier;
  const committedSubscriptions =
    subscriptions
      .filter((subscription) => subscription.status.toLocaleLowerCase() === 'active')
      .reduce((total, subscription) => total + monthlySubscriptionAmount(subscription), 0) *
    periodMultiplier;
  const committedRecurringExpenses =
    (budget.linkedRecurringItems ?? [])
      .filter((item) => item.type === 'expense')
      .reduce((total, item) => total + Math.max(0, item.amount), 0) * periodMultiplier;
  const totalCommitted = committedLoans + committedSubscriptions + committedRecurringExpenses;
  const plannedCustomAllocations =
    budget.customSplits.reduce((total, split) => total + Math.max(0, split.amount), 0) *
    periodMultiplier;
  const plannedIncome = Math.max(0, budget.monthlyIncome) * periodMultiplier;
  const plannedVariableSpending = Math.max(0, budget.plannedExpenses) * periodMultiplier;
  const plannedSavings = Math.max(0, budget.plannedSavings) * periodMultiplier;
  const totalPlannedOutflow =
    plannedVariableSpending + totalCommitted + plannedSavings + plannedCustomAllocations;
  const safeToSpend = Math.max(
    0,
    plannedIncome - totalCommitted - plannedSavings - plannedCustomAllocations,
  );
  const remainingSpending = plannedVariableSpending + totalCommitted - actualSpent;
  const spendingPlan = plannedVariableSpending + totalCommitted;
  const utilizationPercentage = spendingPlan > 0 ? (actualSpent / spendingPlan) * 100 : 0;
  const savingsRate = plannedIncome > 0 ? (plannedSavings / plannedIncome) * 100 : 0;
  const debtToIncomeRatio = plannedIncome > 0 ? (committedLoans / plannedIncome) * 100 : 0;
  const endDay = new Date(period.endExclusive);
  endDay.setDate(endDay.getDate() - 1);
  const remainingMilliseconds = startOfDay(endDay).getTime() - startOfDay(referenceDate).getTime();
  const daysRemaining = Math.max(0, Math.floor(remainingMilliseconds / 86_400_000) + 1);
  const financialHealthScore = calculateHealthScore({
    plannedIncome,
    totalPlannedOutflow,
    utilizationPercentage,
    savingsRate,
    debtToIncomeRatio,
  });
  const categoryProgress = calculateCategoryProgress(
    (budget.categoryAllocations ?? []).map((allocation) => ({
      ...allocation,
      amount: allocation.amount * periodMultiplier,
    })),
    expenseTransactions,
    categories,
    userId,
  );
  const savingsAllocations = (budget.savingsGoalsAllocation ?? []).map((allocation) => {
    const goal = savingsGoals.find((candidate) => candidate.id === allocation.goalId);
    return {
      ...allocation,
      allocatedAmount: allocation.allocatedAmount * periodMultiplier,
      goalName: goal?.name ?? 'Savings goal',
      currentAmount: goal?.currentAmount ?? 0,
      targetAmount: goal?.targetAmount ?? 0,
    };
  });

  return {
    period,
    plannedIncome,
    actualIncome,
    plannedVariableSpending,
    plannedSavings,
    plannedCustomAllocations,
    committedLoans,
    committedSubscriptions,
    committedRecurringExpenses,
    totalCommitted,
    totalPlannedOutflow,
    safeToSpend,
    unallocated: plannedIncome - totalPlannedOutflow,
    actualSpent,
    remainingSpending,
    utilizationPercentage,
    savingsRate,
    debtToIncomeRatio,
    financialHealthScore,
    daysRemaining,
    dailySafeToSpend: daysRemaining > 0 ? Math.max(0, remainingSpending) / daysRemaining : 0,
    categoryProgress,
    savingsAllocations,
  };
}

export function findCategoryBudgetProgress(
  model: BudgetCycleModel,
  category: Pick<Category, 'id' | 'name'> | null,
): BudgetCategoryProgress | null {
  if (!category) return null;
  const id = normalizeCategoryKey(category.id);
  const name = normalizeCategoryKey(category.name);
  return (
    model.categoryProgress.find(
      (progress) =>
        normalizeCategoryKey(progress.categoryId) === id ||
        normalizeCategoryKey(progress.categoryName) === name,
    ) ?? null
  );
}
