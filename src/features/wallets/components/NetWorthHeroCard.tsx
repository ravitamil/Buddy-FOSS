import {Badge, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View} from 'tamagui';

import type {NetWorthSummary} from '@/types';
import type {DebtHealthInfo} from '../hooks/useNetWorthScreen';

interface NetWorthHeroCardProps {
  summary: NetWorthSummary;
  formatCurrency: (amount: number) => string;
  assetCount: number;
  liabilityCount: number;
  debtHealth: DebtHealthInfo;
}

export const NetWorthHeroCard = ({
  summary,
  formatCurrency,
  assetCount,
  liabilityCount,
  debtHealth,
}: NetWorthHeroCardProps) => {
  const isPositive = summary.netWorth >= 0;
  const ratioPercent = Math.min(Math.round(summary.debtToAssetRatio * 1000) / 10, 100);
  const ratioProgress = Math.min(summary.debtToAssetRatio * 100, 100);

  const badgeTone =
    debtHealth.status === 'healthy'
      ? 'success'
      : debtHealth.status === 'moderate'
        ? 'warning'
        : 'error';

  return (
    <GlassSurface
      borderRadius={24}
      padding={20}
      washColor={isPositive ? '$green10' : '$red10'}
      testID="net-worth-hero-card">
      <VStack gap="$4">
        {/* Top Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="wallet" size={18} color={isPositive ? '#4ECDC4' : '#FF6B6B'} />
            <Text variant="caption" color="$textSecondary" weight="bold" letterSpacing={1.2}>
              TOTAL NET WORTH
            </Text>
          </HStack>
          <Badge label={debtHealth.label} tone={badgeTone} />
        </HStack>

        {/* Large Net Worth Display */}
        <VStack gap="$1">
          <Text
            variant="h1"
            color="$text"
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {formatCurrency(summary.netWorth)}
          </Text>
          <Text variant="caption" color="$textSecondary">
            {isPositive
              ? 'Assets exceed liabilities. Wealth is compounding.'
              : 'Liabilities exceed assets. Prioritize debt consolidation.'}
          </Text>
        </VStack>

        {/* Assets & Liabilities Dual Pods */}
        <HStack gap="$3" width="100%">
          {/* Assets Pod */}
          <GlassSurface fill borderRadius={16} padding={14} washColor="$green10" style={{flex: 1}}>
            <VStack gap="$1.5">
              <HStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" color="$textSecondary" weight="semibold">
                  Assets
                </Text>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
              </HStack>
              <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                {formatCurrency(summary.totalAssets)}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {assetCount} {assetCount === 1 ? 'account' : 'accounts'}
              </Text>
            </VStack>
          </GlassSurface>

          {/* Liabilities Pod */}
          <GlassSurface fill borderRadius={16} padding={14} washColor="$red10" style={{flex: 1}}>
            <VStack gap="$1.5">
              <HStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" color="$textSecondary" weight="semibold">
                  Liabilities
                </Text>
                <Ionicons name="trending-down" size={16} color="#FF6B6B" />
              </HStack>
              <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                {formatCurrency(summary.totalLiabilities)}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {liabilityCount} {liabilityCount === 1 ? 'record' : 'records'}
              </Text>
            </VStack>
          </GlassSurface>
        </HStack>

        {/* Debt-to-Asset Ratio Bar */}
        <VStack gap="$2" paddingTop="$1">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" gap="$1.5">
              <Ionicons name="speedometer-outline" size={14} color={debtHealth.color} />
              <Text variant="caption" color="$textSecondary" weight="medium">
                Debt-to-Asset Ratio
              </Text>
            </HStack>
            <Text variant="caption" color="$text" weight="bold">
              {ratioPercent.toFixed(1)}%
            </Text>
          </HStack>

          <View
            height={6}
            backgroundColor="rgba(128, 128, 128, 0.2)"
            borderRadius={3}
            overflow="hidden">
            <View
              width={`${ratioProgress}%`}
              height="100%"
              backgroundColor={debtHealth.color}
              borderRadius={3}
            />
          </View>

          <Text variant="caption" color="$textSecondary" fontSize={11}>
            {debtHealth.description}
          </Text>
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
