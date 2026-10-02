import {useMemo} from 'react';
import {Dimensions} from 'react-native';

import type {Investment, InvestmentCategory, SavingsGoal} from '@/types';
import {
  buildPerformanceData,
  calculatePortfolioStats,
  createCategoryChartData,
  getMaxDataPoints,
} from './portfolioAnalyticsModel';
import type {
  PortfolioCategoryChartDatum,
  PortfolioPerformanceData,
  PortfolioStats,
} from './portfolioAnalyticsModel';

export type {
  PortfolioAnalyticsPeriod,
  PortfolioCategoryBreakdown,
  PortfolioCategoryChartDatum,
  PortfolioInvestmentPerformance,
  PortfolioPerformanceData,
  PortfolioStats,
} from './portfolioAnalyticsModel';
import type {PortfolioAnalyticsPeriod} from './portfolioAnalyticsModel';

export interface PortfolioMetrics {
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  diversificationScore: number;
}

export interface BenchmarkComparison {
  investmentName: string;
  benchmarkName: string;
  alpha: number;
  investmentReturn: number;
  benchmarkReturn: number;
}

export interface RebalancingRecommendation {
  categoryName: string;
  action: 'buy' | 'sell';
  amount: number;
  currentAllocation: number;
  targetAllocation: number;
  deviation: number;
}

interface UsePortfolioAnalyticsInput {
  investments: Investment[];
  savingsGoals: SavingsGoal[];
  selectedPeriod: PortfolioAnalyticsPeriod;
}

export const usePortfolioAnalytics = ({
  investments,
  savingsGoals,
  selectedPeriod,
}: UsePortfolioAnalyticsInput) => {
  const investmentCategories = useMemo<InvestmentCategory[]>(() => [], []);
  const portfolioMetrics = useMemo<PortfolioMetrics>(
    () => ({
      sharpeRatio: 1.2,
      volatility: 15.5,
      maxDrawdown: -8.2,
      beta: 0.95,
      alpha: 2.1,
      diversificationScore: 75,
    }),
    [],
  );
  const benchmarkComparisons = useMemo<BenchmarkComparison[]>(() => [], []);
  const rebalancingRecommendations = useMemo<RebalancingRecommendation[]>(() => [], []);
  const portfolioStats = useMemo<PortfolioStats>(
    () => calculatePortfolioStats({investments, investmentCategories, savingsGoals}),
    [investmentCategories, investments, savingsGoals],
  );
  const performanceData = useMemo<PortfolioPerformanceData>(
    () =>
      buildPerformanceData({
        investments,
        maxDataPoints: getMaxDataPoints(selectedPeriod, Dimensions.get('window').width),
        period: selectedPeriod,
        totalValue: portfolioStats.totalValue,
      }),
    [investments, portfolioStats.totalValue, selectedPeriod],
  );
  const categoryChartData = useMemo<PortfolioCategoryChartDatum[]>(
    () => createCategoryChartData(portfolioStats.categoryBreakdown),
    [portfolioStats.categoryBreakdown],
  );

  return {
    portfolioMetrics,
    benchmarkComparisons,
    rebalancingRecommendations,
    portfolioStats,
    performanceData,
    categoryChartData,
  };
};
