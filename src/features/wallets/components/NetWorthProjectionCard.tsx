import {Badge, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {Dimensions, type LayoutChangeEvent} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {NetWorthHistoryData, NetWorthPeriod} from '../hooks/useNetWorthScreen';

interface NetWorthProjectionCardProps {
  selectedPeriod: NetWorthPeriod;
  onPeriodChange: (period: NetWorthPeriod) => void;
  historyData: NetWorthHistoryData;
  projectedTarget: number;
  projectedGrowth: number;
  projectedGrowthPercentage: number;
  formatCurrency: (amount: number) => string;
}

const PERIOD_OPTIONS: readonly NetWorthPeriod[] = ['1Y', '3Y', '5Y', '10Y'];

export const NetWorthProjectionCard = ({
  selectedPeriod,
  onPeriodChange,
  historyData,
  projectedTarget,
  projectedGrowth,
  projectedGrowthPercentage,
  formatCurrency,
}: NetWorthProjectionCardProps) => {
  const {isDarkMode} = useTamaguiTheme();
  const [chartWidth, setChartWidth] = useState(Math.max(Dimensions.get('window').width - 72, 280));

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setChartWidth(width - 32);
    }
  };

  const chartData = historyData.data.map((value, index) => ({
    value,
    label: historyData.labels[index] ?? '',
  }));

  const isGrowthPositive = projectedGrowth >= 0;

  return (
    <GlassSurface
      borderRadius={24}
      padding={16}
      testID="net-worth-projection-card"
      style={{overflow: 'hidden'}}>
      <VStack gap="$3" onLayout={handleLayout}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="trending-up" size={20} color="#4ECDC4" />
            <VStack>
              <Text variant="h5" color="$text" weight="bold">
                Wealth Projection
              </Text>
              <Text variant="caption" color="$textSecondary">
                Simulated growth over time
              </Text>
            </VStack>
          </HStack>

          {/* Period Selector Pills */}
          <HStack gap="$1.5">
            {PERIOD_OPTIONS.map((period) => {
              const isSelected = selectedPeriod === period;
              return (
                <HStack
                  key={period}
                  accessibilityRole="button"
                  accessibilityState={{selected: isSelected}}
                  accessibilityLabel={`Select ${period} horizon`}
                  onPress={() => onPeriodChange(period)}
                  pressStyle={{opacity: 0.8}}
                  paddingHorizontal="$2.5"
                  paddingVertical="$1.5"
                  borderRadius="$4"
                  backgroundColor={
                    isSelected
                      ? '#4ECDC4'
                      : isDarkMode
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.05)'
                  }>
                  <Text
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? '#000' : '$textSecondary'}>
                    {period}
                  </Text>
                </HStack>
              );
            })}
          </HStack>
        </HStack>

        {/* Milestone Callout */}
        <GlassSurface
          fill
          borderRadius={14}
          padding={12}
          washColor={isGrowthPositive ? '$green10' : '$red10'}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack gap="$0.5">
              <Text variant="caption" color="$textSecondary">
                Target in {selectedPeriod}
              </Text>
              <Text variant="h6" color="$text" weight="bold">
                {formatCurrency(projectedTarget)}
              </Text>
            </VStack>

            <Badge
              label={`${isGrowthPositive ? '+' : ''}${projectedGrowthPercentage.toFixed(1)}%`}
              tone={isGrowthPositive ? 'success' : 'error'}
            />
          </HStack>
        </GlassSurface>

        {/* Line Chart */}
        {chartData.length > 0 ? (
          <VStack alignItems="center" marginTop="$2">
            <LineChart
              data={chartData}
              width={chartWidth}
              height={180}
              color="#4ECDC4"
              thickness={2.5}
              curved
              areaChart
              startFillColor="rgba(78, 205, 196, 0.35)"
              endFillColor="rgba(78, 205, 196, 0.02)"
              startOpacity={0.9}
              endOpacity={0.1}
              dataPointsColor="#4ECDC4"
              dataPointsRadius={4}
              noOfSections={3}
              isAnimated
              animationDuration={800}
              yAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
              xAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
              yAxisTextStyle={{
                color: isDarkMode ? '#999' : '#666',
                fontSize: 10,
              }}
              xAxisLabelTextStyle={{
                color: isDarkMode ? '#ccc' : '#444',
                fontSize: 11,
                fontWeight: '600',
              }}
              rulesColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
            />
          </VStack>
        ) : (
          <Text variant="body2" color="$textSecondary" textAlign="center" padding="$4">
            No projection data available
          </Text>
        )}

        {/* Assumptions Footnote */}
        <HStack alignItems="center" gap="$1.5" paddingTop="$1">
          <Ionicons name="information-circle-outline" size={14} color="#888" />
          <Text variant="caption" color="$textSecondary" fontSize={11}>
            Calculated at 7% asset growth, 5% liability reduction rate.
          </Text>
        </HStack>
      </VStack>
    </GlassSurface>
  );
};
