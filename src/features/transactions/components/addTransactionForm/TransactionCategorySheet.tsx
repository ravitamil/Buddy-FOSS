import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Button, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {View, YStack} from 'tamagui';

import type {Category} from '@/types';
import {isEmojiCategoryIcon} from '../transactionDetailPresentation';

interface TransactionCategorySheetProps {
  categories: Category[];
  isOpen: boolean;
  selectedCategory: Category | null;
  onAddCategory: () => void;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
}

export function TransactionCategorySheet({
  categories,
  isOpen,
  selectedCategory,
  onAddCategory,
  onClose,
  onSelectCategory,
}: TransactionCategorySheetProps) {
  const colors = useBuddyColors();
  const [filterText, setFilterText] = useState('');

  const filteredCategories = filterText.trim()
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(filterText.trim().toLowerCase()),
      )
    : categories;

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setFilterText('');
          onClose();
        }
      }}
      snapPoints={[85]}
      scrollable
      zIndex={100000}
      title="Select Category"
      description="Choose a category for this transaction"
      footer={
        <Button
          variant="outline"
          onPress={() => {
            onClose();
            onAddCategory();
          }}
          leftIcon={<Ionicons name="add" size={18} color={colors.primary} />}>
          <Text variant="body1" weight="semibold" color="$primary">
            Manage Categories
          </Text>
        </Button>
      }>
      <YStack gap="$1">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategory?.id === category.id;
          const categoryColor = category.color?.trim() || colors.income;
          const isEmoji = Boolean(category.icon && isEmojiCategoryIcon(category.icon));

          return (
            <BottomSheetOption
              key={`cat-option-${category.id}`}
              label={category.name}
              description={category.type ? `${category.type.toUpperCase()}` : undefined}
              selected={isSelected}
              leading={
                <View
                  width={44}
                  height={44}
                  borderRadius={12}
                  backgroundColor={`${categoryColor}20`}
                  borderWidth={1}
                  borderColor={`${categoryColor}40`}
                  alignItems="center"
                  justifyContent="center">
                  {isEmoji ? (
                    <Text
                      fontSize={22}
                      style={{
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        includeFontPadding: false,
                      }}>
                      {category.icon}
                    </Text>
                  ) : (
                    <Ionicons
                      name={
                        category.icon && category.icon in Ionicons.glyphMap
                          ? (category.icon as keyof typeof Ionicons.glyphMap)
                          : 'pricetag'
                      }
                      size={20}
                      color={categoryColor}
                    />
                  )}
                </View>
              }
              onPress={() => {
                onSelectCategory(category);
                onClose();
              }}
            />
          );
        })}
      </YStack>
    </BottomSheet>
  );
}
