import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {AnalyticsScreenModel} from '../../hooks/useAnalyticsScreen';

interface AnalyticsOverviewSectionProps {
  screen: AnalyticsScreenModel;
}

export const AnalyticsOverviewSection: React.FC<AnalyticsOverviewSectionProps> = ({screen}) => {
  const {isDarkMode} = useTamaguiTheme();
  const isNetPositive = screen.netBalance >= 0;

  const getBudgetStatusColor = (usage: number): string => {
    if (usage > 100) return '#EF4444'; // Red
    if (usage > 80) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  return (
    <VStack gap="$3">
      {/* Primary Hero Cash Flow Glass Card */}
      <GlassSurface
        padding="$4"
        borderRadius={24}
        washColor={
          isNetPositive
            ? isDarkMode
              ? 'rgba(34, 197, 94, 0.12)'
              : 'rgba(34, 197, 94, 0.08)'
            : isDarkMode
              ? 'rgba(239, 68, 68, 0.12)'
              : 'rgba(239, 68, 68, 0.08)'
        }
        style={{overflow: 'hidden'}}>
        <VStack gap="$3">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack gap="$0.5">
              <Text
                variant="caption"
                color="$textSecondary"
                weight="medium"
                textTransform="uppercase"
                letterSpacing={0.5}>
                Net Cash Flow
              </Text>
              <Text variant="h2" color="$text" weight="bold">
                {screen.formatCurrency(screen.netBalance)}
              </Text>
            </VStack>

            {/* Comparison Badge */}
            {screen.priorExpenses > 0 || screen.priorIncome > 0 ? (
              <HStack
                alignItems="center"
                gap="$1"
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius="$6"
                backgroundColor={
                  screen.netChangePct >= 0
                    ? isDarkMode
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(34, 197, 94, 0.12)'
                    : isDarkMode
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(239, 68, 68, 0.12)'
                }>
                <Ionicons
                  name={screen.netChangePct >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={screen.netChangePct >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  variant="caption"
                  weight="bold"
                  color={screen.netChangePct >= 0 ? '$green10' : '$red10'}>
                  {screen.netChangePct >= 0 ? '+' : ''}
                  {screen.netChangePct.toFixed(0)}%
                </Text>
              </HStack>
            ) : null}
          </HStack>

          {/* 2x2 Metric Grid */}
          <HStack gap="$2.5" flexWrap="wrap">
            {/* Inflow */}
            <VStack
              flex={1}
              minWidth={140}
              padding="$3"
              borderRadius={16}
              backgroundColor={
                isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }
              gap="$1.5">
              <HStack alignItems="center" gap="$1.5">
                <VStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="rgba(16, 185, 129, 0.15)"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="arrow-down" size={14} color="#10B981" />
                </VStack>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  Total Income
                </Text>
              </HStack>
              <Text variant="h6" color="$text" weight="bold">
                {screen.formatCurrency(screen.totalIncome)}
              </Text>
            </VStack>

            {/* Outflow */}
            <VStack
              flex={1}
              minWidth={140}
              padding="$3"
              borderRadius={16}
              backgroundColor={
                isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }
              gap="$1.5">
              <HStack alignItems="center" gap="$1.5">
                <VStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="rgba(239, 68, 68, 0.15)"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="arrow-up" size={14} color="#EF4444" />
                </VStack>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  Total Expenses
                </Text>
              </HStack>
              <Text variant="h6" color="$text" weight="bold">
                {screen.formatCurrency(screen.totalExpenses)}
              </Text>
            </VStack>

            {/* Savings Rate */}
            <VStack
              flex={1}
              minWidth={140}
              padding="$3"
              borderRadius={16}
              backgroundColor={
                isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }
              gap="$1.5">
              <HStack alignItems="center" gap="$1.5">
                <VStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="rgba(59, 130, 246, 0.15)"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="shield-checkmark" size={14} color="#3B82F6" />
                </VStack>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  Savings Rate
                </Text>
              </HStack>
              <Text variant="h6" color="$text" weight="bold">
                {screen.savingsRate.toFixed(1)}%
              </Text>
            </VStack>

            {/* Daily Burn Rate */}
            <VStack
              flex={1}
              minWidth={140}
              padding="$3"
              borderRadius={16}
              backgroundColor={
                isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }
              gap="$1.5">
              <HStack alignItems="center" gap="$1.5">
                <VStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="rgba(168, 85, 247, 0.15)"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="calendar-outline" size={14} color="#A855F7" />
                </VStack>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  Daily Average
                </Text>
              </HStack>
              <Text variant="h6" color="$text" weight="bold">
                {screen.formatCurrency(screen.dailyAverage)}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </GlassSurface>

      {/* Active Budget Progress Card (Optional if budget exists) */}
      {screen.hasActiveBudget && (
        <GlassSurface padding="$3.5" borderRadius={20}>
          <VStack gap="$2.5">
            <HStack justifyContent="space-between" alignItems="center">
              <HStack alignItems="center" gap="$2">
                <Ionicons name="pie-chart-outline" size={18} color="#3B82F6" />
                <Text variant="body2" color="$text" weight="semibold">
                  Budget Tracking
                </Text>
              </HStack>
              <Text
                variant="caption"
                weight="bold"
                style={{color: getBudgetStatusColor(screen.budgetUsagePct)}}>
                {screen.budgetUsagePct.toFixed(0)}% used
              </Text>
            </HStack>

            {/* Progress Bar Track */}
            <VStack
              height={8}
              width="100%"
              borderRadius={4}
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
              style={{overflow: 'hidden'}}>
              <VStack
                height={8}
                width={`${Math.min(100, screen.budgetUsagePct)}%`}
                borderRadius={4}
                backgroundColor={getBudgetStatusColor(screen.budgetUsagePct)}
              />
            </VStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" color="$textSecondary">
                Spent: {screen.formatCurrency(screen.totalExpenses)}
              </Text>
              <Text variant="caption" color="$textSecondary">
                Remaining: {screen.formatCurrency(Math.max(0, screen.budgetRemaining))}
              </Text>
            </HStack>
          </VStack>
        </GlassSurface>
      )}
    </VStack>
  );
};
