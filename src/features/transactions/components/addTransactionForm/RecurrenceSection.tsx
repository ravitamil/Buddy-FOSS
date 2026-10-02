import React, {useDeferredValue, useMemo, useState} from 'react';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Switch, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {XStack, YStack} from 'tamagui';

import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {RecurrenceFrequency} from '@/types';
import type {RecurrenceFrequencyOption} from '../../types';
import {AddTransactionCard} from './AddTransactionCard';
import {DateField} from './DateField';

interface RecurrenceSectionProps {
  isRecurring: boolean;
  recurrenceEndDate: Date | null;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceFrequencies: RecurrenceFrequencyOption[];
  selectedDate: Date;
  showRecurrenceEndPicker: boolean;
  onClearEndDate: () => void;
  onEndDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  onOpenEndPicker: () => void;
  onSelectFrequency: (frequency: RecurrenceFrequency) => void;
  onToggleRecurring: (isRecurring: boolean) => void;
}

export function RecurrenceSection({
  isRecurring,
  recurrenceEndDate,
  recurrenceFrequency,
  recurrenceFrequencies,
  selectedDate,
  showRecurrenceEndPicker,
  onClearEndDate,
  onEndDateChange,
  onOpenEndPicker,
  onSelectFrequency,
  onToggleRecurring,
}: RecurrenceSectionProps) {
  const [frequencySheetOpen, setFrequencySheetOpen] = useState(false);
  const showRecurrenceDetails = useDeferredValue(isRecurring);
  const colors = useBuddyColors();
  const selectedFrequencyLabel = useMemo(
    () =>
      recurrenceFrequencies.find((frequency) => frequency.value === recurrenceFrequency)?.label ??
      'Choose frequency',
    [recurrenceFrequencies, recurrenceFrequency],
  );

  return (
    <>
      <AddTransactionCard>
        <XStack alignItems="center" justifyContent="space-between" gap="$3" minHeight={48}>
          <Text variant="h5" weight="semibold" color="$color" flex={1}>
            Recurring Transaction
          </Text>
          <Switch
            id="recurring-transaction"
            checked={isRecurring}
            onCheckedChange={onToggleRecurring}
            accessibilityLabel="Toggle recurring transaction"
            testID="recurring-transaction-switch"
          />
        </XStack>
      </AddTransactionCard>

      {showRecurrenceDetails ? (
        <AddTransactionCard>
          <YStack gap="$4">
            <YStack gap="$2">
              <Text variant="body2" weight="semibold" color="$color">
                Frequency
              </Text>
              <XStack
                accessibilityRole="button"
                accessibilityLabel={`Choose recurrence frequency, currently ${selectedFrequencyLabel}`}
                accessibilityHint="Opens recurrence frequency options"
                minHeight={56}
                alignItems="center"
                gap="$3"
                paddingHorizontal="$4"
                paddingVertical="$3"
                borderWidth={1}
                borderColor="$inputBorder"
                borderRadius="$4"
                backgroundColor="$inputBackground"
                pressStyle={{backgroundColor: '$surfacePress', scale: 0.99}}
                onPress={() => setFrequencySheetOpen(true)}>
                <YStack flex={1} gap="$1">
                  <Text variant="body1" weight="semibold" color="$color">
                    {selectedFrequencyLabel}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    Repeats automatically
                  </Text>
                </YStack>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </XStack>
            </YStack>

            <DateField
              label="End date (optional)"
              value={recurrenceEndDate ? recurrenceEndDate.toLocaleDateString() : 'No end date'}
              onPress={onOpenEndPicker}
              onClear={recurrenceEndDate ? onClearEndDate : undefined}
            />

            {showRecurrenceEndPicker && (
              <DateTimePicker
                value={recurrenceEndDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                mode="date"
                display="spinner"
                onChange={onEndDateChange}
                minimumDate={selectedDate}
              />
            )}
          </YStack>
        </AddTransactionCard>
      ) : null}

      <BottomSheet
        open={frequencySheetOpen}
        onOpenChange={setFrequencySheetOpen}
        title="Choose frequency"
        description="Select how often this transaction should repeat">
        {recurrenceFrequencies.map((frequency) => (
          <BottomSheetOption
            key={frequency.value}
            label={frequency.label}
            selected={recurrenceFrequency === frequency.value}
            onPress={() => {
              onSelectFrequency(frequency.value);
              setFrequencySheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </>
  );
}
