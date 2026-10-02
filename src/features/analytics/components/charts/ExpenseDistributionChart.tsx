import {VStack, Text} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';

import {MemberBalance} from '@/utils/groupBalanceUtils.optimized';
import {formatUserDisplayName} from '@/utils/userUtils';

import {useSettings} from '@/context';
import {PieBreakdownChart, PIE_BREAKDOWN_COLORS} from './PieBreakdownChart';

interface ExpenseDistributionChartProps {
  memberBalances: MemberBalance[];
  userFirstName?: string;
  getUserDisplayName?: () => string;
}

export const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({
  memberBalances,
  userFirstName,
  getUserDisplayName,
}) => {
  const {formatCurrency: settingsFormatCurrency} = useSettings();

  const chartData = useMemo(() => {
    if (!memberBalances || memberBalances.length === 0) return [];

    // Calculate total expenses for percentage calculation
    const totalExpenses = memberBalances.reduce(
      (sum, member) => sum + Math.abs(member.totalPaid),
      0,
    );

    if (totalExpenses === 0) return [];

    return memberBalances
      .filter((member) => member.totalPaid > 0)
      .map((member, index) => {
        const percentage = (member.totalPaid / totalExpenses) * 100;
        return {
          value: member.totalPaid,
          color: PIE_BREAKDOWN_COLORS[index % PIE_BREAKDOWN_COLORS.length],
          text: `${percentage.toFixed(1)}%`,
          label: formatUserDisplayName(
            member.memberName,
            userFirstName,
            undefined,
            getUserDisplayName,
          ),
          percentage: percentage.toFixed(1),
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by expense amount
  }, [memberBalances, userFirstName, getUserDisplayName]);

  if (chartData.length === 0) {
    return (
      <VStack alignItems="center" justifyContent="center" height={200} gap="$2">
        <Text variant="body1" color="$textSecondary" textAlign="center">
          No expense data available
        </Text>
        <Text variant="caption" color="$textSecondary" textAlign="center">
          Add some transactions to see the distribution
        </Text>
      </VStack>
    );
  }

  return (
    <PieBreakdownChart
      data={chartData}
      title="Expense Distribution"
      formatCurrency={settingsFormatCurrency}
    />
  );
};
