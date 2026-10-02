import {Investment, InvestmentCategory} from '../types';
import {InvestmentHistory} from '../types/index';
import {
  calculateInvestmentReturns,
  calculateSharpeRatioFromReturns,
  calculateVolatilityFromReturns,
} from './investmentAnalytics/riskMetrics';

export interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  returnPercentage: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationScore: number;
}

export interface InvestmentRiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta?: number; // Market sensitivity
}

export interface BenchmarkComparison {
  investmentId: string;
  investmentName: string;
  investmentReturn: number;
  benchmarkName: string;
  benchmarkReturn: number;
  alpha: number; // Excess return relative to benchmark
}

export interface CorrelationAnalysis {
  investmentId1: string;
  investmentId2: string;
  correlation: number;
}

export interface RebalancingRecommendation {
  categoryId: string;
  categoryName: string;
  currentAllocation: number;
  targetAllocation: number;
  deviation: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
}

export class InvestmentAnalyticsService {
  /**
   * Calculate portfolio metrics including risk-adjusted returns
   */
  calculatePortfolioMetrics(
    investments: Investment[],
    history: InvestmentHistory[],
  ): PortfolioMetrics {
    // Calculate basic portfolio values
    const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvested = investments.reduce((sum, inv) => sum + inv.purchaseAmount, 0);
    const totalReturns = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Calculate risk metrics
    const riskMetrics = this.calculatePortfolioRiskMetrics(investments, history);

    // Calculate diversification score
    const diversificationScore = this.calculateDiversificationScore(investments);

    return {
      totalValue,
      totalInvested,
      totalReturns,
      returnPercentage,
      volatility: riskMetrics.volatility,
      sharpeRatio: riskMetrics.sharpeRatio,
      maxDrawdown: riskMetrics.maxDrawdown,
      diversificationScore,
    };
  }

  /**
   * Calculate risk metrics for the entire portfolio
   */
  private calculatePortfolioRiskMetrics(
    investments: Investment[],
    history: InvestmentHistory[],
  ): InvestmentRiskMetrics {
    // For simplicity, we'll use a weighted average of individual investment risk metrics
    // In a real implementation, this would use actual historical returns

    let totalWeight = 0;
    let weightedVolatility = 0;
    let weightedSharpe = 0;
    let weightedDrawdown = 0;

    investments.forEach((investment) => {
      const weight = investment.amount;
      totalWeight += weight;

      // Simplified risk metrics calculation
      const volatility = this.calculateVolatility(investment, history);
      const sharpeRatio = this.calculateSharpeRatio(investment, history);
      const maxDrawdown = this.calculateMaxDrawdown(investment, history);

      weightedVolatility += volatility * weight;
      weightedSharpe += sharpeRatio * weight;
      weightedDrawdown += maxDrawdown * weight;
    });

    return {
      volatility: totalWeight > 0 ? weightedVolatility / totalWeight : 0,
      sharpeRatio: totalWeight > 0 ? weightedSharpe / totalWeight : 0,
      maxDrawdown: totalWeight > 0 ? weightedDrawdown / totalWeight : 0,
    };
  }

  /**
   * Calculate volatility (standard deviation) for an investment
   */
  private calculateVolatility(investment: Investment, history: InvestmentHistory[]): number {
    return calculateVolatilityFromReturns(calculateInvestmentReturns(investment, history));
  }

  /**
   * Calculate Sharpe ratio for an investment
   */
  private calculateSharpeRatio(investment: Investment, history: InvestmentHistory[]): number {
    return calculateSharpeRatioFromReturns(calculateInvestmentReturns(investment, history));
  }

