import {Skeleton} from '@ravitamil/buddy-ui';
import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {GroupCard} from '@/features/groups/components/GroupCard';
import type {HomeScreenModel} from '../types';
import {HomeEmptyStateCard} from './HomeEmptyStateCard';
import {HomeSectionHeader} from './HomeSectionHeader';

interface HomeGroupsSectionProps {
  isLoading: boolean;
  isDarkMode: boolean;
  linkIconColor: string;
  groupCards: HomeScreenModel['groupCards'];
  onViewAll: () => void;
  onAddGroup: () => void;
}

export const HomeGroupsSection = ({
  isLoading,
  isDarkMode,
  linkIconColor,
  groupCards,
  onViewAll,
  onAddGroup,
}: HomeGroupsSectionProps) => (
  <VStack gap="$3" marginTop="$3">
    <HomeSectionHeader
      title="Your Groups"
      linkIconColor={linkIconColor}
      isDarkMode={isDarkMode}
      onViewAll={onViewAll}
    />

    <VStack gap="$2">
      <Skeleton visible={isLoading} height={120} borderRadius={16}>
        {groupCards.length > 0 ? (
          groupCards.map((groupCard, index) => (
            <GroupCard key={`home-group-${groupCard.id || index}`} {...groupCard.props} />
          ))
        ) : (
          <HomeEmptyStateCard
            type="group"
            title="No Groups Yet"
            description="Create groups to split expenses with friends and family"
            onPress={onAddGroup}
          />
        )}
      </Skeleton>
    </VStack>
  </VStack>
);
