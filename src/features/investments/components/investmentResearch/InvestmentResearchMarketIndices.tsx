import {LoadingIndicator} from '@ravitamil/buddy-ui';
import {HStack, MetricCard, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {InvestmentResearchState} from './types';

export const InvestmentResearchMarketIndices = ({
  research,
}: {
  research: InvestmentResearchState;
}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3" marginBottom="$4">
      <Text variant="h5" color="$text" weight="bold">
        Market Indices
      </Text>
      {research.loading && research.marketIndices.length === 0 ? (
        <HStack justifyContent="center" padding="$4">
          <LoadingIndicator size="large" label="Loading market indices" />
        </HStack>
      ) : (
        <HStack gap="$2">
          {research.marketIndices.map((index) => (
            <MetricCard
              key={`${index.market}-${index.symbol}`}
              title={index.name}
              value={index.value.toFixed(2)}
              icon={index.change >= 0 ? 'trending-up' : 'trending-down'}
              trend={`${index.change >= 0 ? '+' : ''}${index.change.toFixed(2)} (${index.changePercent >= 0 ? '+' : ''}${index.changePercent.toFixed(2)}%)`}
              trendColor={index.change >= 0 ? '#4CAF50' : '#FF5722'}
              tone={index.change >= 0 ? 'positive' : 'negative'}
              onPress={() => {}}
            />
          ))}
        </HStack>
      )}
    </VStack>
  );
};
