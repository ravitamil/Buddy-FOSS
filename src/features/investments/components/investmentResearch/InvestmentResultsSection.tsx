import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {StockData} from '../../hooks/useInvestmentResearch';
import {InvestmentResearchCard} from './InvestmentResearchCard';
import {ResearchError, ResearchLoading} from './ResearchStatusStates';
import type {InvestmentResearchState} from './types';

export const InvestmentResultsSection = ({
  research,
  formatCurrency,
  onAddToPortfolio,
}: {
  research: InvestmentResearchState;
  formatCurrency: (amount: number) => string;
  onAddToPortfolio: (investment: StockData) => void;
}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <HStack justifyContent="space-between" alignItems="center">
        <Text variant="h5" color="$text" weight="bold">
          Investments
        </Text>
        <Text variant="body2" color="$textSecondary">
          {research.filteredInvestments.length} results
        </Text>
      </HStack>

      {research.loading ? (
        <ResearchLoading marketName={research.selectedMarket.name} />
      ) : research.error ? (
        <ResearchError
          error={research.error}
          marketName={research.selectedMarket.name}
          onRetry={research.handleRefresh}
        />
      ) : research.filteredInvestments.length > 0 ? (
        research.filteredInvestments.map((investment) => (
          <InvestmentResearchCard
            key={investment.symbol}
            investment={investment}
            formatCurrency={formatCurrency}
            onAddToPortfolio={onAddToPortfolio}
          />
        ))
      ) : (
        <VStack alignItems="center" justifyContent="center" padding="$8" gap="$3">
          <Ionicons
            name="search"
            size={48}
            color={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
          />
          <Text variant="body1" color="$textSecondary" textAlign="center">
            No investments found matching your search
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
