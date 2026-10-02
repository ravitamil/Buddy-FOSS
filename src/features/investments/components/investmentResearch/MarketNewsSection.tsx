import {LoadingIndicator} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {MarketNews} from '../../hooks/useInvestmentResearch';
import type {InvestmentResearchState} from './types';

export const MarketNewsSection = ({research}: {research: InvestmentResearchState}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <Text variant="h5" color="$text" weight="bold">
        Market News
      </Text>
      {research.loading && research.news.length === 0 ? (
        <HStack justifyContent="center" padding="$4">
          <LoadingIndicator size="small" label="Loading news" />
        </HStack>
      ) : research.news.length > 0 ? (
        research.news.map((newsItem) => <MarketNewsCard key={newsItem.id} newsItem={newsItem} />)
      ) : (
        <VStack alignItems="center" justifyContent="center" padding="$4" gap="$2">
          <Ionicons
            name="newspaper-outline"
            size={32}
            color={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
          />
          <Text variant="body2" color="$textSecondary" textAlign="center">
            No news available for this market
          </Text>
        </VStack>
      )}
    </VStack>
  );
};

const MarketNewsCard = ({newsItem}: {newsItem: MarketNews}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack>
      <GlassSurface padding="$4" style={{marginBottom: 12}}>
        <VStack gap="$2">
          <Text variant="body1" color="$text" weight="semibold">
            {newsItem.title}
          </Text>
          <HStack justifyContent="space-between">
            <Text variant="caption" color="#4ECDC4">
              {newsItem.source}
            </Text>
            <Text variant="caption" color="$textSecondary">
              {newsItem.time}
            </Text>
          </HStack>
          <Text variant="body2" color="$textSecondary" numberOfLines={2}>
            {newsItem.excerpt}
          </Text>
          <HStack justifyContent="space-between" alignItems="center" marginTop="$2">
            <Text variant="caption" color="$textSecondary">
              {newsItem.category}
            </Text>
            <Ionicons
              name="open-outline"
              size={16}
              color={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            />
          </HStack>
        </VStack>
      </GlassSurface>
    </VStack>
  );
};
