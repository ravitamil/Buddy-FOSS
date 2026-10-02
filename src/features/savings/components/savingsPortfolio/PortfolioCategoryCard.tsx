import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, XStack, YStack} from 'tamagui';

import {useSettings} from '@/context/SettingsContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {Investment, InvestmentCategory} from '@/types';
import {PortfolioGlassCard} from './PortfolioGlassCard';

export const PortfolioCategoryCard = ({
  category,
  investments,
  totalValue,
  onPress,
}: {
  category: InvestmentCategory;
  investments: Investment[];
  totalValue: number;
  onPress: () => void;
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {formatCurrency} = useSettings();
  const categoryValue = investments.reduce(
    (sum, investment) => sum + (investment.currentPrice || 0) * (investment.quantity || 0),
    0,
  );
  const categoryInvested = investments.reduce(
    (sum, investment) => sum + (investment.purchasePrice || 0) * (investment.quantity || 0),
    0,
  );
  const categoryReturns = categoryValue - categoryInvested;
  const categoryReturnPercentage =
    categoryInvested > 0 ? (categoryReturns / categoryInvested) * 100 : 0;
  const portfolioPercentage = totalValue > 0 ? (categoryValue / totalValue) * 100 : 0;

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={`Open ${category.name} investments`}
      onPress={onPress}
      pressStyle={{opacity: 0.8}}>
      <PortfolioGlassCard marginBottom={12}>
        <XStack alignItems="center" gap="$4">
          <YStack
            width={50}
            height={50}
            borderRadius={25}
            backgroundColor={category.color}
            alignItems="center"
            justifyContent="center"
            shadowColor={category.color}
            shadowOffset={{width: 0, height: 4}}
            shadowOpacity={0.3}
            shadowRadius={8}>
            <CategoryIcon icon={category.icon} />
          </YStack>
          <YStack flex={1} gap="$1">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="body1" color="$text" weight="semibold">
                {category.name}
              </Text>
              <Text
                variant="body2"
                color={categoryReturnPercentage >= 0 ? '#4CAF50' : '#FF5722'}
                weight="bold">
                {categoryReturnPercentage >= 0 ? '+' : ''}
                {categoryReturnPercentage.toFixed(1)}%
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="h5" color="$text" weight="bold">
                {formatCurrency(categoryValue)}
              </Text>
              <Text variant="body2" color="$textSecondary">
                {portfolioPercentage.toFixed(1)}% of portfolio
              </Text>
            </XStack>
            <Text variant="caption" color="$textSecondary" numberOfLines={1}>
              {investments.length} investment{investments.length !== 1 ? 's' : ''} -{' '}
              {category.riskLevel} risk
            </Text>
          </YStack>
          <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </XStack>
      </PortfolioGlassCard>
    </View>
  );
};

function CategoryIcon({icon}: {icon: string}) {
  const iconProps = {size: 24, color: 'white' as const};

  switch (icon) {
    case 'trending-up':
      return <Ionicons name="trending-up" {...iconProps} />;
    case 'pie-chart':
      return <Ionicons name="pie-chart" {...iconProps} />;
    case 'lock-closed':
      return <Ionicons name="lock-closed" {...iconProps} />;
    case 'star':
      return <Ionicons name="star" {...iconProps} />;
    case 'receipt':
      return <Ionicons name="receipt" {...iconProps} />;
    case 'wallet':
      return <Ionicons name="wallet" {...iconProps} />;
    default:
      return <Ionicons name="briefcase" {...iconProps} />;
  }
}
