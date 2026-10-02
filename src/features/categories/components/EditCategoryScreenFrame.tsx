import {FloatingAction, HStack, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {useTheme} from 'tamagui';
import {resolveThemeColor, semanticHexColor} from '@ravitamil/buddy-ui';

import {GlassSurface} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Text} from '@ravitamil/buddy-ui';
import {
  CustomNavigationHeader,
  EmojiKeyboardSheet,
  ScreenContainer,
  ScreenWrapper,
} from '@/components/ui';
import type {UseEditCategoryScreenResult} from '../hooks/useEditCategoryScreen';
import {CategoryFormSections} from './CategoryFormSections';

export const EditCategoryScreenFrame: React.FC<{screen: UseEditCategoryScreenResult}> = ({
  screen,
}) => {
  const handleSavePress = React.useCallback(() => {
    void screen.handleSave();
  }, [screen]);

  if (!screen.category) {
    return null;
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={screen.isInvestmentCategory ? 'Edit Investment Category' : 'Edit Category'}
        subtitle={screen.isMandatory ? 'Protected category - View Only' : 'Customize your category'}
        showBackButton
        onBackPress={screen.handleBack}
        mode="collapsing"
        {...screen.headerProps}
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="avoid"
        scrollable={false}>
        <CategoryFormSections
          categoryName={screen.categoryName}
          isReadOnly={screen.isMandatory}
          notice={screen.isMandatory ? <SystemCategoryNotice /> : undefined}
          onChangeName={screen.setCategoryName}
          onChangeEmoji={screen.setSelectedEmoji}
          onOpenEmojiPicker={screen.openEmojiPicker}
          onScroll={screen.onScroll}
          onSelectColor={screen.setSelectedColor}
          onSelectType={screen.setSelectedType}
          selectedColor={screen.selectedColor}
          selectedEmoji={screen.selectedEmoji}
          showColorPicker={!screen.isMandatory}
          showTypeSelector={!screen.isInvestmentCategory && !screen.isMandatory}
          type={screen.selectedType}
        />
      </ScreenWrapper>
      {!screen.isMandatory ? (
        <FloatingAction
          presentation="save"
          onPress={handleSavePress}
          disabled={screen.loading || !screen.categoryName.trim() || !screen.hasChanges}
          loading={screen.loading}
          label="Update Category"
          icon="checkmark"
        />
      ) : null}
      <EmojiKeyboardSheet
        isOpen={screen.showEmojiPicker}
        onClose={screen.closeEmojiPicker}
        onEmojiSelect={screen.selectEmoji}
      />
    </ScreenContainer>
  );
};

function SystemCategoryNotice() {
  const theme = useTheme();
  const warningColor = resolveThemeColor(theme, 'warning', semanticHexColor('warning'));

  return (
    <GlassSurface washColor={warningColor} borderRadius={20} padding={16}>
      <HStack alignItems="center" gap="$3">
        <Ionicons name="lock-closed" size={20} color={warningColor} />
        <VStack flex={1} gap="$1">
          <Text color="$text" fontWeight="700" fontSize="$4">
            Built-in category
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            This category is protected and cannot be changed.
          </Text>
        </VStack>
      </HStack>
    </GlassSurface>
  );
}
