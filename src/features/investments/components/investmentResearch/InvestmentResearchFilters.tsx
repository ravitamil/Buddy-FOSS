import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import Animated from 'react-native-reanimated';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {ResearchChip} from './ResearchChip';
import type {InvestmentResearchState} from './types';

export const InvestmentResearchFilters = ({research}: {research: InvestmentResearchState}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3" marginBottom="$4">
      <Text variant="h5" color="$text" weight="bold">
        Advanced Filters
      </Text>

      <HStack gap="$3" flexWrap="wrap">
        <FilterRail
          title="Sector"
          values={research.availableSectors}
          selectedValue={research.selectedSector}
          activeColors={['#FF9800', '#FFB74D']}
          onSelect={research.setSelectedSector}
        />
        <FilterRail
          title="Industry"
          values={research.availableIndustries.slice(0, 10)}
          selectedValue={research.selectedIndustry}
          activeColors={['#2196F3', '#42A5F5']}
          onSelect={research.setSelectedIndustry}
        />
      </HStack>

      <HStack gap="$3" alignItems="center">
        <Text variant="body2" color="$textSecondary">
          Sort by:
        </Text>
        <ResearchChip
          active={false}
          activeColors={['#4ECDC4', '#44A08D']}
          onPress={research.cycleSortBy}>
          <HStack alignItems="center" gap="$2">
            <Text color="$text" fontSize="$1" fontWeight="600">
              {research.sortBy.charAt(0).toUpperCase() + research.sortBy.slice(1)}
            </Text>
            <HStack
              accessibilityRole="button"
              accessibilityLabel="Toggle sort order"
              onPress={research.toggleSortOrder}
              pressStyle={{opacity: 0.7}}
              padding="$1">
              <Ionicons
                name={research.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={isDarkMode ? '#fff' : '#000'}
              />
            </HStack>
          </HStack>
        </ResearchChip>
      </HStack>
    </VStack>
  );
};

const FilterRail = ({
  title,
  values,
  selectedValue,
  activeColors,
  onSelect,
}: {
  title: string;
  values: string[];
  selectedValue: string | null;
  activeColors: readonly [string, string];
  onSelect: (value: string | null) => void;
}) => (
  <VStack flex={1} minWidth={150}>
    <Text variant="body2" color="$textSecondary" marginBottom="$1">
      {title}
    </Text>
    <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack gap="$2">
        <ResearchChip
          active={selectedValue === null}
          activeColors={['#4ECDC4', '#44A08D']}
          onPress={() => onSelect(null)}>
          <Text color={selectedValue === null ? 'white' : '$text'} fontSize="$1" fontWeight="600">
            All
          </Text>
        </ResearchChip>
        {values.map((value) => (
          <ResearchChip
            key={value}
            active={selectedValue === value}
            activeColors={activeColors}
            onPress={() => onSelect(selectedValue === value ? null : value)}>
            <Text
              color={selectedValue === value ? 'white' : '$text'}
              fontSize="$1"
              fontWeight="600">
              {value}
            </Text>
          </ResearchChip>
        ))}
      </HStack>
    </Animated.ScrollView>
  </VStack>
);
