import {VStack, HStack, Text} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {LineChart} from 'react-native-gifted-charts';
import {useWindowDimensions} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {Transaction} from '@/types';
import dayjs from 'dayjs';

import {getCurrencySymbol} from '@/constants/currencies';
import {useAuth, useSettings} from '@/context';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';

interface SpendingTrendsChartProps {
  transactions: Transaction[];
  timeRange?: 'week' | 'month' | '3months' | '6months';
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  transactions,
  timeRange = 'week',
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {width: screenWidth} = useWindowDimensions();
  const {formatCurrency: settingsFormatCurrency, currency} = useSettings();
  const {user} = useAuth();
  const symbol = getCurrencySymbol(currency);

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Filter transactions based on time range
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    let groupBy: 'day' | 'week' | 'month';
    let format: string;

    switch (timeRange) {
      case 'week':
        startDate = now.subtract(7, 'days');
        groupBy = 'day';
        format = 'MMM DD';
        break;
      case '3months':
        startDate = now.subtract(3, 'months');
        groupBy = 'week';
        format = 'MMM DD';
        break;
      case '6months':
        startDate = now.subtract(6, 'months');
        groupBy = 'month';
        format = 'MMM';
        break;
      default: // month
        startDate = now.subtract(1, 'month');
        groupBy = 'day';
        format = 'MMM DD';
    }

    // Filter transactions within the time range
    const filteredTransactions = transactions.filter((transaction) =>
      dayjs(transaction.date).isAfter(startDate),
    );

    // If no transactions in range, fall back to all-time grouped by month
    if (filteredTransactions.length === 0) {
      const allTimeMap: {[key: string]: number} = {};
      transactions.forEach((t) => {
        const key = dayjs(t.date).format('MMM YY');
        if (!allTimeMap[key]) allTimeMap[key] = 0;
        allTimeMap[key] += getUserTransactionAmountForType(t, 'expense', user?.uid);
      });
      // Sort by date
      const sortedKeys = Object.keys(allTimeMap).sort(
        (a, b) => dayjs(a, 'MMM YY').valueOf() - dayjs(b, 'MMM YY').valueOf(),
      );
      return sortedKeys.map((key) => ({
        value: allTimeMap[key],
        label: key,
        dataPointText: `${symbol}${allTimeMap[key].toFixed(0)}`,
      }));
    }

    // Group transactions by time period
    const groupedData: {[key: string]: number} = {};

    // Initialize periods with zero values
    const periods: string[] = [];
    let current = startDate;
    while (current.isBefore(now) || current.isSame(now, 'day')) {
      const key = current.format(format);
      periods.push(key);
      groupedData[key] = 0;

      if (groupBy === 'day') {
        current = current.add(1, 'day');
      } else if (groupBy === 'week') {
        current = current.add(1, 'week');
      } else {
        current = current.add(1, 'month');
      }
    }

    // Aggregate transaction amounts
    filteredTransactions.forEach((transaction) => {
      const transactionDate = dayjs(transaction.date);
      let key: string;

      if (groupBy === 'day') {
        key = transactionDate.format(format);
      } else if (groupBy === 'week') {
        key = transactionDate.startOf('week').format(format);
      } else {
        key = transactionDate.format(format);
      }

      if (groupedData.hasOwnProperty(key)) {
        groupedData[key] += getUserTransactionAmountForType(transaction, 'expense', user?.uid);
      }
    });

    // Convert to chart format
    return periods.map((period) => ({
      value: groupedData[period] || 0,
      label: period,
      dataPointText: `${symbol}${(groupedData[period] || 0).toFixed(0)}`,
    }));
  }, [transactions, timeRange, user?.uid]);

  // Use global settings currency formatter for consistency across the app

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((item) => item.value));
  }, [chartData]);

  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <VStack alignItems="center" justifyContent="center" height={200} gap="$2">
        <Text variant="body1" color="$textSecondary" textAlign="center">
          No spending data available
        </Text>
        <Text variant="caption" color="$textSecondary" textAlign="center">
          Add some transactions to see spending trends
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
            Total Spending
          </Text>
          <Text variant="h5" color="$text" weight="bold">
            {settingsFormatCurrency(totalSpending)}
          </Text>
        </VStack>
        <VStack gap="$1" alignItems="flex-end">
          <Text variant="caption" color="$textSecondary">
            Peak Day
          </Text>
          <Text variant="h5" color="$text" weight="bold">
            {settingsFormatCurrency(maxValue)}
          </Text>
        </VStack>
      </HStack>

      {/* Chart */}
      <VStack>
        <LineChart
          data={chartData}
          width={screenWidth - 80}
          height={180}
          color={isDarkMode ? '#4ECDC4' : '#2196F3'}
          thickness={3}
          startFillColor={isDarkMode ? 'rgba(78, 205, 196, 0.3)' : 'rgba(33, 150, 243, 0.3)'}
          endFillColor={isDarkMode ? 'rgba(78, 205, 196, 0.05)' : 'rgba(33, 150, 243, 0.05)'}
          startOpacity={0.9}
          endOpacity={0.2}
          initialSpacing={0}
          noOfSections={4}
          maxValue={maxValue * 1.1}
          yAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
          xAxisColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
          yAxisTextStyle={{
            color: isDarkMode ? '#8E8E93' : '#3C3C43',
            fontSize: 10,
          }}
          xAxisLabelTextStyle={{
            color: isDarkMode ? '#8E8E93' : '#3C3C43',
            fontSize: 10,
            textAlign: 'center',
          }}
          dataPointsColor={isDarkMode ? '#4ECDC4' : '#2196F3'}
          dataPointsRadius={4}
          textShiftY={-8}
          textShiftX={-10}
          textFontSize={10}
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          areaChart
          curved
          hideRules={false}
          rulesColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          rulesType="solid"
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

      {/* Time Range Info */}
      <Text variant="caption" color="$textSecondary" textAlign="center">
        Showing spending trends for the last{' '}
        {timeRange === 'week'
          ? '7 days'
          : timeRange === '3months'
            ? '3 months'
            : timeRange === '6months'
              ? '6 months'
              : '30 days'}
      </Text>
    </VStack>
  );
};
