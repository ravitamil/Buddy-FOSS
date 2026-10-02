import {Avatar, GlassSurface, HStack, SearchField, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {View, styled} from 'tamagui';

import type {ProfileSearchResult} from '@/features/groups/types';
import type {AddGroupMemberEntry} from '../../hooks/useAddGroupScreen';

interface AddGroupMembersSectionProps {
  members: AddGroupMemberEntry[];
  searchQuery: string;
  isSearching: boolean;
  searchResults: ProfileSearchResult[];
  onAddFoundUser: (user: ProfileSearchResult) => void;
  onChangeSearchQuery: (value: string) => void;
  onClearSearchResults: () => void;
  onImportContact: () => void;
  onRemoveMember: (index: number) => void;
}

export const AddGroupMembersSection: React.FC<AddGroupMembersSectionProps> = ({
  members,
  searchQuery,
  isSearching,
  searchResults,
  onAddFoundUser,
  onChangeSearchQuery,
  onClearSearchResults,
  onImportContact,
  onRemoveMember,
}) => (
  <GlassSurface padding={16} testID="group-members-card">
    <VStack gap="$3">
      <HStack alignItems="center" justifyContent="space-between" gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" color="$text" weight="semibold">
            Members
          </Text>
          <HStack
            backgroundColor="$surfacePress"
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderRadius="$10">
            <Text variant="caption" color="$textSecondary" weight="semibold">
              {members.length}
            </Text>
          </HStack>
        </HStack>

        <HStack
          accessibilityRole="button"
          accessibilityLabel="Import member from contacts"
          onPress={onImportContact}
          pressStyle={{scale: 0.96, backgroundColor: '$surfaceHover'}}
          alignItems="center"
          gap="$1.5"
          backgroundColor="$surfacePress"
          borderWidth={1}
          borderColor="$borderColor"
          paddingHorizontal="$3"
          paddingVertical="$1.5"
          borderRadius="$10"
          minHeight={36}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          testID="import-contacts-button">
          <ThemedIonicon name="person-add-outline" size={15} color="$iconBrand" />
          <Text variant="caption" color="$text" weight="semibold">
            Contacts
          </Text>
        </HStack>
      </HStack>

      <SearchField
        value={searchQuery}
        onChangeText={onChangeSearchQuery}
        placeholder="Enter email, phone, or profile ID"
        loading={isSearching}
        onClear={onClearSearchResults}
        testID="group-member-search"
      />

      {searchQuery.length > 0 ? (
        <MemberSearchResults
          isSearching={isSearching}
          searchResults={searchResults}
          onAddFoundUser={onAddFoundUser}
          onImportContact={onImportContact}
        />
      ) : null}

      <View height={1} backgroundColor="$borderColor" />

      <VStack gap="$1">
        {members.map((member, index) => (
          <MemberRow
            key={`member-${member.id || member.supabaseUserId || index}`}
            index={index}
            member={member}
            onRemoveMember={onRemoveMember}
          />
        ))}
      </VStack>
    </VStack>
  </GlassSurface>
);

const MemberSearchResults = ({
  isSearching,
  searchResults,
  onAddFoundUser,
  onImportContact,
}: {
  isSearching: boolean;
  searchResults: ProfileSearchResult[];
  onAddFoundUser: (user: ProfileSearchResult) => void;
  onImportContact: () => void;
}) => {
  if (!isSearching && searchResults.length === 0) {
    return (
      <VStack
        minHeight={64}
        paddingHorizontal="$3"
        paddingVertical="$2.5"
        gap="$2"
        backgroundColor="$surfacePress"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor">
        <VStack gap="$0.5">
          <Text variant="body2" color="$text" weight="semibold">
            No matching profile
          </Text>
          <Text variant="caption" color="$textSecondary">
            Try another search or import directly from your phone.
          </Text>
        </VStack>
        <HStack
          accessibilityRole="button"
          accessibilityLabel="Add member from contacts"
          onPress={onImportContact}
          pressStyle={{scale: 0.98, opacity: 0.85}}
          alignItems="center"
          alignSelf="flex-start"
          gap="$1.5"
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
          borderRadius="$10"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
          minHeight={36}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
          <ThemedIonicon name="person-add-outline" size={14} color="$iconBrand" />
          <Text variant="caption" color="$iconBrand" weight="semibold">
            Add from contacts
          </Text>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack gap="$1">
      {searchResults.map((result, index) => (
        <HStack
          key={`search-result-${result.userId || index}`}
          accessibilityRole="button"
          accessibilityLabel={`Add ${result.displayName}`}
          onPress={() => onAddFoundUser(result)}
          pressStyle={{backgroundColor: '$surfacePress', scale: 0.99}}
          minHeight={52}
          paddingHorizontal="$2"
          paddingVertical="$1.5"
          borderRadius="$4"
          alignItems="center"
          gap="$3">
          <Avatar name={result.displayName} uri={result.avatarUrl} size={40} />
          <VStack flex={1} gap="$0.5">
            <Text variant="body2" color="$text" weight="semibold">
              {result.displayName}
            </Text>
            <Text variant="caption" color="$textSecondary" numberOfLines={1}>
              {result.email || result.phone || result.cinId}
            </Text>
          </VStack>
          <ThemedIonicon name="add-circle" size={24} color="$iconBrand" />
        </HStack>
      ))}
    </VStack>
  );
};

const MemberRow = ({
  index,
  member,
  onRemoveMember,
}: {
  index: number;
  member: AddGroupMemberEntry;
  onRemoveMember: (index: number) => void;
}) => {
  const isOwner = member.role === 'owner';
  const displayName = member.name || member.inviteEmail || 'Guest';

  return (
    <HStack
      minHeight={54}
      paddingHorizontal="$1"
      paddingVertical="$1.5"
      alignItems="center"
      gap="$3">
      <Avatar name={displayName} uri={member.avatarUrl} size={40} />
      <VStack flex={1} gap="$0.5">
        <Text color="$text" weight="semibold" numberOfLines={1}>
          {displayName}
        </Text>
        <Text variant="caption" color="$textSecondary" numberOfLines={1}>
          {isOwner ? 'Group owner' : member.inviteEmail || 'Ready to invite'}
        </Text>
      </VStack>
      {isOwner ? (
        <HStack
          backgroundColor="$surfacePress"
          paddingHorizontal="$2.5"
          paddingVertical="$1"
          borderRadius="$10"
          borderWidth={1}
          borderColor="$borderColor">
          <Text variant="caption" color="$iconBrand" weight="semibold">
            Owner
          </Text>
        </HStack>
      ) : (
        <View
          accessibilityRole="button"
          accessibilityLabel={`Remove ${displayName}`}
          onPress={() => onRemoveMember(index)}
          pressStyle={{backgroundColor: '$surfacePress', scale: 0.96}}
          width={40}
          height={40}
          borderRadius="$10"
          alignItems="center"
          justifyContent="center">
          <ThemedIonicon name="close" size={18} color="$textSecondary" />
        </View>
      )}
    </HStack>
  );
};

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
