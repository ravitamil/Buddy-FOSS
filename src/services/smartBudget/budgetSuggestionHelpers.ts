import {Budget, BudgetSuggestion, SpendingPattern, Transaction} from '../../types';
import {FinancialGoal} from './types';

export const calculateCategorySpending = (transactions: Transaction[]): Map<string, number> => {
  const categorySpending = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const categoryKey = transaction.categoryId ?? transaction.category;
      const current = categorySpending.get(categoryKey) || 0;
      categorySpending.set(categoryKey, current + Math.abs(transaction.amount));
    });

  return categorySpending;
};

export const calculateSuggestedBudget = (
  categoryId: string,
  actualSpending: number,
  currentBudget: number,
  spendingPatterns: SpendingPattern[],
): number => {
  const pattern = spendingPatterns.find((item) => item.categoryId === categoryId);

  if (!pattern) {
    return actualSpending > 0 ? actualSpending : currentBudget;
  }

  if (actualSpending > currentBudget * 1.1 && pattern.trend !== 'decreasing') {
    return Math.round((actualSpending * 1.1) / 100) * 100;
  }

  if (actualSpending < currentBudget * 0.8 && pattern.trend !== 'increasing') {
    return Math.round((actualSpending * 1.1) / 100) * 100;
  }

  const average = (actualSpending + currentBudget) / 2;
  if (Math.abs(average - currentBudget) > currentBudget * 0.05) {
    return Math.round(average / 100) * 100;
  }

  return currentBudget;
};

export const generateReason = (
  actualSpending: number,
  suggestedBudget: number,
  pattern?: SpendingPattern,
): string => {
  const diff = suggestedBudget - actualSpending;

  if (diff > 0) {
    let reason = `Your ${pattern?.categoryName || 'spending'} is trending ${pattern?.trend || 'stable'}. `;
    reason += `Consider increasing the allocation by ${Math.abs(diff).toLocaleString()} to accommodate growth.`;
    if (pattern?.volatility && pattern.volatility > 0.3) {
      reason += ' High variability detected - consider adding buffer.';
    }
    return reason;
  }

  if (diff < 0) {
    return `You're underutilizing this category by ${Math.abs(diff).toLocaleString()}. Consider reallocating to savings or other priorities.`;
  }

  return 'Your spending aligns well with your current budget allocation.';
};

export const calculatePriority = (
  actualSpending: number,
  currentBudget: number,
  pattern?: SpendingPattern,
): 'high' | 'medium' | 'low' => {
  const deviation = Math.abs(actualSpending - currentBudget) / currentBudget;

  if (deviation > 0.25 && pattern?.trend === 'increasing') {
    return 'high';
  }
  if (deviation > 0.2 || (deviation > 0.15 && pattern?.trend === 'increasing')) {
    return 'medium';
  }
  return 'low';
};

export const calculateImpact = (actualSpending: number, suggestedBudget: number): string => {
  const diff = suggestedBudget - actualSpending;

  if (diff > 0) {
    return `May increase spending by ${diff.toLocaleString()} to better reflect actual needs.`;
  }

  if (diff < 0) {
    return `Could free up ${Math.abs(diff).toLocaleString()} for savings or other categories.`;
  }

  return 'Minimal impact - maintains current spending alignment.';
};

export const calculateGoalAdjustment = (
  goals: FinancialGoal[],
  transactions: Transaction[],
): number => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const currentSavings = totalIncome - totalExpenses;

  const additionalSavingsNeeded = goals.reduce((total, goal) => {
    const monthlyTarget = goal.targetSavings / goal.timeline;
    return total + Math.max(0, monthlyTarget - currentSavings);
  }, 0);

  return Math.round(additionalSavingsNeeded);
};

export const createGoalSuggestion = (
  currentBudget: Budget,
  goals: FinancialGoal[],
  goalAdjustment: number,
): BudgetSuggestion => ({
  categoryId: 'overall',
  categoryName: 'Overall Budget',
  currentBudget: currentBudget.plannedExpenses,
  suggestedBudget: currentBudget.plannedExpenses - goalAdjustment,
  reason: `Adjust to meet your savings goals: ${goals
    .map((goal) => `${goal.targetSavings.toLocaleString()} in ${goal.timeline} months`)
    .join(', ')}`,
  priority: 'high',
  expectedImpact: `Potential savings increase of ${goalAdjustment.toLocaleString()}`,
  createdAt: new Date().toISOString(),
  isAccepted: false,
});

export const sortBudgetSuggestions = (suggestions: BudgetSuggestion[]): BudgetSuggestion[] => {
  const priorityOrder = {high: 0, medium: 1, low: 2};
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
