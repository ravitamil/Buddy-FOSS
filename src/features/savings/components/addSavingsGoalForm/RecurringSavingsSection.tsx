import {Input, Text, ToggleField} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {RECURRENCE_FREQUENCIES} from '@/features/savings/hooks/useAddSavingsGoalScreen';
import {FieldLabel, PickerButton, SectionHeader} from './SavingsGoalFormPrimitives';
import type {AddSavingsGoalFormSectionsProps} from './types';

interface RecurringSavingsSectionProps extends Pick<
  AddSavingsGoalFormSectionsProps,
  | 'formData'
  | 'handleRecurrenceEndDateChange'
  | 'handleRecurringChange'
  | 'setShowFrequencySheet'
  | 'setShowRecurrenceEndDatePicker'
  | 'showRecurrenceEndDatePicker'
  | 'updateField'
> {
  isDarkMode: boolean;
  themeColor: string;
}

export const RecurringSavingsSection = ({
  formData,
  handleRecurrenceEndDateChange,
  handleRecurringChange,
  isDarkMode,
  setShowFrequencySheet,
  setShowRecurrenceEndDatePicker,
  showRecurrenceEndDatePicker,
  themeColor,
  updateField,
}: RecurringSavingsSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader
        icon="repeat"
        color="#F59E0B"
        title="Recurring Savings"
        description="Automatically save towards your goal"
      />
      <YStack gap="$4" marginTop="$3">
        <ToggleField
          checked={formData.isRecurring}
          onCheckedChange={handleRecurringChange}
          title="Enable Automatic Savings"
        />
        <Text variant="caption" color="$color11">
          Automatically add funds to this savings goal on a regular basis
        </Text>
        {formData.isRecurring ? (
          <YStack gap="$4">
            <YStack gap="$2">
              <FieldLabel>Amount per {formData.recurrenceFrequency}</FieldLabel>
              <Input
                placeholder="0.00"
                value={formData.intendedAmount}
                onChangeText={(text) => updateField('intendedAmount', text)}
                keyboardType="numeric"
              />
            </YStack>
            <YStack gap="$2">
              <FieldLabel>Frequency</FieldLabel>
              <PickerButton onPress={() => setShowFrequencySheet(true)} isDarkMode={isDarkMode}>
                <XStack justifyContent="space-between" alignItems="center" flex={1}>
                  <Text variant="body1" color="$color">
                    {RECURRENCE_FREQUENCIES.find(
                      (frequency) => frequency.value === formData.recurrenceFrequency,
                    )?.label || 'Monthly'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={themeColor} />
                </XStack>
              </PickerButton>
            </YStack>
            <YStack gap="$2">
              <FieldLabel>End Date (Optional)</FieldLabel>
              <PickerButton
                onPress={() => setShowRecurrenceEndDatePicker(true)}
                isDarkMode={isDarkMode}>
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="calendar" size={20} color={themeColor} />
                  <Text
                    variant="body1"
                    color={formData.recurrenceEndDate ? '$color' : '$textSecondary'}>
                    {formData.recurrenceEndDate
                      ? formData.recurrenceEndDate.toLocaleDateString()
                      : 'No end date'}
                  </Text>
                </XStack>
              </PickerButton>
              {showRecurrenceEndDatePicker ? (
                <DateTimePicker
                  value={formData.recurrenceEndDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleRecurrenceEndDateChange}
                  minimumDate={new Date()}
                  maximumDate={formData.deadline}
                />
              ) : null}
            </YStack>
          </YStack>
        ) : null}
      </YStack>
    </YStack>
  </GlassSurface>
);
