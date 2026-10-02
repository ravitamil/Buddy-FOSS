import React from 'react';
import {Button, createAlphaColor, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, XStack, YStack} from 'tamagui';

import type {Category} from '@/types';
import {isEmojiCategoryIcon} from '../transactionDetailPresentation';
import {AddTransactionCard} from './AddTransactionCard';

interface CategorySectionProps {
  availableCategories?: Category[];
  selectedCategory: Category | null;
  onAddCategory: () => void;
  onOpenCategorySheet?: () => void;
  onSelectCategory?: (category: Category) => void;
}

export function CategorySection({
  selectedCategory,
  onAddCategory,
  onOpenCategorySheet,
}: CategorySectionProps) {
  const colors = useBuddyColors();

  const categoryColor = selectedCategory?.color?.trim() || colors.income;
  const isEmoji = Boolean(selectedCategory?.icon && isEmojiCategoryIcon(selectedCategory.icon));

  return (
    <AddTransactionCard>
      <YStack gap="$3">
        {/* Section Header */}
        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <Text variant="h5" weight="semibold" color="$color">
            Category
          </Text>
          <XStack alignItems="center" gap="$2">
            {onOpenCategorySheet && (
              <Button
                variant="outline"
                size="small"
                onPress={onOpenCategorySheet}
                accessibilityLabel="Browse all categories">
                <Text variant="body2" weight="bold" color="$primary">
                  Browse All
                </Text>
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              onPress={onAddCategory}
              leftIcon={<Ionicons name="add" size={16} color={colors.buttonPrimaryText} />}
              accessibilityLabel="Add new category"
              accessibilityHint="Navigate to add category screen">
              Add
            </Button>
          </XStack>
        </XStack>

        {/* Prominent Active Category Tile */}
        <View
          accessibilityRole="button"
          accessibilityLabel={
            selectedCategory
              ? `Selected category: ${selectedCategory.name}. Tap to change`
              : 'No category selected. Tap to choose category'
          }
          onPress={onOpenCategorySheet}
          pressStyle={{opacity: 0.85, scale: 0.99}}>
          <XStack
            alignItems="center"
            gap="$3"
            padding="$3"
            borderRadius="$4"
            backgroundColor="$surface"
            borderWidth={1}
            borderColor="$borderColor">
            <View
              width={44}
              height={44}
              borderRadius={12}
              backgroundColor={createAlphaColor(categoryColor, 0.18)}
              borderWidth={1}
              borderColor={createAlphaColor(categoryColor, 0.35)}
              alignItems="center"
              justifyContent="center">
              {isEmoji ? (
                <Text
                  fontSize={20}
                  style={{
                    lineHeight: 24,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                  }}>
                  {selectedCategory?.icon}
                </Text>
              ) : (
                <Ionicons
                  name={
                    selectedCategory?.icon && selectedCategory.icon in Ionicons.glyphMap
                      ? (selectedCategory.icon as keyof typeof Ionicons.glyphMap)
                      : 'pricetag'
                  }
                  size={20}
                  color={categoryColor}
                />
              )}
            </View>

            <YStack flex={1} gap="$0.5">
              <Text variant="body1" weight="semibold" color="$color">
                {selectedCategory?.name ?? 'Select a category'}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {selectedCategory ? 'Tap to change category' : 'Choose category for transaction'}
              </Text>
            </YStack>

            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </XStack>
        </View>
      </YStack>
    </AddTransactionCard>
  );
}
