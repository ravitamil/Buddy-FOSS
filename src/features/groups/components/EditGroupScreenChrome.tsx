import {FloatingAction, GlassSurface, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import {View} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {EmojiKeyboardSheet} from '@/components/ui/EmojiKeyboardSheet';
import {AddGroupDescriptionSection} from './addGroupScreen/AddGroupDescriptionSection';
import {AddGroupInformationSection} from './addGroupScreen/AddGroupInformationSection';
import {AddGroupMembersSection} from './addGroupScreen/AddGroupMembersSection';
import {GroupDeletingOverlay} from './GroupDeletingOverlay';
import type {UseEditGroupScreenResult} from '../hooks/useEditGroupScreen';

interface EditGroupMissingStateProps {
  onBack: () => void;
}

export const EditGroupMissingState: React.FC<EditGroupMissingStateProps> = ({onBack}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
    <VStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text variant="h3" color="$text" weight="bold" marginBottom="$2">
        Group Not Found
      </Text>
      <Text variant="body1" color="$textSecondary" textAlign="center" marginBottom="$4">
        The group you&apos;re trying to edit could not be found.
      </Text>
      <View accessibilityRole="button" onPress={onBack} pressStyle={{opacity: 0.8}}>
        <Text variant="body1" color="$blue9" weight="semibold">
          Go Back
        </Text>
      </View>
    </VStack>
  </ScreenContainer>
);

interface EditGroupContentProps {
  screen: UseEditGroupScreenResult;
  fabBottomPadding: number;
}

export const EditGroupContent: React.FC<EditGroupContentProps> = ({screen, fabBottomPadding}) => (
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
      <GlassSurface padding={16} testID="edit-group-identity-card">
        <VStack gap="$3.5">
          <AddGroupInformationSection
            groupEmoji={screen.groupEmoji}
            groupName={screen.groupName}
            onApplyTemplate={screen.applyTemplate}
            onChangeName={screen.setGroupName}
            onOpenEmojiPicker={screen.openEmojiPicker}
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

interface EditGroupScreenFrameProps {
  screen: UseEditGroupScreenResult;
  fabBottomPadding: number;
  loadingSource: ImageSourcePropType;
}

export const EditGroupScreenFrame: React.FC<EditGroupScreenFrameProps> = ({
  screen,
  fabBottomPadding,
  loadingSource,
}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
    <CustomNavigationHeader
      title="Edit Group"
      subtitle={screen.groupName || 'Update group details'}
      mode="collapsing"
      {...screen.headerProps}
      onBackPress={screen.navigateBack}
      rightElement={
        <View
          accessibilityRole="button"
          accessibilityLabel="Delete group"
          onPress={screen.handleDeleteGroup}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          pressStyle={{opacity: 0.75, scale: 0.94}}
          width={40}
          height={40}
          borderRadius={20}
          alignItems="center"
          justifyContent="center"
          backgroundColor={
            screen.isDarkMode ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.08)'
          }
          borderWidth={1}
          borderColor={screen.isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}
          shadowColor="rgba(239, 68, 68, 0.3)"
          shadowOffset={{width: 0, height: 2}}
          shadowOpacity={0.2}
          shadowRadius={4}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </View>
      }
    />

    <EditGroupContent screen={screen} fabBottomPadding={fabBottomPadding} />

    <FloatingAction
      presentation="save"
      onPress={screen.handleUpdateGroup}
      disabled={screen.isSaveDisabled}
      loading={screen.isDeleting}
      label="Save Changes"
      icon="checkmark"
      isScrollingDown={screen.isScrollingDown}
    />

    <EmojiKeyboardSheet
      isOpen={screen.showEmojiPicker}
      onClose={screen.closeEmojiPicker}
      onEmojiSelect={screen.selectEmoji}
    />

    <GroupDeletingOverlay
      isVisible={screen.isDeleting}
      isDarkMode={screen.isDarkMode}
      loadingSource={loadingSource}
    />
  </ScreenContainer>
);

export const EditGroupOverlays: React.FC<{
  screen: UseEditGroupScreenResult;
  loadingSource: ImageSourcePropType;
}> = ({screen, loadingSource}) => (
  <>
    <EmojiKeyboardSheet
      isOpen={screen.showEmojiPicker}
      onClose={screen.closeEmojiPicker}
      onEmojiSelect={screen.selectEmoji}
    />
    <GroupDeletingOverlay
      isVisible={screen.isDeleting}
      isDarkMode={screen.isDarkMode}
      loadingSource={loadingSource}
    />
  </>
);
