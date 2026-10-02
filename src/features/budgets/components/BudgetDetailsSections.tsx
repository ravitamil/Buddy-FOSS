import {
  Button,
  GlassSurface,
  HStack,
  IconTile,
  Text,
  VStack,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View, useTheme} from 'tamagui';

import type {BudgetCycleModel} from '../model/budgetCycle';

interface AllocationItem {
  label: string;
  amount: number;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

export function BudgetAllocationChart({
  model,
  formatCurrency,
}: {
  model: BudgetCycleModel;
  formatCurrency: (amount: number) => string;
}) {
  const theme = useTheme();

  const items: AllocationItem[] = [
    {
      label: 'Flexible spending',
      amount: model.plannedVariableSpending,
      color: resolveThemeColor(theme, 'primary', '#f59e0b'),
      icon: 'bag-handle-outline',
    },
    {
      label: 'Loans',
      amount: model.committedLoans,
      color: resolveThemeColor(theme, 'blue10', '#3b82f6'),
      icon: 'card-outline',
    },
    {
      label: 'Subscriptions',
      amount: model.committedSubscriptions,
      color: resolveThemeColor(theme, 'savings', '#8b5cf6'),
      icon: 'calendar-outline',
    },
    {
      label: 'Recurring expenses',
      amount: model.committedRecurringExpenses,
      color: resolveThemeColor(theme, 'warning', '#f59e0b'),
      icon: 'repeat-outline',
    },
    {
      label: 'Savings',
      amount: model.plannedSavings,
      color: resolveThemeColor(theme, 'income', '#10b981'),
      icon: 'wallet-outline',
    },
    {
      label: 'Other allocations',
      amount: model.plannedCustomAllocations,
      color: resolveThemeColor(theme, 'pink10', '#ec4899'),
      icon: 'options-outline',
    },
  ];

  const allocatedRows = items.filter((item) => item.amount > 0);
  const totalAllocated = allocatedRows.reduce((sum, item) => sum + item.amount, 0);

  return (
    <GlassSurface padding={20} borderRadius={20}>
      <VStack gap="$3.5">
        <HStack alignItems="center" gap="$2.5">
          <IconTile
            icon="pie-chart-outline"
            color={resolveThemeColor(theme, 'primary', '#f59e0b')}
            tone="soft"
            size={36}
            iconSize={18}
            shape="rounded"
          />
          <VStack flex={1}>
            <Text variant="h5" color="$text" weight="bold">
              Planned Allocation
            </Text>
            <Text variant="caption" color="$textSecondary">
              Breakdown of total planned outflow
            </Text>
          </VStack>
        </HStack>

        {/* Multi-segment stacked bar preview */}
        {totalAllocated > 0 && (
          <View height={10} backgroundColor="$borderColor" borderRadius={5} overflow="hidden">
            <HStack height="100%" width="100%">
              {allocatedRows.map((item) => {
                const pct = (item.amount / totalAllocated) * 100;
                return (
                  <View
                    key={item.label}
                    height="100%"
                    width={`${pct}%`}
                    backgroundColor={item.color}
                  />
                );
              })}
            </HStack>
          </View>
        )}

        {/* Individual Category Allocation Rows */}
        <VStack gap="$2.5" paddingTop="$1">
          {allocatedRows.map((item) => {
            const pct = totalAllocated > 0 ? (item.amount / totalAllocated) * 100 : 0;
            return (
              <VStack
                key={item.label}
                gap="$1.5"
                padding="$2.5"
                borderRadius={12}
                backgroundColor="$surfaceHover">
                <HStack justifyContent="space-between" alignItems="center" gap="$2">
                  <HStack alignItems="center" gap="$2" flex={1}>
                    <Ionicons name={item.icon} size={15} color={item.color} />
                    <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text variant="caption" color="$textSecondary">
                      • {pct.toFixed(0)}%
                    </Text>
                  </HStack>
                  <Text variant="body2" color="$text" weight="bold">
                    {formatCurrency(item.amount)}
                  </Text>
                </HStack>

                <View height={4} backgroundColor="$borderColor" borderRadius={2} overflow="hidden">
                  <View
                    width={`${pct}%`}
                    height="100%"
                    backgroundColor={item.color}
                    borderRadius={2}
                  />
                </View>
              </VStack>
            );
          })}
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

export function BudgetCycleInsights({
  model,
  formatCurrency,
}: {
  model: BudgetCycleModel;
  formatCurrency: (amount: number) => string;
}) {
  const theme = useTheme();

  return (
    <GlassSurface padding={20} borderRadius={20}>
      <VStack gap="$3.5">
        <HStack alignItems="center" gap="$2.5">
          <IconTile
            icon="analytics-outline"
            color={resolveThemeColor(theme, 'blue10', '#3b82f6')}
            tone="soft"
            size={36}
            iconSize={18}
            shape="rounded"
          />
          <VStack flex={1}>
            <Text variant="h5" color="$text" weight="bold">
              Cycle Insights
            </Text>
            <Text variant="caption" color="$textSecondary">
              Real-time activity for this cycle
            </Text>
          </VStack>
        </HStack>

        <HStack gap="$2.5">
          <InsightTile
            label="Recorded Income"
            value={formatCurrency(model.actualIncome)}
            icon="arrow-down-circle-outline"
            color={resolveThemeColor(theme, 'income', '#10b981')}
          />
          <InsightTile
            label="Recorded Spend"
            value={formatCurrency(model.actualSpent)}
            icon="receipt-outline"
            color={resolveThemeColor(theme, 'expense', '#ef4444')}
          />
        </HStack>

        <HStack gap="$2.5">
          <InsightTile
            label="Daily Safe Spend"
            value={formatCurrency(model.dailySafeToSpend)}
            icon="sparkles-outline"
            color={resolveThemeColor(theme, 'primary', '#f59e0b')}
          />
          <InsightTile
            label="Days Remaining"
            value={`${model.daysRemaining} days`}
            icon="time-outline"
            color={resolveThemeColor(theme, 'savings', '#8b5cf6')}
          />
        </HStack>
      </VStack>
    </GlassSurface>
  );
}

function InsightTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <VStack
      flex={1}
      padding="$3"
      borderRadius={12}
      backgroundColor="$surfaceHover"
      borderWidth={1}
      borderColor="$borderColor"
      gap="$1.5">
      <HStack alignItems="center" gap="$1.5">
        <Ionicons name={icon} size={14} color={color} />
        <Text
          variant="caption"
          color="$textSecondary"
          weight="semibold"
          style={{letterSpacing: 0.3, textTransform: 'uppercase'}}
          numberOfLines={1}>
          {label}
        </Text>
      </HStack>
      <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
        {value}
      </Text>
    </VStack>
  );
}

export function BudgetDetailsActions({
  onEditBudget,
  onOpenTransactions,
}: {
  onEditBudget: () => void;
  onOpenTransactions: () => void;
}) {
  return (
    <HStack gap="$3">
      <Button
        variant="outline"
        flex={1}
        onPress={onEditBudget}
        leftIcon={<Ionicons name="pencil-outline" size={16} />}>
        Edit plan
      </Button>
      <Button
        variant="primary"
        flex={1}
        onPress={onOpenTransactions}
        leftIcon={<Ionicons name="receipt-outline" size={16} color="white" />}>
        View transactions
      </Button>
    </HStack>
  );
}
