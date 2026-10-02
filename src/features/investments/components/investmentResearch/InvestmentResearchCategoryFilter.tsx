import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {ResearchChip} from './ResearchChip';
import type {InvestmentResearchState} from './types';

export const InvestmentResearchCategoryFilter = ({
  research,
}: {
  research: InvestmentResearchState;
}) => {
  if (research.investmentCategories.length === 0) {
    return null;
  }

  return (
    <VStack gap="$3" marginBottom="$4">
      <Text variant="h5" color="$text" weight="bold">
        Categories
      </Text>
      <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack gap="$2">
          <ResearchChip
            active={research.selectedCategory === null}
            activeColors={['#4ECDC4', '#44A08D']}
            onPress={() => research.setSelectedCategory(null)}>
            <Text
              color={research.selectedCategory === null ? 'white' : '$text'}
              fontSize="$1"
              fontWeight="600">
              All
            </Text>
          </ResearchChip>
          {research.investmentCategories.map((category) => (
            <ResearchChip
              key={category.id}
              active={research.selectedCategory?.id === category.id}
              activeColors={[category.color, `${category.color}CC`]}
              onPress={() =>
                research.setSelectedCategory(
                  research.selectedCategory?.id === category.id ? null : category,
                )
              }>
              <Text
                color={research.selectedCategory?.id === category.id ? 'white' : '$text'}
                fontSize="$1"
                fontWeight="600">
                {category.name}
              </Text>
            </ResearchChip>
          ))}
        </HStack>
      </Animated.ScrollView>
    </VStack>
  );
};
