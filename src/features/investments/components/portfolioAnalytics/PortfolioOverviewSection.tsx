import {HStack, MetricCard, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import type {PortfolioMetrics, PortfolioStats} from '../../hooks/usePortfolioAnalytics';

interface OverviewSectionProps {
  portfolioStats: PortfolioStats;
  portfolioMetrics: PortfolioMetrics;
  formatCurrency: (amount: number) => string;
}

export const PortfolioOverviewSection = ({
  portfolioStats,
  portfolioMetrics,
  formatCurrency,
}: OverviewSectionProps) => (
  <VStack gap="$2">
    <HStack gap="$2">
      <MetricCard
        title="Total Value"
        value={formatCurrency(portfolioStats.totalValue)}
        icon="trending-up"
        trend={`${portfolioStats.returnPercentage >= 0 ? '+' : ''}${portfolioStats.returnPercentage.toFixed(1)}%`}
        trendColor={portfolioStats.returnPercentage >= 0 ? '#4CAF50' : '#FF5722'}
        tone={portfolioStats.returnPercentage >= 0 ? 'positive' : 'negative'}
        onPress={() => {}}
      />
      <MetricCard
        title="Total Returns"
        value={formatCurrency(portfolioStats.totalReturns)}
        icon={portfolioStats.totalReturns >= 0 ? 'trending-up' : 'trending-down'}
        trend={`${portfolioStats.investmentCount} investments`}
        trendColor={portfolioStats.totalReturns >= 0 ? '#2196F3' : '#FF5722'}
        tone={portfolioStats.totalReturns >= 0 ? 'positive' : 'negative'}
        onPress={() => {}}
      />
    </HStack>

    <HStack gap="$2" marginTop="$2">
      <MetricCard
        title="Risk Level"
        value={`${(portfolioMetrics.volatility * 100).toFixed(2)}%`}
        icon="shield"
        trend={`Sharpe: ${portfolioMetrics.sharpeRatio.toFixed(2)}`}
        trendColor="#FF9800"
        tone="info"
        onPress={() => {}}
      />
      <MetricCard
        title="Diversification"
        value={`${(portfolioMetrics.sharpeRatio * 10).toFixed(1)}/100`}
        icon="grid"
        trend={
          portfolioMetrics.sharpeRatio * 10 >= 80
            ? 'Well Diversified'
            : portfolioMetrics.sharpeRatio * 10 >= 50
              ? 'Moderately Diversified'
              : 'Needs Diversification'
        }
        trendColor={
          portfolioMetrics.sharpeRatio * 10 >= 80
            ? '#4CAF50'
            : portfolioMetrics.sharpeRatio * 10 >= 50
              ? '#FF9800'
              : '#FF5722'
        }
        tone="info"
        onPress={() => {}}
      />
    </HStack>
  </VStack>
);
