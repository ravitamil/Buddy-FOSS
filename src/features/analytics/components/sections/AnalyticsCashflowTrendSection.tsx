import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {Dimensions, type LayoutChangeEvent} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {getCurrencySymbol} from '@/constants/currencies';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {AnalyticsScreenModel} from '../../hooks/useAnalyticsScreen';

interface AnalyticsCashflowTrendSectionProps {
  screen: AnalyticsScreenModel;
}

export const AnalyticsCashflowTrendSection: React.FC<AnalyticsCashflowTrendSectionProps> = ({
  screen,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const [chartWidth, setChartWidth] = useState(Math.max(260, Dimensions.get('window').width - 64));
  const symbol = getCurrencySymbol(screen.currency);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setChartWidth(Math.max(260, width - 24));
    }
  };

  const chartData = screen.trendData.map((item) => ({
    value: item.value,
    label: item.label,
    dataPointText: item.value > 0 ? `${symbol}${Math.round(item.value)}` : undefined,
  }));

  const maxVal = Math.max(10, ...chartData.map((d) => d.value));

  const formatYLabel = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return `${Math.round(num)}`;
  };

  return (
    <GlassSurface padding="$4" borderRadius={24} style={{overflow: 'hidden'}}>
      <VStack gap="$3" onLayout={handleLayout}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack gap="$0.5">
            <HStack alignItems="center" gap="$1.5">
              <Ionicons name="pulse" size={18} color="#0EA5E9" />
              <Text variant="h5" color="$text" weight="bold">
                Spending Trend
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              Outflow progression across {screen.selectedPeriod}
            </Text>
          </VStack>

          {screen.peakDay && (
            <VStack
              alignItems="flex-end"
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderRadius="$4"
              backgroundColor={
                isDarkMode ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.08)'
              }>
              <Text variant="caption" color="$blue10" weight="bold">
                Peak: {screen.formatCurrency(screen.peakDay.amount)}
              </Text>
              <Text variant="caption" color="$textSecondary" fontSize={10}>
                {screen.peakDay.date}
              </Text>
            </VStack>
          )}
        </HStack>

        {/* Chart */}
        <VStack alignItems="center" marginTop="$2">
          <LineChart
            data={chartData}
            width={chartWidth}
            height={190}
            areaChart
            curved
            color={isDarkMode ? '#38BDF8' : '#0284C7'}
            thickness={3}
            startFillColor={isDarkMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)'}
            endFillColor={isDarkMode ? 'rgba(56, 189, 248, 0.02)' : 'rgba(2, 132, 199, 0.02)'}
            startOpacity={0.8}
            endOpacity={0.05}
            dataPointsColor={isDarkMode ? '#38BDF8' : '#0284C7'}
            dataPointsRadius={4}
            maxValue={maxVal * 1.15}
            noOfSections={3}
            yAxisLabelPrefix={symbol}
            formatYLabel={formatYLabel}
            yAxisTextStyle={{
              color: isDarkMode ? '#9CA3AF' : '#6B7280',
              fontSize: 10,
            }}
            xAxisLabelTextStyle={{
              color: isDarkMode ? '#9CA3AF' : '#6B7280',
              fontSize: 10,
            }}
            yAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            xAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            rulesColor={isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
            rulesType="solid"
            isAnimated
            animationDuration={800}
          />
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
