import type {Investment, InvestmentCategory, SavingsGoal} from '@/types';

export type PortfolioAnalyticsPeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface PortfolioCategoryBreakdown {
  category: string;
  value: number;
  invested: number;
  returns: number;
  percentage: number;
  count: number;
  color: string;
}

export type PortfolioInvestmentPerformance = Investment & {
  returns: number;
  returnPercentage: number;
};

export interface PortfolioStats {
  totalValue: number;
  totalReturns: number;
  returnPercentage: number;
  investmentCount: number;
  categoryBreakdown: PortfolioCategoryBreakdown[];
  topPerformers: PortfolioInvestmentPerformance[];
  worstPerformers: PortfolioInvestmentPerformance[];
}

export interface PortfolioPerformanceData {
  labels: string[];
  data: number[];
}

export interface PortfolioCategoryChartDatum {
  text: string;
  value: number;
  color: string;
}

const PERIOD_DAYS: Record<PortfolioAnalyticsPeriod, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  ALL: 365 * 2,
};

const formatDateLabel = (date: Date, period: PortfolioAnalyticsPeriod): string => {
  switch (period) {
    case '1M':
    case '3M':
      return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    case '6M':
      return date.getDate() === 1
        ? date.toLocaleDateString('en-US', {month: 'short'})
        : date.toLocaleDateString('en-US', {day: 'numeric'});
    case '1Y':
      return date.toLocaleDateString('en-US', {month: 'short'});
    case 'ALL':
      return date.toLocaleDateString('en-US', {month: 'short', year: '2-digit'});
  }
};

export const getMaxDataPoints = (period: PortfolioAnalyticsPeriod, screenWidth: number): number => {
  const maxPossiblePoints = Math.max(1, Math.floor(screenWidth / 80));
  const periodMaximums: Record<PortfolioAnalyticsPeriod, number> = {
    '1M': 30,
    '3M': 20,
    '6M': 15,
    '1Y': 12,
    ALL: 10,
  };
  return Math.min(periodMaximums[period], maxPossiblePoints);
};

const withReturns = (investment: Investment): PortfolioInvestmentPerformance => {
  const currentValue = (investment.currentPrice || 0) * (investment.quantity || 0);
  const investedValue = (investment.purchasePrice || 0) * (investment.quantity || 0);
  const returns = currentValue - investedValue;
  return {
    ...investment,
    returns,
    returnPercentage: investedValue > 0 ? (returns / investedValue) * 100 : 0,
  };
};

const createCategoryBreakdown = ({
  activeInvestments,
  investmentCategories,
  savingsGoals,
  totalSavings,
  totalWealth,
}: {
  activeInvestments: Investment[];
  investmentCategories: InvestmentCategory[];
  savingsGoals: SavingsGoal[];
  totalSavings: number;
  totalWealth: number;
}): PortfolioCategoryBreakdown[] => [
  ...(totalSavings > 0
    ? [
        {
          category: 'Savings Goals',
          value: totalSavings,
          invested: totalSavings,
          returns: 0,
          percentage: totalWealth > 0 ? (totalSavings / totalWealth) * 100 : 0,
          count: savingsGoals.length,
          color: '#2196F3',
        },
      ]
    : []),
  ...investmentCategories
    .map((category) => {
      const categoryInvestments = activeInvestments.filter(
        (investment) => investment.categoryId === category.id,
      );
      const value = categoryInvestments.reduce(
        (sum, investment) => sum + (investment.currentPrice || 0) * (investment.quantity || 0),
        0,
      );
      const invested = categoryInvestments.reduce(
        (sum, investment) => sum + (investment.purchasePrice || 0) * (investment.quantity || 0),
        0,
      );
      return {
        category: category.name,
        value,
        invested,
        returns: value - invested,
        percentage: totalWealth > 0 ? (value / totalWealth) * 100 : 0,
        count: categoryInvestments.length,
        color: category.color || '#4ECDC4',
      };
    })
    .filter((item) => item.value > 0),
];

export const calculatePortfolioStats = ({
  investments,
  investmentCategories,
  savingsGoals,
}: {
  investments: Investment[];
  investmentCategories: InvestmentCategory[];
  savingsGoals: SavingsGoal[];
}): PortfolioStats => {
  const totalValue = investments.reduce(
    (sum, investment) => sum + (investment.currentPrice || 0) * (investment.quantity || 0),
    0,
  );
  const totalInvested = investments.reduce(
    (sum, investment) => sum + (investment.purchasePrice || 0) * (investment.quantity || 0),
    0,
  );
  const totalReturns = totalValue - totalInvested;
  const activeInvestments = investments.filter((investment) => investment.isActive ?? true);
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalWealth = totalSavings + totalValue;
  const performances = activeInvestments.map(withReturns);

  return {
    totalValue: totalWealth,
    totalReturns: totalReturns + totalSavings,
    returnPercentage: totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0,
    investmentCount: activeInvestments.length + savingsGoals.length,
    categoryBreakdown: createCategoryBreakdown({
      activeInvestments,
      investmentCategories,
      savingsGoals,
      totalSavings,
      totalWealth,
    }),
    topPerformers: [...performances]
      .sort((a, b) => b.returnPercentage - a.returnPercentage)
      .slice(0, 5),
    worstPerformers: [...performances]
      .sort((a, b) => a.returnPercentage - b.returnPercentage)
      .slice(0, 5),
  };
};

export const buildPerformanceData = ({
  investments,
  maxDataPoints,
  now = new Date(),
  period,
  random = Math.random,
  totalValue,
}: {
  investments: Investment[];
  maxDataPoints: number;
  now?: Date;
  period: PortfolioAnalyticsPeriod;
  random?: () => number;
  totalValue: number;
}): PortfolioPerformanceData => {
  const data: number[] = [];
  const labels: string[] = [];
  const dailyValues: Record<string, number> = {};

  investments
    .map((investment) => ({
      date: new Date(now),
      value: (investment.currentPrice || 0) * (investment.quantity || 0),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      dailyValues[dateKey] = (dailyValues[dateKey] ?? 0) + entry.value;
    });

  const dateKeys = Object.keys(dailyValues);
  const step = dateKeys.length > maxDataPoints ? Math.ceil(dateKeys.length / maxDataPoints) : 1;
  dateKeys.forEach((key, index) => {
    if (index % step !== 0) return;
    labels.push(formatDateLabel(new Date(key), period));
    data.push(dailyValues[key]);
  });

  if (data.length === 0) {
    const days = PERIOD_DAYS[period];
    const dataPoints = Math.max(1, Math.min(days, maxDataPoints));
    let currentValue = totalValue * 0.95;

    for (let index = 0; index < dataPoints; index += 1) {
      const date = new Date(now);
      const offset = dataPoints > 1 ? days - index * (days / (dataPoints - 1)) : 0;
      date.setDate(date.getDate() - offset);
      labels.push(formatDateLabel(date, period));
      currentValue *= 1 + (0.0005 + (random() - 0.4) * 0.02);
      data.push(Math.max(0, currentValue));
    }
  }

  return {labels, data};
};

export const createCategoryChartData = (
  breakdown: PortfolioCategoryBreakdown[],
): PortfolioCategoryChartDatum[] =>
  breakdown.map((item) => ({
    text: item.category,
    value: item.value,
    color: item.color,
  }));
