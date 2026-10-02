import React from 'react';
import {FloatingAction} from '@ravitamil/buddy-ui';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {EmojiKeyboardSheet} from '@/components/ui/EmojiKeyboardSheet';
import {AddGroupContent} from './AddGroupContent';
import type {AddGroupContentProps} from './addGroupScreenTypes';

export const AddGroupScreenFrame: React.FC<AddGroupContentProps> = ({screen, fabBottomPadding}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
    <CustomNavigationHeader
      title="Create Group"
      subtitle="Set up a shared space"
      mode="collapsing"
      {...screen.headerProps}
      onBackPress={screen.navigateBack}
    />
    <AddGroupContent screen={screen} fabBottomPadding={fabBottomPadding} />
    <FloatingAction
      presentation="save"
      onPress={screen.handleCreateGroup}
      disabled={screen.isCreateDisabled}
      loading={screen.loading}
      label="Create Group"
      icon="checkmark"
      isScrollingDown={screen.isScrollingDown}
    />
    <EmojiKeyboardSheet
      isOpen={screen.showEmojiPicker}
      onClose={screen.closeEmojiPicker}
      onEmojiSelect={screen.selectEmoji}
    />
  </ScreenContainer>
);
