import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {StockData} from '../../hooks/useInvestmentResearch';

interface InvestmentResearchCardProps {
  investment: StockData;
  formatCurrency: (amount: number) => string;
  onAddToPortfolio: (investment: StockData) => void;
}

export const InvestmentResearchCard = ({
  investment,
  formatCurrency,
  onAddToPortfolio,
}: InvestmentResearchCardProps) => {
  return (
    <GlassSurface padding="$4" style={{marginBottom: 12}}>
      <VStack gap="$3">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <HStack alignItems="center" gap="$2">
              <Text variant="h4" color="$text" weight="bold">
                {investment.symbol}
              </Text>
              <Text variant="body2" color="$textSecondary">
                {investment.name}
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              {investment.sector} {investment.industry}
            </Text>
          </VStack>
          <HStack
            accessibilityRole="button"
            accessibilityLabel={`Add ${investment.symbol} to portfolio`}
            onPress={() => onAddToPortfolio(investment)}
            pressStyle={{opacity: 0.7}}
            padding="$1">
            <Ionicons name="add-circle" size={24} color="#4ECDC4" />
          </HStack>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text variant="h3" color="$text" weight="bold">
              ${investment.currentPrice.toFixed(2)}
            </Text>
            <Text
              variant="body2"
              color={investment.change >= 0 ? '#4CAF50' : '#FF5722'}
              weight="semibold">
              {investment.change >= 0 ? '+' : ''}
              {investment.change.toFixed(2)} ({investment.changePercent >= 0 ? '+' : ''}
              {investment.changePercent.toFixed(2)}%)
            </Text>
          </VStack>

          <VStack alignItems="flex-end">
            <Text variant="body2" color="$text">
              Mkt Cap: {formatCurrency(investment.marketCap)}
            </Text>
            <Text variant="body2" color="$text">
              P/E: {investment.peRatio}
            </Text>
          </VStack>
        </HStack>

        <Text variant="body2" color="$textSecondary" numberOfLines={2}>
          {investment.description}
        </Text>

        <HStack justifyContent="space-between">
          <Fact label="Volume" value={investment.volume.toLocaleString()} />
          <Fact
            label="Dividend"
            value={investment.dividendYield ? `${investment.dividendYield}%` : 'N/A'}
          />
          <Fact label="Founded" value={String(investment.founded)} />
        </HStack>
      </VStack>
    </GlassSurface>
  );
};

const Fact = ({label, value}: {label: string; value: string}) => (
  <VStack>
    <Text variant="caption" color="$textSecondary">
      {label}
    </Text>
    <Text variant="body2" color="$text">
      {value}
    </Text>
  </VStack>
);
