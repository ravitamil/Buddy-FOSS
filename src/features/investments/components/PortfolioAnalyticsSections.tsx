import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {PieChart} from 'react-native-gifted-charts';
import {View} from 'tamagui';

import {AnalyticsGlassCard} from '@/features/analytics';

import type {
  BenchmarkComparison,
  PortfolioCategoryBreakdown,
  PortfolioCategoryChartDatum,
  PortfolioInvestmentPerformance,
  PortfolioMetrics,
  RebalancingRecommendation,
} from '../hooks/usePortfolioAnalytics';
export {PortfolioOverviewSection} from './portfolioAnalytics/PortfolioOverviewSection';
export {PortfolioPerformanceSection} from './portfolioAnalytics/PortfolioPerformanceSection';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AssetAllocationSectionProps {
  categoryChartData: PortfolioCategoryChartDatum[];
  categoryBreakdown: PortfolioCategoryBreakdown[];
  formatCurrency: (amount: number) => string;
}

export const AssetAllocationSection = ({
  categoryChartData,
  categoryBreakdown,
  formatCurrency,
}: AssetAllocationSectionProps) => {
  if (categoryChartData.length === 0) {
    return null;
  }

  return (
    <AnalyticsGlassCard title="Asset Allocation" icon="pie-chart">
      <PieChart data={categoryChartData} radius={90} backgroundColor="transparent" donut showText />

      <VStack gap="$2" marginTop="$3">
        {categoryBreakdown.map((item) => (
          <HStack key={item.category} justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" gap="$2">
              <VStack width={12} height={12} borderRadius={6} backgroundColor={item.color} />
              <Text variant="body2" color="$text">
                {item.category}
              </Text>
            </HStack>
            <VStack alignItems="flex-end">
              <Text variant="body2" color="$text" weight="bold">
                {formatCurrency(item.value)}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {item.percentage.toFixed(1)}%
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </AnalyticsGlassCard>
  );
};

export const RiskAnalysisSection = ({portfolioMetrics}: {portfolioMetrics: PortfolioMetrics}) => (
  <AnalyticsGlassCard title="Risk Analysis" icon="analytics">
    <VStack gap="$3">
      <MetricRow label="Volatility" value={`${(portfolioMetrics.volatility * 100).toFixed(2)}%`} />
      <MetricRow label="Sharpe Ratio" value={portfolioMetrics.sharpeRatio.toFixed(2)} />
      <MetricRow
        label="Max Drawdown"
        value={`${(portfolioMetrics.maxDrawdown * 100).toFixed(2)}%`}
      />
      <MetricRow
        label="Diversification Score"
        value={`${(portfolioMetrics.sharpeRatio * 10).toFixed(1)}/100`}
      />
    </VStack>
  </AnalyticsGlassCard>
);

const MetricRow = ({label, value}: {label: string; value: string}) => (
  <HStack justifyContent="space-between">
    <Text variant="body2" color="$text">
      {label}
    </Text>
    <Text variant="body2" color="$text" weight="bold">
      {value}
    </Text>
  </HStack>
);

interface BenchmarkSectionProps {
  comparisons: BenchmarkComparison[];
}

export const BenchmarkComparisonSection = ({comparisons}: BenchmarkSectionProps) => {
  if (comparisons.length === 0) {
    return null;
  }

  return (
    <AnalyticsGlassCard title="Benchmark Comparison" icon="stats-chart">
      <VStack gap="$2">
        {comparisons.map((comparison) => (
          <HStack
            key={`${comparison.investmentName}-${comparison.benchmarkName}`}
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$1">
            <VStack>
              <Text variant="body2" color="$text" weight="medium">
                {comparison.investmentName}
              </Text>
              <Text variant="caption" color="$textSecondary">
                vs {comparison.benchmarkName}
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              <Text
                variant="body2"
                color={comparison.alpha >= 0 ? '#4CAF50' : '#FF5722'}
                weight="bold">
                {comparison.alpha >= 0 ? '+' : ''}
                {(comparison.alpha * 100).toFixed(2)}%
              </Text>
              <Text variant="caption" color="$textSecondary">
                {comparison.investmentReturn >= 0 ? '+' : ''}
                {(comparison.investmentReturn * 100).toFixed(2)}% vs{' '}
                {(comparison.benchmarkReturn * 100).toFixed(2)}%
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </AnalyticsGlassCard>
  );
};

interface RebalancingSectionProps {
  recommendations: RebalancingRecommendation[];
  formatCurrency: (amount: number) => string;
  onRebalancePress: () => void;
}

export const RebalancingRecommendationsSection = ({
  recommendations,
  formatCurrency,
  onRebalancePress,
}: RebalancingSectionProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <AnalyticsGlassCard title="Rebalancing Recommendations" icon="refresh">
      <VStack gap="$2">
        {recommendations.map((recommendation) => (
          <HStack
            key={`${recommendation.categoryName}-${recommendation.action}`}
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$1">
            <VStack>
              <Text variant="body2" color="$text" weight="medium">
                {recommendation.categoryName}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {recommendation.action.toUpperCase()} {formatCurrency(recommendation.amount)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              <Text variant="body2" color="$text" weight="bold">
                {recommendation.currentAllocation.toFixed(1)}% {'->'}{' '}
                {recommendation.targetAllocation.toFixed(1)}%
              </Text>
              <Text
                variant="caption"
                color={
                  recommendation.deviation > 10
                    ? '#FF5722'
                    : recommendation.deviation > 5
                      ? '#FF9800'
                      : '#4CAF50'
                }>
                {recommendation.deviation.toFixed(1)}% deviation
              </Text>
            </VStack>
          </HStack>
        ))}
        <View
          accessibilityRole="button"
          accessibilityLabel="Rebalance portfolio"
          onPress={onRebalancePress}
          pressStyle={{opacity: 0.8}}
          marginTop={10}
          padding={10}
          backgroundColor="#4ECDC4"
          borderRadius={8}
          alignItems="center">
          <Text variant="body2" color="white" weight="bold">
            Rebalance Portfolio
          </Text>
        </View>
      </VStack>
    </AnalyticsGlassCard>
  );
};

interface PerformerSectionProps {
  title: string;
  icon: IoniconName;
  investments: PortfolioInvestmentPerformance[];
  color: string;
  formatCurrency: (amount: number) => string;
  positive?: boolean;
}

export const PerformerSection = ({
  title,
  icon,
  investments,
  color,
  formatCurrency,
  positive = false,
}: PerformerSectionProps) => {
  if (investments.length === 0) {
    return null;
  }

  return (
    <AnalyticsGlassCard title={title} icon={icon}>
      <VStack gap="$2">
        {investments.map((investment, index) => (
          <HStack key={investment.id} justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" gap="$2">
              <VStack
                width={24}
                height={24}
                borderRadius={12}
                backgroundColor={color}
                alignItems="center"
                justifyContent="center">
                <Text variant="caption" color="white" weight="bold">
                  {index + 1}
                </Text>
              </VStack>
              <VStack>
                <Text variant="body2" color="$text" weight="medium" numberOfLines={1}>
                  {investment.name}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  {investment.type}
                </Text>
              </VStack>
            </HStack>
            <VStack alignItems="flex-end">
              <Text variant="body2" color={color} weight="bold">
                {positive ? '+' : ''}
                {investment.returnPercentage.toFixed(2)}%
              </Text>
              <Text variant="caption" color={color}>
                {formatCurrency(investment.returns)}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </AnalyticsGlassCard>
  );
};
