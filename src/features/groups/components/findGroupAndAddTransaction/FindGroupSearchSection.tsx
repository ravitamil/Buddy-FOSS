import {HStack, Input, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {UseFindGroupAndAddTransactionScreenResult} from '../../hooks/useFindGroupAndAddTransactionScreen';
import {FindGroupGlassCard} from './FindGroupGlassCard';

interface FindGroupScreenProps {
  screen: UseFindGroupAndAddTransactionScreenResult;
}

const groupEmojiFallback = String.fromCodePoint(0x1f465);

export const FindGroupSearchSection = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$2">
    <Text variant="body1" color="$text" weight="semibold">
      Search Group *
    </Text>
    <FindGroupGlassCard padding={12}>
      <HStack alignItems="center" gap="$2">
        <Ionicons
          name="search"
          size={20}
          color={screen.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
        />
        <Input
          accessibilityLabel="Search groups"
          chrome={false}
          flex={1}
          fontSize={16}
          color="$text"
          padding="$2"
          fontWeight="500"
          placeholder="Type group name to search..."
          placeholderTextColor="$colorTransparent"
          value={screen.searchQuery}
          onChangeText={screen.setSearchQuery}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="off"
        />
      </HStack>
    </FindGroupGlassCard>

    {screen.searchQuery.trim() ? <SearchResults screen={screen} /> : null}
    {screen.selectedGroup ? <SelectedGroupCard screen={screen} /> : null}
  </VStack>
);

const SearchResults = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$1">
    {screen.filteredGroups.length > 0 ? (
      screen.filteredGroups.map((group) => (
        <VStack
          key={group.id}
          accessibilityRole="button"
          accessibilityLabel={`Select ${group.name}`}
          onPress={() => screen.handleSelectGroup(group)}
          pressStyle={{opacity: 0.7}}>
          <FindGroupGlassCard padding={12}>
            <HStack alignItems="center" gap="$3">
              <GroupEmoji emoji={group.emoji} isDarkMode={screen.isDarkMode} />
              <VStack flex={1}>
                <Text variant="body1" color="$text" weight="semibold">
                  {group.name}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  {group.members.length} members
                </Text>
              </VStack>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={screen.isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
              />
            </HStack>
          </FindGroupGlassCard>
        </VStack>
      ))
    ) : (
      <FindGroupGlassCard padding={16}>
        <VStack alignItems="center" gap="$2">
          <Ionicons
            name="search-outline"
            size={32}
            color={screen.isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          />
          <Text variant="body2" color="$textSecondary" textAlign="center">
            No groups found matching "{screen.searchQuery}"
          </Text>
        </VStack>
      </FindGroupGlassCard>
    )}
  </VStack>
);

const GroupEmoji = ({emoji, isDarkMode}: {emoji?: string; isDarkMode: boolean}) => (
  <HStack
    width={40}
    height={40}
    borderRadius="$3"
    backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
    justifyContent="center"
    alignItems="center">
    <Text fontSize={20}>{emoji || groupEmojiFallback}</Text>
  </HStack>
);

const SelectedGroupCard = ({screen}: FindGroupScreenProps) => {
  const group = screen.selectedGroup;
  if (!group) return null;

  return (
    <FindGroupGlassCard padding={12}>
      <HStack alignItems="center" gap="$3">
        <HStack
          width={40}
          height={40}
          borderRadius="$3"
          backgroundColor={screen.isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'}
          justifyContent="center"
          alignItems="center"
          borderWidth={1}
          borderColor={screen.isDarkMode ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.3)'}>
          <Text fontSize={20}>{group.emoji || groupEmojiFallback}</Text>
        </HStack>
        <VStack flex={1}>
          <Text variant="body1" color="$text" weight="semibold">
            {group.name}
          </Text>
          <Text variant="caption" color="$textSecondary">
            Selected - {group.members.length} members
          </Text>
        </VStack>
        <HStack
          accessibilityRole="button"
          accessibilityLabel="Clear selected group"
          onPress={() => screen.setSelectedGroup(null)}
          pressStyle={{opacity: 0.7}}
          padding="$1">
          <Ionicons
            name="close"
            size={20}
            color={screen.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
          />
        </HStack>
      </HStack>
    </FindGroupGlassCard>
  );
};
