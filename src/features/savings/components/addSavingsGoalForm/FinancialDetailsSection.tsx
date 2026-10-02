import {Input, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {XStack, YStack} from 'tamagui';

import {FieldError, FieldLabel, PickerButton, SectionHeader} from './SavingsGoalFormPrimitives';
import type {AddSavingsGoalFormSectionsProps} from './types';

interface FinancialDetailsSectionProps extends Pick<
  AddSavingsGoalFormSectionsProps,
  | 'errors'
  | 'formData'
  | 'handleDeadlineChange'
  | 'setShowDatePicker'
  | 'showDatePicker'
  | 'updateField'
> {
  isDarkMode: boolean;
  themeColor: string;
}

export const FinancialDetailsSection = ({
  errors,
  formData,
  handleDeadlineChange,
  isDarkMode,
  setShowDatePicker,
  showDatePicker,
  themeColor,
  updateField,
}: FinancialDetailsSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader
        icon="wallet"
        color="$green10"
        title="Financial Details"
        description="Amounts and timeline for your goal"
      />
      <YStack gap="$4" marginTop="$3">
        <FieldError label="Target Amount *" error={errors.targetAmount}>
          <Input
            placeholder="0.00"
            value={formData.targetAmount}
            onChangeText={(text) => updateField('targetAmount', text)}
            keyboardType="numeric"
            error={errors.targetAmount}
          />
        </FieldError>
        <YStack gap="$2">
          <FieldLabel>Current Amount (Optional)</FieldLabel>
          <Input
            placeholder="0.00"
            value={formData.currentAmount}
            onChangeText={(text) => updateField('currentAmount', text)}
            keyboardType="numeric"
          />
        </YStack>
        <FieldError label="Target Date *" error={errors.deadline}>
          <PickerButton
            onPress={() => setShowDatePicker(true)}
            isDarkMode={isDarkMode}
            borderColor={errors.deadline ? '$red10' : undefined}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name="calendar" size={20} color={themeColor} />
              <Text variant="body1" color={formData.deadline ? '$color' : '$textSecondary'}>
                {formData.deadline ? formData.deadline.toLocaleDateString() : 'Select target date'}
              </Text>
            </XStack>
          </PickerButton>
          {showDatePicker ? (
            <DateTimePicker
              value={formData.deadline}
              mode="date"
              display="default"
              onChange={handleDeadlineChange}
              minimumDate={new Date()}
            />
          ) : null}
        </FieldError>
      </YStack>
    </YStack>
  </GlassSurface>
);
