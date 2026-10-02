import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {RecurrenceFrequency} from '@/types';
import type {
  AddSavingsGoalFormData,
  SavingsCategoryOption,
} from '@/features/savings/hooks/useAddSavingsGoalScreen';

export type SavingsGoalIoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface AddSavingsGoalFormSectionsProps {
  currentCategory: SavingsCategoryOption;
  errors: Record<string, string>;
  formData: AddSavingsGoalFormData;
  handleCategorySelect: (category: SavingsCategoryOption) => void;
  handleDeadlineChange: React.ComponentProps<typeof DateTimePicker>['onChange'];
  handleFrequencySelect: (frequency: RecurrenceFrequency) => void;
  handleRecurrenceEndDateChange: React.ComponentProps<typeof DateTimePicker>['onChange'];
  handleRecurringChange: (value: boolean) => void;
  setShowCategorySheet: (open: boolean) => void;
  setShowDatePicker: (open: boolean) => void;
  setShowFrequencySheet: (open: boolean) => void;
  setShowRecurrenceEndDatePicker: (open: boolean) => void;
  showCategorySheet: boolean;
  showDatePicker: boolean;
  showFrequencySheet: boolean;
  showRecurrenceEndDatePicker: boolean;
  updateField: <Field extends keyof AddSavingsGoalFormData>(
    field: Field,
    value: AddSavingsGoalFormData[Field],
  ) => void;
}

export type SavingsGoalSectionBaseProps = Pick<
  AddSavingsGoalFormSectionsProps,
  'errors' | 'formData' | 'updateField'
> & {
  isDarkMode: boolean;
  themeColor: string;
};
