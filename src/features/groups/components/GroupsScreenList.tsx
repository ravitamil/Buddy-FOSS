import {EmptyState, LoadingIndicator, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback} from 'react';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View} from 'tamagui';

import StandardFlashList from '@/components/ui/StandardFlashList';
import type {EnhancedGroup} from '@/features/groups/types';
import type {GroupsScreenCardModel, GroupsScreenOverallStats} from '../hooks/useGroupsScreen';
import {GroupsScreenListHeader} from './GroupsScreenListHeader';
import {GroupCard} from './GroupCard';

const AnimatedGroupsFlashList = Animated.createAnimatedComponent(StandardFlashList<EnhancedGroup>);

interface GroupsScreenListProps {
  groups: EnhancedGroup[];
  groupCount: number;
  loading: boolean;
  isDarkMode: boolean;
  searchQuery: string;
  isSearchOpen?: boolean;
  overallStats: GroupsScreenOverallStats;
  formatCurrency: (amount: number) => string;
  onRefresh: () => void;
  onCreateGroup: () => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onOpenGroup: (groupId: string) => void;
  onAddExpense: (groupId: string) => void;
  onOpenActions?: (group: EnhancedGroup) => void;
  getGroupCardModel: (group: EnhancedGroup) => GroupsScreenCardModel;
  onScroll?: React.ComponentProps<typeof AnimatedGroupsFlashList>['onScroll'];
}

/* eslint-disable development-quality/enforce-tamagui-usage */
const listContentContainerStyle = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 150,
  flexGrow: 1,
  justifyContent: 'flex-start' as const,
};
/* eslint-enable development-quality/enforce-tamagui-usage */

export const GroupsScreenList: React.FC<GroupsScreenListProps> = ({
  groups,
  groupCount,
  loading,
  isDarkMode,
  searchQuery,
  isSearchOpen = false,
  overallStats,
  formatCurrency,
  onRefresh,
  onCreateGroup,
  onSearchChange,
  onClearSearch,
  onOpenGroup,
  onAddExpense,
  getGroupCardModel,
  onScroll,
}) => {
  const insets = useSafeAreaInsets();

  const renderGroupItem = useCallback(
    ({item}: {item: EnhancedGroup}) => (
      <GroupCard
        {...getGroupCardModel(item)}
        onPress={() => onOpenGroup(item.id)}
        onAddExpense={() => onAddExpense(item.id)}
        formatCurrency={formatCurrency}
      />
    ),
    [formatCurrency, getGroupCardModel, onAddExpense, onOpenGroup],
  );

  if (loading && groupCount === 0) {
    return (
      <VStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <LoadingIndicator
          size="large"
          color={isDarkMode ? '$purple5' : '$purple7'}
          accessibilityLabel="Loading groups"
        />
      </VStack>
    );
  }

  if (groupCount === 0) {
    return (
      <VStack
        flex={1}
        style={{
          marginTop: -85,
          paddingBottom: insets.bottom,
        }}>
        <GroupsScreenEmptyState isFilteredEmptyState={false} onCreateGroup={onCreateGroup} />
      </VStack>
    );
  }

  return (
    <AnimatedGroupsFlashList
      data={groups}
      renderItem={renderGroupItem}
      keyExtractor={(item, index) => item.id || `group-${index}`}
      removeClippedSubviews={false}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={16}
      onRefresh={onRefresh}
      refreshing={loading && groupCount > 0}
      ListEmptyComponent={
        <GroupsScreenEmptyState
          isFilteredEmptyState={groupCount > 0 && searchQuery.trim().length > 0}
          onCreateGroup={onCreateGroup}
        />
      }
      contentContainerStyle={listContentContainerStyle}
      ItemSeparatorComponent={() => <View style={{height: 12}} />}
      ListHeaderComponent={
        <GroupsScreenListHeader
          groupCount={groupCount}
          isDarkMode={isDarkMode}
          overallStats={overallStats}
          searchQuery={searchQuery}
          isSearchOpen={isSearchOpen}
          formatCurrency={formatCurrency}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
        />
      }
    />
  );
};

const GroupsScreenEmptyState: React.FC<{
  isFilteredEmptyState: boolean;
  onCreateGroup: () => void;
}> = ({isFilteredEmptyState, onCreateGroup}) => (
  <VStack paddingHorizontal="$4" flex={1} justifyContent="center" alignItems="center">
    <EmptyState
      icon={isFilteredEmptyState ? 'search' : 'people'}
      iconColor="#4ECDC4"
      iconAccessibilityLabel="Create group"
      onIconPress={isFilteredEmptyState ? undefined : onCreateGroup}
      title={isFilteredEmptyState ? 'No Matching Groups' : 'No Groups Yet'}
      description={
        isFilteredEmptyState
          ? 'Try a different search term or clear your search.'
          : 'Create a group to start tracking expenses with friends and family.'
      }
    />
  </VStack>
);
