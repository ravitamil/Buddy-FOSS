import {VStack, HStack, Text} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {BarChart} from 'react-native-gifted-charts';
import {YStack, styled, useWindowDimensions} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {Transaction} from '@/types';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import dayjs from 'dayjs';

import {getCurrencySymbol} from '@/constants/currencies';
import {useSettings} from '@/context';

interface SettlementTimelineChartProps {
  transactions: Transaction[];
  onSettlementPress?: (settlement: Transaction) => void;
}

const SettlementPressable = styled(YStack, {
  name: 'SettlementTimelinePressable',
  padding: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
  alignItems: 'stretch',
  pressStyle: {
    opacity: 0.7,
  },
});

// Stable top label component to avoid addViewAt crash on Fabric
const BarTopLabel: React.FC<{count: number}> = ({count}) => (
  <Text variant="caption" color="$text" textAlign="center">
    {count}
  </Text>
);

export const SettlementTimelineChart: React.FC<SettlementTimelineChartProps> = ({
  transactions,
  onSettlementPress,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {width: screenWidth} = useWindowDimensions();
  const {formatCurrency: settingsFormatCurrency, currency} = useSettings();
  const symbol = getCurrencySymbol(currency);

  const {chartData, settlements} = useMemo(() => {
    if (!transactions || transactions.length === 0) return {chartData: [], settlements: []};

    // Filter settlement transactions using isSettlement property
    const settlementTransactions = transactions.filter(
      (transaction) =>
        transaction.isSettlement === true ||
        transaction.description?.toLowerCase().includes('settlement') ||
        transaction.description?.toLowerCase().includes('settle') ||
        transaction.category === 'Settlement',
    );

    if (settlementTransactions.length === 0) return {chartData: [], settlements: []};

    // Group settlements by month
    const groupedData: {
      [key: string]: {amount: number; count: number; transactions: Transaction[]};
    } = {};

    settlementTransactions.forEach((transaction) => {
      const monthKey = dayjs(transaction.date).format('MMM YY');

      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {amount: 0, count: 0, transactions: []};
      }

      groupedData[monthKey].amount += Math.abs(transaction.amount);
      groupedData[monthKey].count += 1;
      groupedData[monthKey].transactions.push(transaction);
    });

    // Convert to chart format
    const chartData = Object.entries(groupedData)
      .sort(([a], [b]) => dayjs(a, 'MMM YY').valueOf() - dayjs(b, 'MMM YY').valueOf())
      .map(([month, data]) => ({
        value: data.amount,
        label: month,
        frontColor: isDarkMode ? '#4ECDC4' : '#2196F3',
        gradientColor: isDarkMode ? '#45B7D1' : '#1976D2',
        spacing: 2,
        labelWidth: 50,
        labelTextStyle: {
          color: isDarkMode ? '#8E8E93' : '#3C3C43',
          fontSize: 10,
        },
        topLabelComponent: () => <BarTopLabel count={data.count} />,
      }));

    return {chartData, settlements: settlementTransactions};
  }, [transactions, isDarkMode]);

  // Use global settings currency formatter for consistency across the app

  const totalSettlements = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const settlementCount = settlements.length;

  if (chartData.length === 0) {
    return (
      <VStack alignItems="center" justifyContent="center" minHeight={200} gap="$2">
        <Ionicons name="swap-horizontal" size={48} color={isDarkMode ? '#8E8E93' : '#3C3C43'} />
        <Text variant="body1" color="$textSecondary" textAlign="center">
          No settlement history
        </Text>
        <Text variant="caption" color="$textSecondary" textAlign="center">
          Settlements will appear here once recorded
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap="$4">
      {/* Summary Stats */}
      <HStack justifyContent="space-between" alignItems="center">
        <VStack gap="$1">
          <Text variant="caption" color="$textSecondary">
            Total Settled
          </Text>
          <Text variant="h5" color="$text" weight="bold">
            {settingsFormatCurrency(totalSettlements)}
          </Text>
        </VStack>
        <VStack gap="$1" alignItems="flex-end">
          <Text variant="caption" color="$textSecondary">
            Settlements
          </Text>
          <Text variant="h5" color="$text" weight="bold">
            {settlementCount}
          </Text>
        </VStack>
      </HStack>

      {/* Chart */}
      <VStack>
        <BarChart
          data={chartData}
          width={screenWidth - 80}
          height={180}
          barWidth={Math.max(20, (screenWidth - 120) / chartData.length - 10)}
          spacing={chartData.length > 6 ? 8 : 15}
          roundedTop
          roundedBottom
          hideRules={false}
          rulesColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          rulesType="solid"
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
          yAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
          yAxisTextStyle={{
            color: isDarkMode ? '#8E8E93' : '#3C3C43',
            fontSize: 10,
          }}
          noOfSections={4}
          maxValue={Math.max(...chartData.map((item) => item.value)) * 1.1}
          isAnimated
          animationDuration={1000}
          yAxisLabelPrefix={symbol}
          formatYLabel={(value: string | number): string => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(1)}k`;
            }
            return numValue.toString();
          }}
        />
      </VStack>

      {/* Recent Settlements */}
      {settlements.length > 0 && (
        <VStack gap="$3">
          <Text variant="body2" color="$text" weight="semibold">
            Recent Settlements
          </Text>
          <VStack gap="$2">
            {settlements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((settlement, index) => (
                <SettlementPressable
                  key={settlement.id || index}
                  onPress={() => onSettlementPress?.(settlement)}>
                  <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    padding="$3"
                    borderRadius="$3"
                    backgroundColor={
                      isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }>
                    <HStack alignItems="center" gap="$3" flex={1}>
                      <VStack
                        width={8}
                        height={8}
                        borderRadius={4}
                        backgroundColor={isDarkMode ? '#4ECDC4' : '#2196F3'}
                      />
                      <VStack flex={1} gap="$1">
                        <Text variant="body2" color="$text" numberOfLines={1}>
                          {settlement.description || 'Settlement'}
                        </Text>
                        <Text variant="caption" color="$textSecondary">
                          {dayjs(settlement.date).format('MMM DD, YYYY')}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text variant="body2" color="$text" weight="semibold">
                      {settingsFormatCurrency(Math.abs(settlement.amount))}
                    </Text>
                  </HStack>
                </SettlementPressable>
              ))}
          </VStack>
        </VStack>
      )}

      {/* Timeline Info */}
      <Text variant="caption" color="$textSecondary" textAlign="center">
        Settlement activity over the last {chartData.length} months
      </Text>
    </VStack>
  );
};
