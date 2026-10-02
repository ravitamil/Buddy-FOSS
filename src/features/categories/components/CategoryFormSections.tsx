import {HStack, VStack} from '@ravitamil/buddy-ui';
import React, {ComponentProps} from 'react';
import Animated from 'react-native-reanimated';
import {View, XStack, useTheme} from 'tamagui';
import {createAlphaColor, Input, resolveThemeColor, semanticHexColor} from '@ravitamil/buddy-ui';

import {GlassSurface} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Text} from '@ravitamil/buddy-ui';

import {CategoryColorPicker} from './CategoryColorPicker';
import {CategoryIconEditor, type CategoryPreset} from './CategoryIconEditor';

export type CategoryFormType = 'expense' | 'income' | 'investment';

const CATEGORY_TYPES: CategoryFormType[] = ['expense', 'income', 'investment'];

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface CategoryFormSectionsProps {
  categoryName: string;
  isReadOnly?: boolean;
  notice?: React.ReactNode;
  onChangeEmoji: (emoji: string) => void;
  onChangeName: (name: string) => void;
  onOpenEmojiPicker?: () => void;
  onScroll: ComponentProps<typeof Animated.ScrollView>['onScroll'];
  onSelectColor: (color: string) => void;
  onSelectPreset?: (preset: CategoryPreset) => void;
  onSelectType: (type: CategoryFormType) => void;
  selectedColor: string;
  selectedEmoji: string;
  showColorPicker: boolean;
  showTypeSelector: boolean;
  type: CategoryFormType;
}

/** Shared Create/Edit category form composition. Screen frames own navigation and save behavior. */
export function CategoryFormSections({
  categoryName,
  isReadOnly = false,
  notice,
  onChangeEmoji,
  onChangeName,
  onOpenEmojiPicker,
  onScroll,
  onSelectColor,
  onSelectPreset,
  onSelectType,
  selectedColor,
  selectedEmoji,
  showColorPicker,
  showTypeSelector,
  type,
}: CategoryFormSectionsProps) {
  return (
    <Animated.ScrollView
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={onScroll}
      contentContainerStyle={contentContainerStyle}>
      <VStack padding="$4" gap="$4">
        <CategoryIdentitySection
          categoryName={categoryName}
          isReadOnly={isReadOnly}
          onChangeEmoji={onChangeEmoji}
          onChangeName={onChangeName}
          onOpenEmojiPicker={onOpenEmojiPicker}
          onSelectPreset={onSelectPreset}
          selectedColor={selectedColor}
          selectedEmoji={selectedEmoji}
        />
        {notice}
        {showTypeSelector ? (
          <CategoryTypeSection onSelectType={onSelectType} selectedType={type} />
        ) : null}
        {showColorPicker ? (
          <CategoryColorPicker onSelectColor={onSelectColor} selectedColor={selectedColor} />
        ) : null}
      </VStack>
    </Animated.ScrollView>
  );
}

function CategoryIdentitySection({
  categoryName,
  isReadOnly,
  onChangeEmoji,
  onChangeName,
  onOpenEmojiPicker,
  onSelectPreset,
  selectedColor,
  selectedEmoji,
}: Pick<
  CategoryFormSectionsProps,
  | 'categoryName'
  | 'isReadOnly'
  | 'onChangeEmoji'
  | 'onChangeName'
  | 'onOpenEmojiPicker'
  | 'onSelectPreset'
  | 'selectedColor'
  | 'selectedEmoji'
>) {
  return (
    <VStack gap="$4">
      <CategoryIconEditor
        currentName={categoryName}
        editable={!isReadOnly}
        onChangeIcon={onChangeEmoji}
        onOpenEmojiPicker={onOpenEmojiPicker}
        onSelectPreset={onSelectPreset}
        selectedColor={selectedColor}
        value={selectedEmoji}
      />
      <GlassSurface padding={16} borderRadius={20}>
        <VStack gap="$2.5">
          <Text color="$text" fontSize="$5" fontWeight="700">
            Category name
          </Text>
          <Input
            placeholder="e.g. Groceries, Rent, Salary"
            value={categoryName}
            onChangeText={onChangeName}
            maxLength={30}
            editable={!isReadOnly}
            autoCapitalize="words"
            chrome={false}
            size="medium"
            width="100%"
            minHeight={56}
            paddingHorizontal="$3"
            borderRadius={14}
            backgroundColor="$surface"
            testID="category-name"
          />
          <HStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text color="$textSecondary" fontSize="$2" flex={1}>
              {isReadOnly
                ? 'Built-in categories cannot be changed.'
                : 'Give this category a recognizable name for transactions.'}
            </Text>
            <Text color="$textSecondary" fontSize="$2">
              {categoryName.length}/30
            </Text>
          </HStack>
        </VStack>
      </GlassSurface>
    </VStack>
  );
}

function CategoryTypeSection({
  onSelectType,
  selectedType,
}: {
  onSelectType: (type: CategoryFormType) => void;
  selectedType: CategoryFormType;
}) {
  return (
    <GlassSurface padding={12} borderRadius={20}>
      <VStack gap="$2">
        <Text color="$text" fontSize="$5" fontWeight="700">
          Category type
        </Text>
        <Text color="$textSecondary" fontSize="$2">
          Select whether this category is for tracking expenses, income, or investments.
        </Text>
        <XStack gap="$1" marginTop="$1">
          {CATEGORY_TYPES.map((categoryType) => (
            <CategoryTypeOption
              key={categoryType}
              categoryType={categoryType}
              isSelected={selectedType === categoryType}
              onPress={() => onSelectType(categoryType)}
            />
          ))}
        </XStack>
      </VStack>
    </GlassSurface>
  );
}

function CategoryTypeOption({
  categoryType,
  isSelected,
  onPress,
}: {
  categoryType: CategoryFormType;
  isSelected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const accentColor = getTypeAccentColor(categoryType);
  const mutedIconColor = resolveThemeColor(theme, 'textSecondary', '#9ca3af');

  return (
    <View
      flex={1}
      minWidth={0}
      minHeight={52}
      borderRadius={14}
      alignItems="center"
      justifyContent="center"
      backgroundColor={isSelected ? createAlphaColor(accentColor, 0.16) : 'transparent'}
      accessibilityRole="button"
      accessibilityLabel={`Select ${categoryType} category type`}
      accessibilityHint={`Sets this category as ${categoryType}`}
      accessibilityState={{selected: isSelected}}
      onPress={onPress}
      pressStyle={{scale: 0.97, opacity: 0.9}}>
      <HStack alignItems="center" justifyContent="center" gap="$1.5">
        <Ionicons
          name={getTypeIcon(categoryType)}
          size={18}
          color={isSelected ? accentColor : mutedIconColor}
        />
        <Text
          color={isSelected ? '$text' : '$textSecondary'}
          fontSize="$2"
          fontWeight={isSelected ? '700' : '600'}
          textTransform="capitalize"
          numberOfLines={1}>
          {categoryType}
        </Text>
      </HStack>
    </View>
  );
}

function getTypeAccentColor(type: CategoryFormType): string {
  switch (type) {
    case 'income':
      return semanticHexColor('success');
    case 'expense':
      return semanticHexColor('error');
    case 'investment':
      return semanticHexColor('info');
  }
}

function getTypeIcon(type: CategoryFormType): IoniconName {
  switch (type) {
    case 'income':
      return 'arrow-down';
    case 'expense':
      return 'arrow-up';
    case 'investment':
      return 'trending-up';
  }
}

const contentContainerStyle = {
  paddingTop: 118,
  paddingBottom: 124,
};
