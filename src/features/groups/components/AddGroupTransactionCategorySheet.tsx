import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import {colorToken} from '@/utils/themeColors';
import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';
import type {IoniconName} from '../types/addGroupTransaction';

interface CategorySheetProps {
  screen: UseAddGroupTransactionScreenResult;
}

const emojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}\u200D\p{Emoji_Presentation}+|\p{Emoji}\u200D\p{Emoji}+|\p{Extended_Pictographic})+$/u;

export const AddGroupTransactionCategorySheet = ({screen}: CategorySheetProps) => {
  if (screen.transactionType !== 'expense') {
    return null;
  }

  return (
    <BottomSheet
      open={screen.isCategorySheetOpen}
      onOpenChange={screen.setIsCategorySheetOpen}
      snapPoints={[85]}
      scrollable
      zIndex={100000}
      title="Select Category"
      description="Choose the category for this group expense">
      {screen.expenseCategories.map((category, index) => {
        const isSelected = screen.selectedCategoryId === category.id;
        const categoryColor =
          category.color || (screen.isDarkMode ? colorToken('blue6') : colorToken('blue7'));
        const isEmoji = Boolean(category.icon && emojiRegex.test(category.icon));

        return (
          <BottomSheetOption
            key={`category-${category.id}-${index}`}
            label={category.name}
            description="Tap to select"
            selected={isSelected}
            leading={
              <View
                width={48}
                height={48}
                borderRadius={24}
                backgroundColor={`${categoryColor}20`}
                alignItems="center"
                justifyContent="center">
                {isEmoji ? (
                  <Text fontSize={24}>{category.icon}</Text>
                ) : (
                  <Ionicons
                    name={(category.icon || 'pricetag') as IoniconName}
                    size={24}
                    color={categoryColor}
                  />
                )}
              </View>
            }
            onPress={() => {
              screen.setSelectedCategoryId(category.id);
              screen.setIsCategorySheetOpen(false);
            }}
          />
        );
      })}
    </BottomSheet>
  );
};
