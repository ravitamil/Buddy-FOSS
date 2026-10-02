import {VStack, HStack, Text} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {PieChart} from 'react-native-gifted-charts';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {Transaction, GroupMember} from '@/types';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useSettings} from '@/context';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';

function humanizeCategoryName(raw: string): string {
  let name = raw;
  if (name.startsWith('exp_')) name = name.slice(4);
  if (name.startsWith('inc_')) name = name.slice(4);
  name = name.replace(/_?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '');
  return (
    name
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || raw
  );
}

interface ComparisonMetricsChartProps {
  transactions: Transaction[];
  members: GroupMember[];
  groupId: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ComparisonMetricsChart: React.FC<ComparisonMetricsChartProps> = ({
  transactions,
  members,
  groupId,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {formatCurrency: settingsFormatCurrency} = useSettings();

  const metrics = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSpent: 0,
        avgPerMember: 0,
        settlementRatio: 0,
        activeMembers: 0,
        monthlyTrend: 0,
        topSpender: null,
        memberComparison: [],
        categoryBreakdown: [],
      };
    }

    const totalSpent = transactions.reduce(
      (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense'),
      0,
    );
    const avgPerMember = members.length > 0 ? totalSpent / members.length : 0;

    // Calculate settlement ratio (settled vs pending)
    const settlements = transactions.filter(
      (t) => t.description?.toLowerCase().includes('settlement') || t.category === 'Settlement',
    );
    const settlementAmount = settlements.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const settlementRatio = totalSpent > 0 ? (settlementAmount / totalSpent) * 100 : 0;

    // Active members (members with transactions)
    const activeMembers = new Set(transactions.map((t) => t.paidBy).filter(Boolean)).size;

    // Monthly trend (current vs previous month)
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthSpent = transactions
      .filter((t) => new Date(t.date) >= currentMonth)
      .reduce(
        (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense'),
        0,
      );

    const previousMonthSpent = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return date >= previousMonth && date < currentMonth;
      })
      .reduce(
        (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense'),
        0,
      );

    const monthlyTrend =
      previousMonthSpent > 0
        ? ((currentMonthSpent - previousMonthSpent) / previousMonthSpent) * 100
        : 0;

    // Member comparison (top spender)
    const memberSpending: {[key: string]: number} = {};
    transactions.forEach((t) => {
      if (t.paidBy && !memberSpending[t.paidBy]) memberSpending[t.paidBy] = 0;
      if (t.paidBy) {
        memberSpending[t.paidBy] += getUserTransactionAmountForType(t, 'expense');
      }
    });

    const memberComparison = Object.entries(memberSpending)
      .map(([userId, amount]) => {
        const member = members.find((m) => m.id === userId);
        return {
          name: member?.name || 'Unknown',
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const topSpender = memberComparison[0] || null;

    // Category breakdown
    const categorySpending: {[key: string]: number} = {};
    transactions.forEach((t) => {
      const category = humanizeCategoryName(t.category || 'Other');
      if (!categorySpending[category]) categorySpending[category] = 0;
      categorySpending[category] += getUserTransactionAmountForType(t, 'expense');
    });

    const categoryBreakdown = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalSpent,
      avgPerMember,
      settlementRatio,
      activeMembers,
      monthlyTrend,
      topSpender,
      memberComparison,
      categoryBreakdown,
    };
  }, [transactions, members]);

  // Use global settings currency formatter for consistency across the app

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Spent',
      value: settingsFormatCurrency(metrics.totalSpent),
      change: metrics.monthlyTrend,
      icon: 'wallet-outline',
      color: isDarkMode ? '#4ECDC4' : '#2196F3',
    },
    {
      title: 'Avg per Member',
      value: settingsFormatCurrency(metrics.avgPerMember),
      change: 0,
      icon: 'people-outline',
      color: isDarkMode ? '#45B7D1' : '#1976D2',
    },
    {
      title: 'Settlement Rate',
      value: `${metrics.settlementRatio.toFixed(1)}%`,
      change: 0,
      icon: 'swap-horizontal-outline',
      color: isDarkMode ? '#66BB6A' : '#4CAF50',
    },
    {
      title: 'Active Members',
      value: `${metrics.activeMembers}/${members.length}`,
      change: 0,
      icon: 'person-outline',
      color: isDarkMode ? '#FFA726' : '#FF9800',
    },
  ];

  const memberChartData = metrics.memberComparison.slice(0, 5).map((member, index) => {
    const colors = isDarkMode
      ? ['#4ECDC4', '#45B7D1', '#66BB6A', '#FFA726', '#EF5350']
      : ['#2196F3', '#1976D2', '#4CAF50', '#FF9800', '#F44336'];

    return {
      value: member.amount,
      color: colors[index % colors.length],
      gradientCenterColor: colors[index % colors.length],
      focused: index === 0,
      text: member.name.split(' ')[0],
    };
  });

  if (transactions.length === 0) {
    return (
      <VStack alignItems="center" justifyContent="center" height={200} gap="$2">
        <Ionicons name="analytics-outline" size={48} color={isDarkMode ? '#8E8E93' : '#3C3C43'} />
        <Text variant="body1" color="$textSecondary" textAlign="center">
          No data for comparison
        </Text>
        <Text variant="caption" color="$textSecondary" textAlign="center">
          Metrics will appear once transactions are recorded
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap="$4">
      {/* Metric Cards */}
      <VStack gap="$3">
        <Text variant="body2" color="$text" weight="semibold">
          Group Financial Health
        </Text>
        <VStack gap="$2">
          {metricCards.map((metric, index) => (
            <HStack
              key={index}
              alignItems="center"
              justifyContent="space-between"
              padding="$3"
              borderRadius="$3"
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}>
              <HStack alignItems="center" gap="$3">
                <VStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={`${metric.color}20`}
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name={metric.icon} size={20} color={metric.color} />
                </VStack>
                <VStack gap="$1">
                  <Text variant="caption" color="$textSecondary">
                    {metric.title}
                  </Text>
                  <Text variant="body1" color="$text" weight="semibold">
                    {metric.value}
                  </Text>
                </VStack>
              </HStack>
              {metric.change !== 0 && (
                <HStack alignItems="center" gap="$1">
                  <Ionicons
                    name={metric.change > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={metric.change > 0 ? '#66BB6A' : '#EF5350'}
                  />
                  <Text
                    variant="caption"
                    color={metric.change > 0 ? '$success' : '$error'}
                    weight="semibold">
                    {formatPercentage(metric.change)}
                  </Text>
                </HStack>
              )}
            </HStack>
          ))}
        </VStack>
      </VStack>

      {/* Member Spending Comparison */}
      {memberChartData.length > 0 && (
        <VStack gap="$3">
          <Text variant="body2" color="$text" weight="semibold">
            Member Spending Distribution
          </Text>
          <HStack alignItems="center" justifyContent="center">
            <PieChart
              data={memberChartData}
              donut
              showGradient
              sectionAutoFocus
              radius={80}
              innerRadius={50}
              innerCircleColor={isDarkMode ? '#1C1C1E' : '#FFFFFF'}
              centerLabelComponent={() => (
                <VStack alignItems="center">
                  <Text variant="caption" color="$textSecondary">
                    Top Spender
                  </Text>
                  <Text variant="body2" color="$text" weight="bold">
                    {metrics.topSpender?.name.split(' ')[0] || 'N/A'}
                  </Text>
                </VStack>
              )}
            />
          </HStack>
          <VStack gap="$2">
            {metrics.memberComparison.slice(0, 3).map((member, index) => (
              <HStack key={index} alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" gap="$2">
                  <VStack
                    width={12}
                    height={12}
                    borderRadius={6}
                    backgroundColor={memberChartData[index]?.color || '#666'}
                  />
                  <Text variant="body2" color="$text">
                    {member.name}
                  </Text>
                </HStack>
                <HStack alignItems="center" gap="$2">
                  <Text variant="body2" color="$text" weight="semibold">
                    {settingsFormatCurrency(member.amount)}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    ({member.percentage.toFixed(1)}%)
                  </Text>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Category Breakdown */}
      {metrics.categoryBreakdown.length > 0 && (
        <VStack gap="$3">
          <Text variant="body2" color="$text" weight="semibold">
            Top Spending Categories
          </Text>
          <VStack gap="$2">
            {metrics.categoryBreakdown.map((category, index) => (
              <HStack key={index} alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" gap="$3" flex={1}>
                  <Text variant="body2" color="$text">
                    {category.category}
                  </Text>
                  <VStack flex={1} height={6} backgroundColor="$backgroundSoft" borderRadius={3}>
                    <VStack
                      height={6}
                      width={`${category.percentage}%`}
                      backgroundColor={isDarkMode ? '#4ECDC4' : '#2196F3'}
                      borderRadius={3}
                    />
                  </VStack>
                </HStack>
                <Text variant="body2" color="$text" weight="semibold">
                  {settingsFormatCurrency(category.amount)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Summary */}
      <VStack
        padding="$3"
        borderRadius="$3"
        backgroundColor={isDarkMode ? 'rgba(76, 205, 196, 0.1)' : 'rgba(33, 150, 243, 0.1)'}
        borderWidth={1}
        borderColor={isDarkMode ? 'rgba(76, 205, 196, 0.2)' : 'rgba(33, 150, 243, 0.2)'}>
        <HStack alignItems="center" gap="$2" marginBottom="$2">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={isDarkMode ? '#4ECDC4' : '#2196F3'}
          />
          <Text variant="body2" color="$text" weight="semibold">
            Group Insights
          </Text>
        </HStack>
        <Text variant="caption" color="$textSecondary" lineHeight={18}>
          {metrics.settlementRatio > 80
            ? 'Great job! Your group maintains excellent settlement habits.'
            : metrics.settlementRatio > 50
              ? 'Good settlement rate. Consider settling pending amounts regularly.'
              : 'Low settlement rate. Encourage members to settle their balances.'}
        </Text>
      </VStack>
    </VStack>
  );
};
