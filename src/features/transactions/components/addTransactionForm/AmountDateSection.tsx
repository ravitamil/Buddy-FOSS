import React from 'react';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {GlassSurface, Input, Text} from '@ravitamil/buddy-ui';
import {View, XStack, YStack} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import dayjs from 'dayjs';

interface AmountDateSectionProps {
  amount: string;
  currencyPrefix: string;
  selectedDate: Date;
  showDatePicker: boolean;
  onAmountChange: (text: string) => void;
  onAmountSubmit: () => void;
  onDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  onOpenDatePicker: () => void;
  onAddQuickAmount?: (delta: number) => void;
}

const quickPresets = [10, 50, 100, 500];

export function AmountDateSection({
  amount,
  currencyPrefix,
  selectedDate,
  showDatePicker,
  onAmountChange,
  onAmountSubmit,
  onDateChange,
  onOpenDatePicker,
  onAddQuickAmount,
}: AmountDateSectionProps) {
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');
  const formattedDate = isToday
    ? 'Today'
    : dayjs(selectedDate).isSame(dayjs().subtract(1, 'day'), 'day')
      ? 'Yesterday'
      : dayjs(selectedDate).format('MMM D, YYYY');

  return (
    <GlassSurface padding="$4" borderRadius="$4">
      <YStack gap="$4">
        {/* Label & Date Button Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text
            variant="caption"
            color="$colorSubtitle"
            weight="semibold"
            textTransform="uppercase">
            Amount
          </Text>

          {/* Date Picker Trigger Chip */}
          <View
            accessibilityRole="button"
            accessibilityLabel={`Transaction date: ${formattedDate}`}
            onPress={onOpenDatePicker}
            pressStyle={{opacity: 0.75}}>
            <XStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$2.5"
              paddingVertical="$1.5"
              borderRadius="$4"
              backgroundColor="$surface"
              borderWidth={1}
              borderColor="$borderColor">
              <Ionicons name="calendar-outline" size={14} color="$iconBrand" />
              <Text variant="caption" color="$color" weight="medium">
                {formattedDate}
              </Text>
            </XStack>
          </View>
        </XStack>

        {/* Hero Amount Input Display */}
        <XStack alignItems="baseline" justifyContent="center" gap="$2" paddingVertical="$1">
          <Text fontSize={32} fontWeight="700" color="$colorSubtitle">
            {currencyPrefix}
          </Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={onAmountSubmit}
            autoFocus={!amount}
            fontSize={40}
            fontWeight="800"
            color="$color"
            backgroundColor="transparent"
            borderWidth={0}
            paddingHorizontal={0}
            paddingVertical={0}
            height={52}
            minWidth={120}
            textAlign="left"
            placeholderTextColor="$colorSubtitle"
          />
        </XStack>

        {/* Quick-add Amount Presets */}
        {onAddQuickAmount && (
          <XStack gap="$2" justifyContent="center">
            {quickPresets.map((preset) => (
              <View
                key={preset}
                accessibilityRole="button"
                accessibilityLabel={`Add ${preset}`}
                onPress={() => onAddQuickAmount(preset)}
                pressStyle={{opacity: 0.7, scale: 0.96}}>
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  borderRadius="$3"
                  backgroundColor="$surface"
                  borderWidth={1}
                  borderColor="$borderColor"
                  minHeight={34}
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
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </YStack>
    </GlassSurface>
  );
}
