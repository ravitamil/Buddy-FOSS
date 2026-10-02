import {HStack, Input, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Platform} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView} from 'tamagui';
import {FormField} from '@ravitamil/buddy-ui/FormField';

import {colorToken} from '@/utils/themeColors';
import type {UseEditGroupTransactionScreenResult} from '../hooks/useEditGroupTransactionScreen';
import type {IoniconName} from '../types/addGroupTransaction';

interface DetailsSectionsProps {
  screen: UseEditGroupTransactionScreenResult;
}

const emojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}\u200D\p{Emoji_Presentation}+|\p{Emoji}\u200D\p{Emoji}+|\p{Extended_Pictographic})+$/u;

export const EditGroupTransactionDetailsSections = ({screen}: DetailsSectionsProps) => (
  <>
    <VStack alignItems="center" justifyContent="center" paddingVertical={20}>
      <Text
        color="$textSecondary"
        fontWeight="600"
        marginBottom={8}
        fontSize={14}
        letterSpacing={1}>
        AMOUNT
      </Text>
      <HStack alignItems="center" justifyContent="center">
        <Text
          fontSize={64}
          fontWeight="bold"
          color="$text"
          style={{marginRight: 0, lineHeight: Platform.OS === 'ios' ? 80 : undefined}}>
          {screen.currencySymbol}
        </Text>
        <Input
          accessibilityLabel="Transaction amount"
          chrome={false}
          value={screen.amount}
          onChangeText={screen.handleAmountChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="$colorTransparent"
          fontSize={64}
          fontWeight="bold"
          color="$text"
          minWidth={60}
          textAlign="center"
          autoFocus
        />
      </HStack>
    </VStack>

    <GlassSurface padding={16}>
      <VStack gap="$4">
        <FormField
          label="Description *"
          value={screen.description}
          onChangeText={screen.setDescription}
          placeholder="What's this for?"
          leftIcon="document-text-outline"
        />

        <VStack gap="$3">
          <Text variant="caption" color="$textSecondary" weight="semibold">
            CATEGORY
          </Text>
          <ScrollView
            removeClippedSubviews={false}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 10, paddingRight: 20}}>
            {screen.expenseCategories.map((category) => {
              const isSelected = screen.selectedCategoryId === category.id;
              const categoryColor =
                category.color || (screen.isDarkMode ? colorToken('blue6') : colorToken('blue7'));
              const isEmoji = Boolean(category.icon && emojiRegex.test(category.icon));
              const iconName = (
                !isEmoji && category.icon.length > 1 ? category.icon : 'pricetag'
              ) as IoniconName;

              return (
                <HStack
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{selected: isSelected}}
                  onPress={() => screen.setSelectedCategoryId(category.id)}
                  pressStyle={{opacity: 0.8}}
                  alignItems="center"
                  paddingVertical="$2"
                  paddingHorizontal="$4"
                  borderRadius="$5"
                  backgroundColor={
                    isSelected
                      ? categoryColor
                      : screen.isDarkMode
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.05)'
                  }
                  borderWidth={1}
                  borderColor={
                    isSelected
                      ? 'transparent'
                      : screen.isDarkMode
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)'
                  }>
                  {isEmoji ? (
                    <Text fontSize={14} marginRight={6}>
                      {category.icon}
                    </Text>
                  ) : (
                    <Ionicons
                      name={iconName}
                      size={14}
                      color={isSelected ? 'white' : colorToken('textSecondary')}
                      style={{marginRight: 6}}
                    />
                  )}
                  <Text
                    fontSize={14}
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? 'white' : '$textSecondary'}>
                    {category.name}
                  </Text>
                </HStack>
              );
            })}
          </ScrollView>
        </VStack>
      </VStack>
    </GlassSurface>
  </>
);