  /**
   * Calculate maximum drawdown for an investment
   */
  private calculateMaxDrawdown(investment: Investment, history: InvestmentHistory[]): number {
    const investmentHistory = history.find((h) => h.investmentId === investment.id);
    if (!investmentHistory || investmentHistory.history.length === 0) {
      return 0;
    }

    let peak = investmentHistory.history[0].value;
    let maxDrawdown = 0;

    for (const entry of investmentHistory.history) {
      if (entry.value > peak) {
        peak = entry.value;
      }

      const drawdown = peak > 0 ? (peak - entry.value) / peak : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate diversification score based on asset allocation
   */
  private calculateDiversificationScore(investments: Investment[]): number {
    if (investments.length === 0) {
      return 0;
    }

    const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
    if (totalValue === 0) {
      return 0;
    }

    // Group investments by category
    const categoryValues: {[key: string]: number} = {};
    investments.forEach((investment) => {
      const categoryId = investment.category.id;
      categoryValues[categoryId] = (categoryValues[categoryId] || 0) + investment.amount;
    });

    // Calculate Herfindahl-Hirschman Index (HHI) as measure of concentration
    let hhi = 0;
    Object.values(categoryValues).forEach((value) => {
      const share = value / totalValue;
      hhi += Math.pow(share, 2);
    });

    // Convert to diversification score (0-100, higher is more diversified)
    // HHI ranges from 1/n (perfect diversification) to 1 (complete concentration)
    const n = Object.keys(categoryValues).length;
    const maxHHI = n > 0 ? 1 / n : 1;
    const diversificationScore =
      n > 0 ? Math.max(0, Math.min(100, ((1 - hhi) / (1 - maxHHI)) * 100)) : 0;

    return diversificationScore;
  }

  /**
   * Compare investment performance against benchmarks
   */
  compareWithBenchmarks(
    investments: Investment[],
    history: InvestmentHistory[],
  ): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = [];

    investments.forEach((investment) => {
      const investmentHistory = history.find((h) => h.investmentId === investment.id);
      if (
        !investmentHistory ||
        !investmentHistory.benchmarks ||
        investmentHistory.benchmarks.length === 0
      ) {
        return;
      }

      // Get the latest benchmark data
      const latestBenchmark = investmentHistory.benchmarks[investmentHistory.benchmarks.length - 1];

      // Calculate investment return
      const purchaseValue = investment.purchaseAmount;
      const currentValue = investment.amount;
      const investmentReturn =
        purchaseValue > 0 ? (currentValue - purchaseValue) / purchaseValue : 0;

      // Calculate alpha (excess return over benchmark)
      const alpha = investmentReturn - latestBenchmark.value;

      comparisons.push({
        investmentId: investment.id,
        investmentName: investment.name,
        investmentReturn,
        benchmarkName: latestBenchmark.benchmark,
        benchmarkReturn: latestBenchmark.value,
        alpha,
      });
    });

    return comparisons;
  }

  /**
   * Analyze correlations between investments
   */
  analyzeCorrelations(
    investments: Investment[],
    history: InvestmentHistory[],
  ): CorrelationAnalysis[] {
    const correlations: CorrelationAnalysis[] = [];

    // For simplicity, we'll create a basic correlation analysis
    // In a real implementation, this would use statistical correlation calculations
    for (let i = 0; i < investments.length; i++) {
      for (let j = i + 1; j < investments.length; j++) {
        const inv1 = investments[i];
        const inv2 = investments[j];

        // Simplified correlation based on category similarity and risk level
        let correlation = 0;

        // If same category, higher correlation
        if (inv1.category.id === inv2.category.id) {
          correlation = 0.8;
        }
        // If same risk level, moderate correlation
        else if (inv1.category.riskLevel === inv2.category.riskLevel) {
          correlation = 0.5;
        }
        // Otherwise, low correlation
        else {
          correlation = 0.2;
        }

        correlations.push({
          investmentId1: inv1.id,
          investmentId2: inv2.id,
          correlation,
        });
      }
    }

    return correlations;
  }

  /**
   * Generate portfolio rebalancing recommendations
   */
  generateRebalancingRecommendations(
    investments: Investment[],
    categories: InvestmentCategory[],
    targetAllocations: {categoryId: string; targetPercentage: number}[],
  ): RebalancingRecommendation[] {
    if (investments.length === 0 || categories.length === 0) {
      return [];
    }

    const recommendations: RebalancingRecommendation[] = [];
    const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);

    if (totalValue === 0) {
      return [];
    }

    // Calculate current allocations by category
    const currentAllocations: {[categoryId: string]: number} = {};
    investments.forEach((investment) => {
      const categoryId = investment.category.id;
      currentAllocations[categoryId] = (currentAllocations[categoryId] || 0) + investment.amount;
    });

    // Generate recommendations for each category with target allocation
    targetAllocations.forEach((target) => {
      const categoryId = target.categoryId;
      const category = categories.find((c) => c.id === categoryId);

      if (!category) {
        return;
      }

      const currentAllocation = ((currentAllocations[categoryId] || 0) / totalValue) * 100;
      const targetAllocation = target.targetPercentage;
      const deviation = Math.abs(currentAllocation - targetAllocation);

      // Only recommend rebalancing if deviation is significant (e.g., > 5%)
      if (deviation > 5) {
        const action = currentAllocation > targetAllocation ? 'sell' : 'buy';
        const amount = Math.abs(((targetAllocation - currentAllocation) / 100) * totalValue);

        recommendations.push({
          categoryId,
          categoryName: category.name,
          currentAllocation,
          targetAllocation,
          deviation,
          action,
          amount,
        });
      }
    });

    return recommendations;
  }
}
