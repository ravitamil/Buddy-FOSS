import {Button, Input, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, useTheme} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {LoanFormData} from '@/types/loan.types';
import {formatLoanDateForDisplay, type LoanDateField} from '../../types/addEditLoanForm';
import type {UseAddEditLoanScreenResult} from '../../hooks/useAddEditLoanScreen';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const SECTION_COLORS = {
  interest: '#F59E0B',
  payoff: '#4ECDC4',
  lender: '#10B981',
} as const;

export const Field = ({label, required, error, children}: FormFieldProps) => (
  <YStack gap="$2">
    <Text variant="body1" color="$color">
      {label}
      {required ? ' *' : ''}
    </Text>
    {children}
    {error ? (
      <Text color="$red5" fontSize="$2" marginTop="$1">
        {error}
      </Text>
    ) : null}
  </YStack>
);

export const SectionTitle = ({
  icon,
  title,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  color: string;
}) => (
  <XStack alignItems="center" gap="$2">
    <Ionicons name={icon} size={24} color={color} />
    <Text variant="h5" color={color} weight="bold">
      {title}
    </Text>
  </XStack>
);

export const SelectButton = ({
  children,
  onPress,
  hasError,
}: {
  children: React.ReactNode;
  onPress: () => void;
  hasError?: boolean;
}) => {
  const theme = useTheme();
  const {isDarkMode} = useTamaguiTheme();
  const iconColor = typeof theme.color?.val === 'string' ? theme.color.val : undefined;

  return (
    <Button
      onPress={onPress}
      backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
      borderColor={hasError ? '#F44336' : isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
      borderWidth={1}
      borderRadius="$3"
      justifyContent="flex-start"
      paddingHorizontal="$3"
      height="$4">
      <XStack justifyContent="space-between" alignItems="center" flex={1}>
        {children}
        <Ionicons name="chevron-down" size={20} color={iconColor} />
      </XStack>
    </Button>
  );
};

export const NumericInput = ({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  error?: string;
}) => (
  <Input
    value={(value ?? 0).toString()}
    onChangeText={(text: string) => onChange(Number.parseFloat(text) || 0)}
    placeholder={placeholder}
    keyboardType="numeric"
    error={error}
  />
);

export const LoanDateFieldButton = ({
  label,
  field,
  fallback,
  required,
  screen,
}: {
  label: string;
  field: LoanDateField;
  fallback: string;
  required?: boolean;
  screen: UseAddEditLoanScreenResult;
}) => {
  const theme = useTheme();
  const error = screen.renderErrorText(field);
  const iconColor = typeof theme.color?.val === 'string' ? theme.color.val : undefined;

  return (
    <Field label={label} required={required} error={error}>
      <SelectButton onPress={() => screen.openDatePicker(field)} hasError={Boolean(error)}>
        <XStack alignItems="center" gap="$2">
          <Ionicons name="calendar" size={20} color={iconColor} />
          <Text variant="body1" color={screen.formData[field] ? '$color' : '$textSecondary'}>
            {selectDateLabel(screen.formData, field, fallback)}
          </Text>
        </XStack>
      </SelectButton>
    </Field>
  );
};

export {
  getInterestTypeLabel,
  getLenderTypeLabel,
  getPayoffStrategyLabel,
} from './addEditLoanLabels';

const selectDateLabel = (formData: LoanFormData, field: LoanDateField, fallback: string) => {
  const value = formData[field];
  return value ? formatLoanDateForDisplay(value) : fallback;
};
