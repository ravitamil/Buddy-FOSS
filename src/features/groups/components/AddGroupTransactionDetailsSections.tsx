import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {Platform, TextInput} from 'react-native';
import {View} from 'tamagui';

import {getFontFamilyForWeight} from '@/utils/fonts';
import {colorToken} from '@/utils/themeColors';
import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';
import type {IoniconName} from '../types/addGroupTransaction';
import {AddGroupTransactionReceiptSection} from './AddGroupTransactionReceiptSection';

interface DetailsSectionsProps {
  screen: UseAddGroupTransactionScreenResult;
}

const emojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}\u200D\p{Emoji_Presentation}+|\p{Emoji}\u200D\p{Emoji}+|\p{Extended_Pictographic})+$/u;

export const AddGroupTransactionDetailsSections = ({screen}: DetailsSectionsProps) => {
  const selectedCategory = screen.expenseCategories.find(
    (category) => category.id === screen.selectedCategoryId,
  );
  const categoryColor =
    selectedCategory?.color || (screen.isDarkMode ? colorToken('blue6') : colorToken('blue7'));
  const isEmoji = Boolean(selectedCategory?.icon && emojiRegex.test(selectedCategory.icon));
  const categoryIcon = (selectedCategory?.icon || 'pricetag') as IoniconName;

  const isExpense = screen.transactionType === 'expense';
  const memberCount = screen.group?.members.length || 1;
  const parsedAmount = Number.parseFloat(screen.amount) || 0;
  const perPersonAmount = parsedAmount > 0 ? parsedAmount / memberCount : 0;
  const perPersonFormatted = screen.settingsFormatCurrencyExact(perPersonAmount);

  const accentColor = isExpense
    ? screen.isDarkMode
      ? '#FF4757'
      : '#E11D48'
    : screen.isDarkMode
      ? '#10B981'
      : '#059669';

  const pillBg = screen.isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const pillBorder = screen.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <>
      {/* Premier Hero Amount Card */}
      <GlassSurface padding={18}>
        <VStack gap="$4">
          {/* Top Control Bar: Mode Capsule + Currency Pill */}
          <HStack justifyContent="space-between" alignItems="center">
            {/* Segmented Mode Capsule */}
            <HStack
              padding={3}
              borderRadius={20}
              backgroundColor={pillBg}
              borderWidth={1}
              borderColor={pillBorder}
              gap="$1">
              <ModeCapsuleTab
                active={isExpense}
                activeColor={accentColor}
                icon="receipt-outline"
                label="Expense"
                onPress={() => screen.setTransactionType('expense')}
                isDarkMode={screen.isDarkMode}
              />
              <ModeCapsuleTab
                active={!isExpense}
                activeColor={screen.isDarkMode ? '#10B981' : '#059669'}
                icon="swap-horizontal-outline"
                label="Transfer"
                onPress={() => screen.setTransactionType('payment')}
                isDarkMode={screen.isDarkMode}
              />
            </HStack>

            {/* Currency Pill */}
            <HStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={16}
              backgroundColor={pillBg}
              borderWidth={1}
              borderColor={pillBorder}>
              <View
                width={18}
                height={18}
                borderRadius={9}
                backgroundColor={
                  screen.isDarkMode ? 'rgba(78, 205, 196, 0.2)' : 'rgba(78, 205, 196, 0.15)'
                }
                alignItems="center"
                justifyContent="center">
                <Text fontSize={10} weight="bold" color={screen.isDarkMode ? '#4ECDC4' : '#2D8982'}>
                  {screen.currencySymbol}
                </Text>
              </View>
              <Text fontSize={12} weight="bold" color="$text">
                {screen.currencyCode}
              </Text>
            </HStack>
          </HStack>

          {/* Centered Amount Input Area */}
          <VStack alignItems="center" justifyContent="center" paddingVertical={4} gap="$2">
            <Text
              fontSize={11}
              weight="bold"
              color="$textSecondary"
              letterSpacing={1.2}
              textTransform="uppercase">
              {isExpense ? 'TOTAL EXPENSE AMOUNT' : 'TRANSFER AMOUNT'}
            </Text>

            {/* Direct Centered Native TextInput (no borders, no clipping) */}
            <HStack alignItems="center" justifyContent="center" width="100%" minHeight={72}>
              {/* eslint-disable-next-line development-quality/enforce-tamagui-usage */}
              <TextInput
                accessibilityLabel="Transaction amount input"
                value={screen.amount}
                onChangeText={screen.handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={
                  screen.isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'
                }
                style={{
                  fontSize: 54,
                  fontFamily: getFontFamilyForWeight('800'),
                  color: screen.isDarkMode ? '#FFFFFF' : '#111827',
                  textAlign: 'center',
                  width: '100%',
                  paddingVertical: Platform.OS === 'android' ? 8 : 4,
                  paddingHorizontal: 0,
                  margin: 0,
                  borderWidth: 0,
                  backgroundColor: 'transparent',
                  includeFontPadding: true,
                }}
                underlineColorAndroid="transparent"
                caretHidden={true}
                cursorColor="transparent"
                selectionColor="transparent"
                autoFocus
              />
            </HStack>

            {/* Live Real-time Split / Settlement Feedback Pill */}
            <HStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={16}
              backgroundColor={pillBg}
              borderWidth={1}
              borderColor={pillBorder}>
              <Ionicons
                name={isExpense ? 'people' : 'swap-horizontal'}
                size={13}
                color={accentColor}
              />
              <Text fontSize={12} weight="semibold" color="$textSecondary">
                {isExpense
                  ? parsedAmount > 0
                    ? `Split among ${memberCount} • ${perPersonFormatted} / person`
                    : `Split among ${memberCount} members`
                  : 'Direct payment to settle debt'}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </GlassSurface>

      {/* Transaction Details & Category Card */}
      <GlassSurface padding={16}>
        <VStack gap="$4">
          <FormField
            label="Description *"
            value={screen.description}
            onChangeText={screen.setDescription}
            placeholder={isExpense ? 'Enter expense description' : 'Enter transfer details'}
            leftIcon="document-text-outline"
          />

          {isExpense ? (
            <VStack gap="$2">
              <Text variant="caption" color="$textSecondary" weight="semibold" marginLeft={4}>
                CATEGORY
              </Text>
              <HStack
                accessibilityRole="button"
                accessibilityLabel="Select transaction category"
                onPress={() => screen.setIsCategorySheetOpen(true)}
                pressStyle={{opacity: 0.85, scale: 0.99}}
                alignItems="center"
                padding={12}
                borderRadius={14}
                backgroundColor={
                  screen.isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'
                }
                borderWidth={1}
                borderColor={screen.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}
                justifyContent="space-between">
                <HStack alignItems="center" gap="$3" flex={1}>
                  <View
                    width={38}
                    height={38}
                    borderRadius={19}
                    backgroundColor={categoryColor}
                    alignItems="center"
                    justifyContent="center"
                    shadowColor={categoryColor}
                    shadowOffset={{width: 0, height: 2}}
                    shadowOpacity={0.25}
                    shadowRadius={4}>
                    {isEmoji ? (
                      <Text fontSize={18}>{selectedCategory?.icon}</Text>
                    ) : (
                      <Ionicons name={categoryIcon} size={18} color="white" />
                    )}
                  </View>
                  <VStack flex={1} gap="$0.5">
                    <Text color="$text" weight="bold" fontSize={14}>
                      {selectedCategory?.name || 'Select Category'}
                    </Text>
                    <Text color="$textSecondary" fontSize={11}>
                      Tap to choose category
                    </Text>
                  </VStack>
                </HStack>
                <Ionicons name="chevron-forward" size={18} color={colorToken('textSecondary')} />
              </HStack>
            </VStack>
          ) : null}
        </VStack>
      </GlassSurface>

      {/* Collapsible Receipt & Document Section */}
      {isExpense ? <AddGroupTransactionReceiptSection screen={screen} /> : null}
    </>
  );
};

const ModeCapsuleTab = ({
  active,
  activeColor,
  icon,
  label,
  onPress,
  isDarkMode,
}: {
  active: boolean;
  activeColor: string;
  icon: IoniconName;
  label: string;
  onPress: () => void;
  isDarkMode: boolean;
}) => (
  <HStack
    accessibilityRole="button"
    accessibilityState={{selected: active}}
    accessibilityLabel={`${label} mode`}
    onPress={onPress}
    pressStyle={{opacity: 0.85, scale: 0.96}}
    paddingHorizontal={12}
    paddingVertical={6}
    alignItems="center"
    borderRadius={16}
    backgroundColor={active ? activeColor : 'transparent'}
    shadowColor={active ? activeColor : 'transparent'}
    shadowOffset={{width: 0, height: 2}}
    shadowOpacity={active ? 0.35 : 0}
    shadowRadius={4}
    gap="$1.5">
    <Ionicons
      name={icon}
      size={14}
      color={active ? '#FFFFFF' : isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
    />
    <Text weight="bold" fontSize={12} color={active ? '#FFFFFF' : '$textSecondary'}>
      {label}
    </Text>
  </HStack>
);
