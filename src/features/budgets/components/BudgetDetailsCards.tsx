import {
  Badge,
  GlassSurface,
  HStack,
  IconTile,
  Text,
  VStack,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View, XStack, useTheme} from 'tamagui';

import {useSettings} from '@/context';
import type {BudgetCycleModel, BudgetSavingsAllocationProgress} from '../model/budgetCycle';

interface BudgetDetailsCardProps {
  model: BudgetCycleModel;
  formatCurrency?: (amount: number) => string;
}

export function BudgetFinancialHealthCard({
  model,
  formatCurrency: formatCurrencyProp,
}: BudgetDetailsCardProps) {
  const theme = useTheme();
  const settings = useSettings();
  const formatCurrency = formatCurrencyProp ?? settings.formatCurrency;

  const healthTone =
    model.financialHealthScore >= 80
      ? 'success'
      : model.financialHealthScore >= 60
        ? 'warning'
        : 'error';

  const healthLabel =
    model.financialHealthScore >= 85
      ? 'Excellent'
      : model.financialHealthScore >= 70
        ? 'On track'
        : model.financialHealthScore >= 50
          ? 'Needs attention'
          : 'At risk';

  const totalSpendingBudget = model.plannedVariableSpending + model.totalCommitted;
  const clampedProgress = Math.max(0, Math.min(model.utilizationPercentage, 100));
  const progressFillColor =
    model.utilizationPercentage > 100
      ? '$expense'
      : model.utilizationPercentage > 85
        ? '$warning'
        : '$income';

  return (
    <GlassSurface padding={20} borderRadius={20}>
      <VStack gap="$3.5">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" gap="$3">
          <HStack alignItems="center" gap="$3" flex={1}>
            <IconTile
              icon="shield-checkmark-outline"
              color={
                healthTone === 'success'
                  ? resolveThemeColor(theme, 'income', '#10b981')
                  : healthTone === 'warning'
                    ? resolveThemeColor(theme, 'warning', '#f59e0b')
                    : resolveThemeColor(theme, 'expense', '#ef4444')
              }
              tone="soft"
              size={44}
              iconSize={22}
              shape="rounded"
            />
            <VStack flex={1} gap="$0.5">
              <Text variant="h5" color="$text" weight="bold">
                Financial Health
              </Text>
              <Text variant="caption" color="$textSecondary">
                Overall score & cycle efficiency
              </Text>
            </VStack>
          </HStack>

          <Badge label={`${model.financialHealthScore}/100 • ${healthLabel}`} tone={healthTone} />
        </HStack>

        {/* Spending Progress Banner */}
        <VStack
          paddingHorizontal="$3.5"
          paddingVertical="$3"
          borderRadius={14}
          backgroundColor="$surfaceHover"
          borderWidth={1}
          borderColor="$borderColor"
          gap="$2.5">
          <HStack justifyContent="space-between" alignItems="baseline">
            <VStack gap="$0.5">
              <Text
                variant="caption"
                color="$textSecondary"
                weight="semibold"
                style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                Recorded Spending
              </Text>
              <Text variant="h3" color="$text" weight="bold">
                {formatCurrency(model.actualSpent)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end" gap="$0.5">
              <Text
                variant="caption"
                color="$textSecondary"
                weight="semibold"
                style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                Planned Budget
              </Text>
              <Text variant="h4" color="$textSecondary" weight="semibold">
                {formatCurrency(totalSpendingBudget)}
              </Text>
            </VStack>
          </HStack>

          {/* Progress bar */}
          <View height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
            <View
              width={`${clampedProgress}%`}
              height="100%"
              backgroundColor={progressFillColor}
              borderRadius={4}
            />
          </View>

          <HStack justifyContent="space-between" alignItems="center">
            <Text
              variant="caption"
              color={model.remainingSpending >= 0 ? '$income' : '$expense'}
              weight="bold">
              {model.remainingSpending >= 0
                ? `${formatCurrency(model.remainingSpending)} remaining`
                : `${formatCurrency(Math.abs(model.remainingSpending))} over budget`}
            </Text>
            <Text variant="caption" color="$textSecondary" weight="medium">
              {Math.round(model.utilizationPercentage)}% used
            </Text>
          </HStack>
        </VStack>

        {/* Velocity Strip */}
        <XStack
          alignItems="center"
          gap="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={12}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor">
          <Ionicons
            name="sparkles"
            size={15}
            color={resolveThemeColor(theme, 'primary', '#f59e0b')}
          />
          <Text variant="caption" color="$text" flex={1}>
            <Text variant="caption" color="$text" weight="bold">
              {formatCurrency(model.dailySafeToSpend)}
            </Text>
            {' / day safe spending for '}
            <Text variant="caption" color="$text" weight="semibold">
              {model.daysRemaining} days left
            </Text>
          </Text>
        </XStack>
      </VStack>
    </GlassSurface>
  );
}

export function BudgetSummaryCard({
  model,
  formatCurrency: formatCurrencyProp,
}: BudgetDetailsCardProps) {
  const theme = useTheme();
  const settings = useSettings();
  const formatCurrency = formatCurrencyProp ?? settings.formatCurrency;

  return (
    <GlassSurface padding={20} borderRadius={20}>
      <VStack gap="$3.5">
        <HStack alignItems="center" gap="$2.5">
          <IconTile
            icon="calculator-outline"
            color={resolveThemeColor(theme, 'primary', '#f59e0b')}
            tone="soft"
            size={36}
            iconSize={18}
            shape="rounded"
          />
          <VStack flex={1}>
            <Text variant="h5" color="$text" weight="bold">
              Budget Summary
            </Text>
            <Text variant="caption" color="$textSecondary">
              Planned income and allocation limits
            </Text>
          </VStack>
        </HStack>

        {/* 2x2 Breakdown Grid */}
        <HStack gap="$2.5">
          <MetricTile
            label="Planned Income"
            value={formatCurrency(model.plannedIncome)}
            icon="arrow-down-circle-outline"
            iconColor={resolveThemeColor(theme, 'income', '#10b981')}
          />
          <MetricTile
            label="Commitments"
            value={formatCurrency(model.totalCommitted)}
            icon="lock-closed-outline"
            iconColor={resolveThemeColor(theme, 'blue10', '#3b82f6')}
          />
        </HStack>
        <HStack gap="$2.5">
          <MetricTile
            label="Flexible Spend"
            value={formatCurrency(model.plannedVariableSpending)}
            icon="bag-handle-outline"
            iconColor={resolveThemeColor(theme, 'warning', '#f59e0b')}
          />
          <MetricTile
            label="Planned Savings"
            value={formatCurrency(model.plannedSavings)}
            icon="wallet-outline"
            iconColor={resolveThemeColor(theme, 'savings', '#8b5cf6')}
          />
        </HStack>

        {/* Unallocated balance row */}
        <HStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$3.5"
          paddingVertical="$2.5"
          borderRadius={12}
          backgroundColor="$surfaceHover"
          borderWidth={1}
          borderColor="$borderColor">
          <VStack gap="$0.5">
            <Text variant="body2" color="$text" weight="bold">
              Unallocated
            </Text>
            <Text variant="caption" color="$textSecondary">
              {model.unallocated >= 0 ? 'Surplus ready to save' : 'Deficit in plan'}
            </Text>
          </VStack>
          <Text variant="h4" color={model.unallocated >= 0 ? '$income' : '$expense'} weight="bold">
            {formatCurrency(model.unallocated)}
          </Text>
        </HStack>
      </VStack>
    </GlassSurface>
  );
}

function MetricTile({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
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
        <Ionicons name={icon} size={14} color={iconColor} />
        <Text
          variant="caption"
          color="$textSecondary"
          weight="semibold"
          numberOfLines={1}
          style={{letterSpacing: 0.3, textTransform: 'uppercase'}}>
          {label}
        </Text>
      </HStack>
      <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
        {value}
      </Text>
    </VStack>
  );
}

export function SavingsGoalsProgressCard({
  allocations,
  formatCurrency,
}: {
  allocations: BudgetSavingsAllocationProgress[];
  formatCurrency: (amount: number) => string;
}) {
  const theme = useTheme();
  if (allocations.length === 0) return null;

  return (
    <GlassSurface padding={20} borderRadius={20}>
      <VStack gap="$3.5">
        <HStack alignItems="center" gap="$2.5">
          <IconTile
            icon="trophy-outline"
            color={resolveThemeColor(theme, 'savings', '#8b5cf6')}
            tone="soft"
            size={36}
            iconSize={18}
            shape="rounded"
          />
          <VStack flex={1}>
            <Text variant="h5" color="$text" weight="bold">
              Savings Goals Progress
            </Text>
            <Text variant="caption" color="$textSecondary">
              Active contributions for this cycle
            </Text>
          </VStack>
        </HStack>

        <VStack gap="$3">
          {allocations.map((allocation) => {
            const progress =
              allocation.targetAmount > 0
                ? Math.min(100, (allocation.currentAmount / allocation.targetAmount) * 100)
                : 0;

            return (
              <VStack
                key={allocation.goalId}
                gap="$2"
                padding="$3"
                borderRadius={12}
                backgroundColor="$surfaceHover"
                borderWidth={1}
                borderColor="$borderColor">
                <HStack justifyContent="space-between" alignItems="center" gap="$2">
                  <Text variant="body1" color="$text" weight="bold" flex={1} numberOfLines={1}>
                    {allocation.goalName}
                  </Text>
                  <Badge
                    label={`${Math.round(progress)}%`}
                    tone={progress >= 100 ? 'success' : 'brand'}
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="baseline">
                  <Text variant="caption" color="$textSecondary">
                    {formatCurrency(allocation.currentAmount)} of{' '}
                    {formatCurrency(allocation.targetAmount)} saved
                  </Text>
                  <Text variant="caption" color="$primary" weight="semibold">
                    +{formatCurrency(allocation.allocatedAmount)} planned
                  </Text>
                </HStack>

                <View height={6} backgroundColor="$borderColor" borderRadius={3} overflow="hidden">
                  <View
                    width={`${progress}%`}
                    height="100%"
                    backgroundColor={resolveThemeColor(theme, 'income', '#10b981')}
                    borderRadius={3}
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
