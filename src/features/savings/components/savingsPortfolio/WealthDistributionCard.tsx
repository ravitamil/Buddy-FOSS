import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {useSettings} from '@/context/SettingsContext';
import {PortfolioGlassCard} from './PortfolioGlassCard';

export const WealthDistributionCard = ({
  totalSavingsGoals,
  totalInvestments,
  totalWealth,
  savingsToInvestmentRatio,
  investmentToSavingsRatio,
}: {
  totalSavingsGoals: number;
  totalInvestments: number;
  totalWealth: number;
  savingsToInvestmentRatio: number;
  investmentToSavingsRatio: number;
}) => {
  const {formatCurrency} = useSettings();

  return (
    <PortfolioGlassCard marginTop={16}>
      <VStack gap="$3">
        <Text variant="h5" color="$text" weight="bold">
          Wealth Distribution
        </Text>
        <HStack justifyContent="space-between">
          <VStack flex={1}>
            <Text variant="caption" color="$textSecondary">
              Savings
            </Text>
            <Text variant="h6" color="#2196F3" weight="bold">
              {formatCurrency(totalSavingsGoals)}
            </Text>
            <Text variant="caption" color="#2196F3">
              {savingsToInvestmentRatio.toFixed(1)}%
            </Text>
          </VStack>
          <VStack flex={1} alignItems="center">
            <Text variant="caption" color="$textSecondary">
              Total Wealth
            </Text>
            <Text variant="h5" color="$text" weight="bold">
              {formatCurrency(totalWealth)}
            </Text>
          </VStack>
          <VStack flex={1} alignItems="flex-end">
            <Text variant="caption" color="$textSecondary">
              Investments
            </Text>
            <Text variant="h6" color="#4CAF50" weight="bold">
              {formatCurrency(totalInvestments)}
            </Text>
            <Text variant="caption" color="#4CAF50">
              {investmentToSavingsRatio.toFixed(1)}%
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </PortfolioGlassCard>
  );
};
