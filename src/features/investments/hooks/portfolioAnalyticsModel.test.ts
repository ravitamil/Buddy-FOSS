import type {Investment, InvestmentCategory, SavingsGoal} from '@/types';
import {
  buildPerformanceData,
  calculatePortfolioStats,
  createCategoryChartData,
  getMaxDataPoints,
} from './portfolioAnalyticsModel';

const category: InvestmentCategory = {
  id: 'stocks',
  name: 'Stocks',
  icon: 'chart-line',
  color: '#123456',
  riskLevel: 'high',
};

const createInvestment = (id: string, overrides: Partial<Investment> = {}): Investment => ({
  id,
  name: id,
  category,
  type: 'stocks',
  amount: 100,
  purchaseAmount: 100,
  purchaseDate: new Date('2026-01-01T00:00:00.000Z'),
  quantity: 1,
  currentPrice: 120,
  purchasePrice: 100,
  isActive: true,
  currency: 'USD',
  categoryId: category.id,
  lastUpdated: new Date('2026-01-02T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const savingsGoal: SavingsGoal = {
  id: 'goal-1',
  name: 'Emergency fund',
  targetAmount: 1000,
  currentAmount: 300,
  deadline: new Date('2026-12-31T00:00:00.000Z'),
};

describe('portfolioAnalyticsModel', () => {
  it('combines active investments and savings while preserving return semantics', () => {
    const stats = calculatePortfolioStats({
      investments: [
        createInvestment('winner'),
        createInvestment('loser', {currentPrice: 80}),
        createInvestment('inactive', {currentPrice: 500, isActive: false}),
      ],
      investmentCategories: [category],
      savingsGoals: [savingsGoal],
    });

    expect(stats).toMatchObject({
      totalValue: 1000,
      totalReturns: 700,
      returnPercentage: 133.33333333333331,
      investmentCount: 3,
    });
    expect(stats.categoryBreakdown).toEqual([
      expect.objectContaining({category: 'Savings Goals', value: 300, count: 1}),
      expect.objectContaining({category: 'Stocks', value: 200, invested: 200, count: 2}),
    ]);
    expect(stats.topPerformers.map(({id}) => id)).toEqual(['winner', 'loser']);
    expect(stats.worstPerformers.map(({id}) => id)).toEqual(['loser', 'winner']);
  });

  it('returns zero percentage when no capital was invested', () => {
    const stats = calculatePortfolioStats({
      investments: [createInvestment('free', {purchasePrice: 0})],
      investmentCategories: [],
      savingsGoals: [],
    });

    expect(stats.returnPercentage).toBe(0);
    expect(stats.topPerformers[0].returnPercentage).toBe(0);
  });

  it('maps category breakdown entries to chart data', () => {
    expect(
      createCategoryChartData([
        {
          category: 'Savings Goals',
          value: 300,
          invested: 300,
          returns: 0,
          percentage: 100,
          count: 1,
          color: '#2196F3',
        },
      ]),
    ).toEqual([{text: 'Savings Goals', value: 300, color: '#2196F3'}]);
  });

  it('caps period data points by available screen width', () => {
    expect(getMaxDataPoints('1M', 240)).toBe(3);
    expect(getMaxDataPoints('1Y', 2000)).toBe(12);
  });

  it('builds deterministic fallback performance data when history is empty', () => {
    const result = buildPerformanceData({
      investments: [],
      maxDataPoints: 2,
      now: new Date('2026-06-21T12:00:00.000Z'),
      period: '1M',
      random: () => 0.4,
      totalValue: 1000,
    });

    expect(result.labels).toHaveLength(2);
    expect(result.data[0]).toBeCloseTo(950.475);
    expect(result.data[1]).toBeCloseTo(950.9502375);
  });
});
