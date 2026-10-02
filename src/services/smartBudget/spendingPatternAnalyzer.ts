import {Category, SpendingPattern, Transaction} from '../../types';

const monthKeyFor = (dateValue: string | Date): string => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const calculateTrend = (
  monthlyAmounts: number[],
  average: number,
): 'increasing' | 'decreasing' | 'stable' => {
  if (monthlyAmounts.length < 3) {
    return 'stable';
  }

  const recentAvg = monthlyAmounts.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const olderMonths = monthlyAmounts.slice(0, Math.min(3, monthlyAmounts.length - 3));
  const olderAvg = olderMonths.reduce((a, b) => a + b, 0) / olderMonths.length;

  if (Math.abs(recentAvg - olderAvg) < average * 0.1) {
    return 'stable';
  }
  if (recentAvg > olderAvg * 1.15) {
    return 'increasing';
  }
  if (recentAvg < olderAvg * 0.85) {
    return 'decreasing';
  }
  return 'stable';
};

export function analyzeSpendingPatternsData(
  transactions: Transaction[],
  categories: Category[],
): SpendingPattern[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach((category) => categoryMap.set(category.id, category));

  const monthlyCategoryTotals = new Map<string, Map<string, number>>();

  transactions.forEach((transaction) => {
    const monthKey = monthKeyFor(transaction.date);
    const categoryId = transaction.categoryId ?? transaction.category;

    if (!monthlyCategoryTotals.has(monthKey)) {
      monthlyCategoryTotals.set(monthKey, new Map());
    }

    const monthMap = monthlyCategoryTotals.get(monthKey);
    if (!monthMap) return;

    const amount =
      transaction.type === 'expense' ? Math.abs(transaction.amount) : -Math.abs(transaction.amount);
    monthMap.set(categoryId, (monthMap.get(categoryId) || 0) + amount);
  });

  const patterns: SpendingPattern[] = [];

  categoryMap.forEach((category, categoryId) => {
    const monthlyAmounts = Array.from(monthlyCategoryTotals.values())
      .map((monthMap) => monthMap.get(categoryId) || 0)
      .filter((amount) => amount !== 0);

    if (monthlyAmounts.length === 0) return;

    const average = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
    const variance =
      monthlyAmounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      monthlyAmounts.length;
    const stdDev = Math.sqrt(variance);

    patterns.push({
      categoryId,
      categoryName: category.name,
      averageAmount: Math.abs(average),
      trend: calculateTrend(monthlyAmounts, average),
      volatility: stdDev / Math.abs(average),
      monthlyAmounts,
      lastUpdated: new Date().toISOString(),
    });
  });

  return patterns;
}
