import {Budget, SpendingPattern, Transaction} from '../../types';
import {BudgetHealthScore, SpendingPrediction} from './types';

export function calculateBudgetHealthScore(
  currentBudget: Budget,
  transactions: Transaction[],
): BudgetHealthScore {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const recommendations: string[] = [];
  let score = 100;

  const budgetUtilization =
    currentBudget.plannedExpenses > 0 ? expenses / currentBudget.plannedExpenses : 1;

  if (budgetUtilization > 1.2) {
    score -= 20;
    recommendations.push(
      'Expenses exceed budget by more than 20%. Consider reviewing non-essential spending.',
    );
  } else if (budgetUtilization > 1.1) {
    score -= 10;
    recommendations.push('Approaching budget limit. Monitor spending closely.');
  } else if (budgetUtilization < 0.7) {
    score -= 5;
    recommendations.push(
      'Low budget utilization. Consider increasing savings or reallocating to goals.',
    );
  }

  if (savingsRate < 0) {
    score -= 30;
    recommendations.push('Negative savings rate. Immediate attention needed to reduce expenses.');
  } else if (savingsRate < 10) {
    score -= 15;
    recommendations.push('Savings rate below 10%. Aim to save at least 20% of income.');
  } else if (savingsRate < 20) {
    score -= 5;
    recommendations.push('Good savings rate, but room for improvement towards 20%+ target.');
  }

  const emergencyFundTarget = currentBudget.emergencyFundTarget || 0;
  const emergencyFundMonths =
    emergencyFundTarget > 0 && savings > 0 ? savings / (emergencyFundTarget / 6) : 0;

  if (emergencyFundMonths < 3 && emergencyFundTarget > 0) {
    score -= 10;
    recommendations.push('Build emergency fund to cover at least 3 months of expenses.');
  }

  if (currentBudget.customSplits.length > 0) {
    const splitTotal = currentBudget.customSplits.reduce((sum, split) => sum + split.amount, 0);
    if (splitTotal > currentBudget.plannedExpenses * 1.1) {
      score -= 5;
      recommendations.push('Custom budget splits exceed planned expenses. Review allocations.');
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    status: getBudgetHealthStatus(score),
    recommendations,
  };
}

export function predictSpending(
  pattern: SpendingPattern | undefined,
  months: number,
): SpendingPrediction {
  if (!pattern || pattern.monthlyAmounts.length === 0) {
    return {
      predicted: 0,
      confidence: 0,
      range: {min: 0, max: 0},
    };
  }

  const recentMonths = pattern.monthlyAmounts.slice(-months);
  const average = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length;
  const variance =
    recentMonths.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recentMonths.length;
  const stdDev = Math.sqrt(variance);

  const trendAdjustment = getTrendAdjustment(pattern.trend);
  const predicted = average * trendAdjustment;

  return {
    predicted: Math.round(predicted),
    confidence: Math.max(0.3, 1 - pattern.volatility),
    range: {
      min: Math.round(predicted - stdDev * 1.5),
      max: Math.round(predicted + stdDev * 1.5),
    },
  };
}

const getBudgetHealthStatus = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Improvement';
};

const getTrendAdjustment = (trend: SpendingPattern['trend']): number => {
  if (trend === 'increasing') return 1.1;
  if (trend === 'decreasing') return 0.9;
  return 1;
};
