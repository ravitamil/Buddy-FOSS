import {VStack, Text} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';

import type {Transaction} from '@/types';
import {useAuth, useSettings} from '@/context';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';
import {PieBreakdownChart, PIE_BREAKDOWN_COLORS} from './PieBreakdownChart';

/**
 * Humanizes raw category keys like `exp_health_3779e3ea-08fc-4109...` → `Health`
 */
function humanizeCategoryName(raw: string): string {
  // Strip known prefixes
  let name = raw;
  if (name.startsWith('exp_')) name = name.slice(4);
  if (name.startsWith('inc_')) name = name.slice(4);
  // Strip trailing UUID portion (8-4-4-4-12 pattern optionally preceded by underscore)
  name = name.replace(/_?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '');
  // Replace underscores/hyphens with spaces and title-case
  return (
    name
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || raw
  );
}

interface CategorySpendingChartProps {
  transactions: Transaction[];
}

export const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({transactions}) => {
  const {formatCurrency: settingsFormatCurrency} = useSettings();
  const {user} = useAuth();

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Filter for expenses only
    const expenses = transactions.filter(
      (transaction) => getUserTransactionAmountForType(transaction, 'expense', user?.uid) > 0,
    );

    if (expenses.length === 0) return [];

    const totalExpenses = expenses.reduce(
      (sum, transaction) =>
        sum + getUserTransactionAmountForType(transaction, 'expense', user?.uid),
      0,
    );

    if (totalExpenses === 0) return [];

    // Aggregate by category
    const categoryMap = new Map<string, {amount: number; count: number; icon?: string}>();

    expenses.forEach((t) => {
      const categoryName = humanizeCategoryName(t.category || 'Uncategorized');
      const current = categoryMap.get(categoryName) || {amount: 0, count: 0};

      categoryMap.set(categoryName, {
        amount: current.amount + getUserTransactionAmountForType(t, 'expense', user?.uid),
        count: current.count + 1,
        // We don't have easy access to category icon here without context,
        // so we'll rely on the name or pass categories as prop if needed.
        // For now, we'll use a generic icon map or just the name.
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, data], index) => {
        const percentage = (data.amount / totalExpenses) * 100;
        return {
          value: data.amount,
          color: PIE_BREAKDOWN_COLORS[index % PIE_BREAKDOWN_COLORS.length],
          text: `${percentage.toFixed(1)}%`,
          label: name,
          percentage: percentage.toFixed(1),
          count: data.count,
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by amount
  }, [transactions, user?.uid]);

  if (chartData.length === 0) {
    return (
      <VStack alignItems="center" justifyContent="center" height={200} gap="$2">
        <Text variant="body1" color="$textSecondary" textAlign="center">
          No expense data available
        </Text>
        <Text variant="caption" color="$textSecondary" textAlign="center">
          Add some expenses to see category breakdown
        </Text>
      </VStack>
    );
  }

  return (
    <PieBreakdownChart
      data={chartData}
      title="Spending by Category"
      formatCurrency={settingsFormatCurrency}
    />
  );
};
