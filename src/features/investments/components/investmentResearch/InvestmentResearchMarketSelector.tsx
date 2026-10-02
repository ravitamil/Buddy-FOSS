import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {globalMarkets} from '../../hooks/useInvestmentResearch';
import {LiveBadge} from './LiveBadge';
import {ResearchChip} from './ResearchChip';
import type {InvestmentResearchState} from './types';

export const InvestmentResearchMarketSelector = ({
  research,
}: {
  research: InvestmentResearchState;
}) => (
  <VStack gap="$3" marginBottom="$4">
    <HStack justifyContent="space-between" alignItems="center">
      <Text variant="h5" color="$text" weight="bold">
        Select Market
      </Text>
      {research.apiKeysConfigured && <LiveBadge />}
    </HStack>
    <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack gap="$2">
        {globalMarkets.map((market) => (
          <ResearchChip
            key={market.id}
            active={research.selectedMarket.id === market.id}
            activeColors={['#4ECDC4', '#44A08D']}
            onPress={() => research.setSelectedMarket(market)}>
            <HStack alignItems="center" gap="$2">
              <Text fontSize={16}>{market.flag}</Text>
              <Text
                color={research.selectedMarket.id === market.id ? 'white' : '$text'}
                fontSize="$1"
                fontWeight="600">
                {market.name}
              </Text>
            </HStack>
          </ResearchChip>
        ))}
      </HStack>
    </Animated.ScrollView>
  </VStack>
);
