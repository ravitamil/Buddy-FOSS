import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';
import {router, Stack} from 'expo-router';

import {
  CustomNavigationHeader,
  EmojiKeyboardSheet,
  ScreenContainer,
  ScreenWrapper,
} from '../components/ui';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';
import {CategoryFormSections} from '@/features/categories/components/CategoryFormSections';
import {useAddCategoryScreen} from '@/features/categories/hooks/useAddCategoryScreen';

export default function AddCategoryScreen() {
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const screen = useAddCategoryScreen();

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <CustomNavigationHeader
          title="Create Category"
          subtitle="Set a name, type, and color"
          showBackButton={true}
          onBackPress={() => router.back()}
          mode="collapsing"
          {...headerProps}
        />

        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="avoid"
          scrollable={false}>
          <CategoryFormSections
            categoryName={screen.categoryName}
            onChangeName={screen.setCategoryName}
            onChangeEmoji={screen.setSelectedEmoji}
            onOpenEmojiPicker={screen.openEmojiPicker}
            onScroll={onScroll}
            onSelectColor={screen.setSelectedColor}
            onSelectPreset={screen.applyTemplate}
            onSelectType={screen.setType}
            selectedColor={screen.selectedColor}
            selectedEmoji={screen.selectedEmoji}
            showColorPicker
            showTypeSelector
            type={screen.type}
          />
        </ScreenWrapper>

        <FloatingAction
          presentation="save"
          onPress={screen.handleSavePress}
          disabled={screen.loading || !screen.categoryName.trim()}
          loading={screen.loading}
          label="Create Category"
          icon="checkmark"
        />

        <EmojiKeyboardSheet
          isOpen={screen.showEmojiPicker}
          onClose={screen.closeEmojiPicker}
          onEmojiSelect={screen.selectEmoji}
        />
      </ScreenContainer>
    </>
  );
}
