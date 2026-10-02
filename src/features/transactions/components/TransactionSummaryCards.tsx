import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {XStack, YStack} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {TransactionSummary} from '../types';

interface TransactionSummaryCardsProps {
  summary: TransactionSummary;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}

export function TransactionSummaryCards({
  summary,
  isDarkMode: _isDarkMode,
  formatCurrency,
}: TransactionSummaryCardsProps) {
  const isPositiveNet = summary.netAmount >= 0;
  const totalVolume = summary.totalIncome + summary.totalExpenses;
  const incomeRatio = totalVolume > 0 ? (summary.totalIncome / totalVolume) * 100 : 50;

  return (
    <GlassSurface padding="$4" borderRadius={18}>
      <VStack gap="$3">
        {/* Main 3 Metrics */}
        <HStack gap="$2" justifyContent="space-between">
          {/* Income */}
          <VStack flex={1} alignItems="flex-start" gap="$1">
            <XStack alignItems="center" gap="$1">
              <Ionicons name="arrow-down" size={14} color="$badgeSuccessText" />
              <Text variant="caption" color="$colorSubtitle" weight="medium">
                Income
              </Text>
            </XStack>
            <Text variant="h4" color="$badgeSuccessText" weight="bold" numberOfLines={1}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </VStack>

          {/* Expenses */}
          <VStack flex={1} alignItems="center" gap="$1">
            <XStack alignItems="center" gap="$1">
              <Ionicons name="arrow-up" size={14} color="$badgeDangerText" />
              <Text variant="caption" color="$colorSubtitle" weight="medium">
                Expenses
              </Text>
            </XStack>
            <Text variant="h4" color="$badgeDangerText" weight="bold" numberOfLines={1}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </VStack>

          {/* Net Cash Flow */}
          <VStack flex={1} alignItems="flex-end" gap="$1">
            <XStack alignItems="center" gap="$1">
              <Ionicons
                name={isPositiveNet ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositiveNet ? '$badgeSuccessText' : '$badgeDangerText'}
              />
              <Text variant="caption" color="$colorSubtitle" weight="medium">
                Net
              </Text>
            </XStack>
            <Text
              variant="h4"
              color={isPositiveNet ? '$badgeSuccessText' : '$badgeDangerText'}
              weight="bold"
              numberOfLines={1}>
              {formatCurrency(summary.netAmount)}
            </Text>
          </VStack>
        </HStack>

        {/* Cash Flow Distribution Bar */}
        {totalVolume > 0 && (
          <YStack gap="$1.5" marginTop="$1">
            <XStack
              height={6}
              width="100%"
              borderRadius={3}
              overflow="hidden"
              backgroundColor="$badgeDangerBg">
              <YStack
                height="100%"
                width={`${Math.min(Math.max(incomeRatio, 0), 100)}%`}
                backgroundColor="$badgeSuccessText"
              />
            </XStack>
            <HStack justifyContent="space-between">
              <Text variant="caption" color="$colorSubtitle">
                {incomeRatio.toFixed(0)}% Inflow
              </Text>
              <Text variant="caption" color="$colorSubtitle">
                {(100 - incomeRatio).toFixed(0)}% Outflow
              </Text>
            </HStack>
          </YStack>
        )}
      </VStack>
    </GlassSurface>
  );
}
