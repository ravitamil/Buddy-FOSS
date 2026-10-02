import React from 'react';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {GlassSurface, Input, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import dayjs from 'dayjs';
import {Platform} from 'react-native';
import {View, XStack, YStack} from 'tamagui';

import type {AddTransactionRouteType} from '../../types';

interface TransactionHeroAmountCardProps {
  amount: string;
  currencyPrefix: string;
  isIncome: boolean;
  selectedDate: Date;
  showDatePicker: boolean;
  transactionType: AddTransactionRouteType;
  onAddQuickAmount?: (delta: number) => void;
  onAmountChange: (text: string) => void;
  onAmountSubmit: () => void;
  onDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  onOpenDatePicker: () => void;
  onSelectType: (type: AddTransactionRouteType) => void;
}

const quickPresets = [10, 50, 100, 500];

export function TransactionHeroAmountCard({
  amount,
  currencyPrefix,
  isIncome,
  selectedDate,
  showDatePicker,
  transactionType,
  onAddQuickAmount,
  onAmountChange,
  onAmountSubmit,
  onDateChange,
  onOpenDatePicker,
  onSelectType,
}: TransactionHeroAmountCardProps) {
  const colors = useBuddyColors();
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');
  const formattedDate = isToday
    ? 'Today'
    : dayjs(selectedDate).isSame(dayjs().subtract(1, 'day'), 'day')
      ? 'Yesterday'
      : dayjs(selectedDate).format('MMM D, YYYY');

  const isExpense = transactionType === 'expense';

  return (
    <GlassSurface borderRadius={20} padding={18} washColor={isIncome ? '$income' : '$expense'}>
      <YStack gap="$4">
        {/* Top Control Bar: Mode Toggle Capsule & Date Pill */}
        <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
          {/* Segmented Capsule Toggle */}
          <XStack
            padding={3}
            borderRadius="$10"
            backgroundColor="$surfacePress"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$1">
            {/* Expense Tab */}
            <View
              accessibilityRole="button"
              accessibilityState={{selected: isExpense}}
              accessibilityLabel="Select expense transaction type"
              accessibilityHint="Changes the form to record expense"
              onPress={() => onSelectType('expense')}
              paddingHorizontal="$3.5"
              paddingVertical="$2"
              minHeight={44}
              justifyContent="center"
              borderRadius="$10"
              backgroundColor={isExpense ? '$expense' : 'transparent'}
              shadowColor={isExpense ? '$expense' : 'transparent'}
              shadowOffset={{width: 0, height: 2}}
              shadowOpacity={isExpense ? 0.35 : 0}
              shadowRadius={4}
              pressStyle={{opacity: 0.85, scale: 0.98}}>
              <XStack alignItems="center" gap="$1.5">
                <Ionicons
                  name="arrow-up-circle"
                  size={16}
                  color={isExpense ? colors.semanticOnColor : colors.textSecondary}
                />
                <Text
                  variant="caption"
                  color={isExpense ? '$semanticOnColor' : '$textSecondary'}
                  weight="bold">
                  Expense
                </Text>
              </XStack>
            </View>

            {/* Income Tab */}
            <View
              accessibilityRole="button"
              accessibilityState={{selected: isIncome}}
              accessibilityLabel="Select income transaction type"
              accessibilityHint="Changes the form to record income"
              onPress={() => onSelectType('income')}
              paddingHorizontal="$3.5"
              paddingVertical="$2"
              minHeight={44}
              justifyContent="center"
              borderRadius="$10"
              backgroundColor={isIncome ? '$income' : 'transparent'}
              shadowColor={isIncome ? '$income' : 'transparent'}
              shadowOffset={{width: 0, height: 2}}
              shadowOpacity={isIncome ? 0.35 : 0}
              shadowRadius={4}
              pressStyle={{opacity: 0.85, scale: 0.98}}>
              <XStack alignItems="center" gap="$1.5">
                <Ionicons
                  name="arrow-down-circle"
                  size={16}
                  color={isIncome ? colors.semanticOnColor : colors.textSecondary}
                />
                <Text
                  variant="caption"
                  color={isIncome ? '$semanticOnColor' : '$textSecondary'}
                  weight="bold">
                  Income
                </Text>
              </XStack>
            </View>
          </XStack>

          {/* Date Picker Trigger Chip */}
          <View
            accessibilityRole="button"
            accessibilityLabel={`Transaction date: ${formattedDate}`}
            onPress={onOpenDatePicker}
            minHeight={44}
            justifyContent="center"
            pressStyle={{opacity: 0.75, scale: 0.97}}
            hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
            <XStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$3"
              paddingVertical="$2"
              minHeight={44}
              justifyContent="center"
              borderRadius="$10"
              backgroundColor="$surface"
              borderWidth={1}
              borderColor="$borderColor">
              <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
              <Text variant="caption" color="$color" weight="semibold">
                {formattedDate}
              </Text>
            </XStack>
          </View>
        </XStack>

        {/* Centered Amount Hierarchy */}
        <YStack alignItems="center" justifyContent="center" paddingVertical={4} gap="$2">
          <Text
            fontSize={11}
            weight="bold"
            color={isIncome ? '$income' : '$expense'}
            letterSpacing={1.2}
            textTransform="uppercase">
            {isIncome ? 'Total income amount' : 'Total expense amount'}
          </Text>
          <Input
            chrome={false}
            accessibilityLabel={`Amount in ${currencyPrefix}`}
            testID="transaction-amount"
            placeholder="0.00"
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={onAmountSubmit}
            autoFocus={!amount}
            fontSize={54}
            fontWeight="800"
            color="$text"
            width="100%"
            minHeight={80}
            paddingVertical={Platform.OS === 'android' ? 8 : 4}
            textAlign="center"
            placeholderTextColor="$textDisabled"
            underlineColorAndroid="$transparent"
          />
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$10"
            backgroundColor="$surfacePress"
            borderWidth={1}
            borderColor="$borderColor">
            <Text variant="caption" weight="semibold" color="$textSecondary">
              {currencyPrefix}
            </Text>
          </XStack>
        </YStack>

        {/* Quick Amount Presets */}
        {onAddQuickAmount && (
          <XStack gap="$2" justifyContent="center" flexWrap="wrap">
            {quickPresets.map((preset) => (
              <View
                key={preset}
                accessibilityRole="button"
                accessibilityLabel={`Add ${preset}`}
                onPress={() => onAddQuickAmount(preset)}
                pressStyle={{opacity: 0.75, scale: 0.96}}
                hitSlop={{top: 6, bottom: 6, left: 4, right: 4}}>
                <XStack
                  paddingHorizontal="$3.5"
                  paddingVertical="$1.5"
                  borderRadius="$10"
                  backgroundColor="$surface"
                  borderWidth={1}
                  borderColor="$borderColor"
                  minHeight={40}
                  alignItems="center"
                  justifyContent="center">
                  <Text variant="caption" color="$color" weight="bold">
                    +{preset}
                  </Text>
                </XStack>
              </View>
            ))}
          </XStack>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </YStack>
    </GlassSurface>
  );
}
