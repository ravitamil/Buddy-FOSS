import {GlassSurface, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

import {ScreenWrapper} from '@/components/ui';
import {AddGroupCurrencySection} from './AddGroupCurrencySection';
import {AddGroupDescriptionSection} from './AddGroupDescriptionSection';
import {AddGroupInformationSection} from './AddGroupInformationSection';
import {AddGroupMembersSection} from './AddGroupMembersSection';
import type {AddGroupContentProps} from './addGroupScreenTypes';

export const AddGroupContent: React.FC<AddGroupContentProps> = ({screen, fabBottomPadding}) => (
  <ScreenWrapper
    edges={[]}
    backgroundColor="transparent"
    padding={false}
    keyboardMode="aware-scroll"
    nestedScrollEnabled
    bounces
    keyboardBottomOffset={60}
    contentContainerStyle={{paddingTop: 118, paddingBottom: fabBottomPadding, flexGrow: 1}}
    scrollViewStyle={{flex: 1}}
    scrollEventThrottle={16}
    onScroll={screen.onScroll}>
    <VStack paddingHorizontal="$3" gap="$4">
      {/* Card 1: Identity, Presets & Group Settings */}
      <GlassSurface padding={16} testID="group-identity-card">
        <VStack gap="$3.5">
          <AddGroupInformationSection
            groupEmoji={screen.groupEmoji}
            groupName={screen.groupName}
            onApplyTemplate={screen.applyTemplate}
            onChangeName={screen.setGroupName}
            onOpenEmojiPicker={screen.openEmojiPicker}
          />

          <View height={1} backgroundColor="$borderColor" />

          <AddGroupCurrencySection
            selectedCurrency={screen.selectedCurrency}
            onPressCurrency={screen.navigateToCurrencyPicker}
          />

          <View height={1} backgroundColor="$borderColor" />

          <AddGroupDescriptionSection
            groupDescription={screen.groupDescription}
            isExpanded={screen.isDescriptionExpanded}
            onChangeDescription={screen.setGroupDescription}
            onToggle={screen.toggleDescriptionExpand}
          />
        </VStack>
      </GlassSurface>

      {/* Card 2: Members & Invitations */}
      <AddGroupMembersSection
        members={screen.members}
        searchQuery={screen.searchQuery}
        isSearching={screen.isSearching}
        searchResults={screen.searchResults}
        onAddFoundUser={screen.handleAddFoundUser}
        onChangeSearchQuery={screen.setSearchQuery}
        onClearSearchResults={screen.clearSearchResults}
        onImportContact={screen.handleImportContact}
        onRemoveMember={screen.removeMember}
      />
    </VStack>
  </ScreenWrapper>
);
