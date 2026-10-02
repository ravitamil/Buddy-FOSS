import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {createAlphaColor} from '@ravitamil/buddy-ui/theme';
import React from 'react';
import {ScrollView, View, styled} from 'tamagui';

export interface CategoryPreset {
  emoji: string;
  name: string;
}

export const CATEGORY_PRESETS: ReadonlyArray<CategoryPreset> = [
  {name: 'Groceries', emoji: '🛒'},
  {name: 'Dining Out', emoji: '🍽️'},
  {name: 'Transport', emoji: '🚗'},
  {name: 'Housing', emoji: '🏠'},
  {name: 'Utilities', emoji: '💡'},
  {name: 'Shopping', emoji: '🛍️'},
  {name: 'Salary', emoji: '💼'},
  {name: 'Investments', emoji: '📈'},
  {name: 'Health', emoji: '🏥'},
  {name: 'Entertainment', emoji: '🎬'},
  {name: 'Travel', emoji: '✈️'},
  {name: 'Education', emoji: '📚'},
];

export interface CategoryIconEditorProps {
  currentName?: string;
  editable: boolean;
  onChangeIcon: (icon: string) => void;
  onOpenEmojiPicker?: () => void;
  onSelectPreset?: (preset: CategoryPreset) => void;
  selectedColor: string;
  value: string;
}

/**
 * Category icon editor matching CreateGroup icon selection with emoji sheet and quick presets.
 */
export function CategoryIconEditor({
  currentName,
  editable,
  onOpenEmojiPicker,
  onSelectPreset,
  selectedColor,
  value,
}: CategoryIconEditorProps) {
  const displayEmoji = value && value.trim() ? value : '🏷️';

  return (
    <VStack alignItems="center" gap="$3">
      <View
        testID="category-icon-picker-button"
        accessibilityRole="button"
        accessibilityLabel={editable ? 'Change category emoji' : 'Category emoji'}
        accessibilityHint={editable ? 'Opens emoji keyboard picker' : undefined}
        onPress={editable ? onOpenEmojiPicker : undefined}
        pressStyle={editable ? {scale: 0.95, opacity: 0.9} : undefined}
        width={76}
        height={76}
        borderRadius={22}
        backgroundColor={selectedColor || '$primary'}
        borderWidth={2}
        borderColor={createAlphaColor('#ffffff', 0.3)}
        alignItems="center"
        justifyContent="center"
        position="relative"
        style={{
          shadowColor: selectedColor || '#3B82F6',
          shadowOffset: {width: 0, height: 6},
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 6,
        }}>
        <Text fontSize={36} lineHeight={42} textAlign="center">
          {displayEmoji}
        </Text>

        {editable ? (
          <View
            testID="category-icon-edit-indicator"
            position="absolute"
            right={-4}
            bottom={-4}
            width={26}
            height={26}
            borderRadius={13}
            backgroundColor="$primary"
            borderWidth={2}
            borderColor="$background"
            alignItems="center"
            justifyContent="center">
            <ThemedIonicon name="pencil" size={12} color="$buttonPrimaryText" />
          </View>
        ) : (
          <View
            position="absolute"
            right={-4}
            bottom={-4}
            width={26}
            height={26}
            borderRadius={13}
            backgroundColor="$warning"
            borderWidth={2}
            borderColor="$background"
            alignItems="center"
            justifyContent="center">
            <ThemedIonicon name="lock-closed" size={12} color="#ffffff" />
          </View>
        )}
      </View>

      <VStack alignItems="center" gap="$0.5">
        <Text color="$text" fontSize="$4" fontWeight="700">
          Category Icon
        </Text>
        <Text color="$textSecondary" fontSize="$2" textAlign="center">
          {editable
            ? 'Tap icon above to choose an emoji from the library'
            : 'Built-in category icon is locked'}
        </Text>
      </VStack>

      {editable && onSelectPreset ? (
        <VStack width="100%" gap="$2" marginTop="$1">
          <Text variant="caption" color="$textSecondary" weight="medium" textAlign="center">
            Quick presets
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack gap="$2" paddingHorizontal="$1" paddingBottom="$1">
              {CATEGORY_PRESETS.map((preset) => {
                const isSelected =
                  displayEmoji === preset.emoji ||
                  Boolean(currentName && currentName.toLowerCase() === preset.name.toLowerCase());

                return (
                  <HStack
                    key={preset.name}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${preset.name} preset`}
                    accessibilityState={{selected: isSelected}}
                    onPress={() => onSelectPreset(preset)}
                    pressStyle={{scale: 0.96}}
                    minHeight={38}
                    alignItems="center"
                    backgroundColor={
                      isSelected ? createAlphaColor(selectedColor, 0.16) : '$surface'
                    }
                    paddingHorizontal="$3"
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={isSelected ? selectedColor : '$borderColor'}
                    gap="$1.5">
                    <Text fontSize={16}>{preset.emoji}</Text>
                    <Text
                      color={isSelected ? '$text' : '$textSecondary'}
                      weight={isSelected ? 'bold' : 'medium'}
                      fontSize="$2">
                      {preset.name}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>
          </ScrollView>
        </VStack>
      ) : null}
    </VStack>
  );
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
