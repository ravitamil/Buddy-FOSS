import {Badge, HStack, IconTile, Text, VStack, resolveThemeColor} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View, XStack, useTheme} from 'tamagui';

import {BudgetPlanningGlassFrame} from './BudgetPlanningGlassFrame';
import type {BudgetData} from './budgetPlanningTypes';

export function BudgetOverview({
  budgetData,
  formatCurrency,
  onViewDetails,
}: {
  budgetData: BudgetData;
  formatCurrency: (amount: number) => string;
  onViewDetails: () => void;
}) {
  const theme = useTheme();

  const budgetName = budgetData.budgetName || `${budgetData.periodLabel} Plan`;
  const period = budgetData.period
    ? budgetData.period.charAt(0).toUpperCase() + budgetData.period.slice(1)
    : 'Monthly';
  const utilization = Math.round(budgetData.utilizationPercentage);
  const utilizationTone = utilization > 100 ? 'error' : utilization > 85 ? 'warning' : 'info';
  const progressFillColor =
    utilization > 100 ? '$expense' : utilization > 85 ? '$warning' : '$income';
  const daysRemaining = budgetData.daysRemaining ?? 0;

  return (
    <VStack width="100%" gap="$3" marginTop="$2">
      <Text color="$text" weight="bold" variant="h5">
        Your budget
      </Text>
      <BudgetPlanningGlassFrame
        padding={20}
        accessibilityLabel={`View ${budgetName} details`}
        onPress={onViewDetails}>
        <VStack gap="$3.5">
          {/* Header */}
          <HStack alignItems="center" justifyContent="space-between" gap="$3">
            <HStack alignItems="center" gap="$3" flex={1} minWidth={0}>
              <View flexShrink={0}>
                <IconTile
                  icon="pie-chart-outline"
                  color={resolveThemeColor(theme, 'primary', '#f59e0b')}
                  tone="soft"
                  size={44}
                  iconSize={22}
                  shape="rounded"
                />
              </View>
              <VStack flex={1} minWidth={0} gap="$0.5">
                <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                  {budgetName}
                </Text>
                <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                  Active • {period} plan
                </Text>
              </VStack>
            </HStack>

            <HStack alignItems="center" gap="$2" flexShrink={0}>
              <Badge label={`${utilization}% used`} tone={utilizationTone} />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
              />
            </HStack>
          </HStack>

          {/* Progress bar */}
          <View height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
            <View
              width={`${Math.max(0, Math.min(budgetData.utilizationPercentage, 100))}%`}
              height="100%"
              backgroundColor={progressFillColor}
              borderRadius={4}
            />
          </View>

          {/* Spent & Remaining metrics row */}
          <HStack justifyContent="space-between" gap="$3" paddingTop="$1">
            <VStack flex={1} gap="$1">
              <Text
                variant="caption"
                color="$textSecondary"
                weight="semibold"
                style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                Spent
              </Text>
              <Text variant="h4" color="$text" weight="bold">
                {formatCurrency(budgetData.actualSpent)}
              </Text>
            </VStack>

            <VStack flex={1} alignItems="flex-end" gap="$1">
              <Text
                variant="caption"
                color="$textSecondary"
                weight="semibold"
                style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                Remaining
              </Text>
              <Text
                variant="h4"
                color={budgetData.remainingSpending >= 0 ? '$income' : '$expense'}
                weight="bold">
                {formatCurrency(budgetData.remainingSpending)}
              </Text>
            </VStack>
          </HStack>

          {/* Daily velocity pill */}
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={12}
            backgroundColor="$surfaceHover"
            borderWidth={1}
            borderColor="$borderColor">
            <Ionicons
              name="sparkles"
              size={15}
              color={resolveThemeColor(theme, 'primary', '#f59e0b')}
            />
            <Text variant="caption" color="$text" flex={1}>
              <Text variant="caption" color="$text" weight="bold">
                {formatCurrency(budgetData.dailySafeToSpend)}
              </Text>
              {' / day available for '}
              <Text variant="caption" color="$text" weight="semibold">
                {daysRemaining} days
              </Text>
            </Text>
          </XStack>
        </VStack>
      </BudgetPlanningGlassFrame>
    </VStack>
  );
}
