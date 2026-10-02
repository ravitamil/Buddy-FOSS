import {Input, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import type {
  RetirementPlanFormData,
  RetirementRiskTolerance,
} from '@/features/savings/hooks/useCreateRetirementPlanScreen';
import type {RetirementPlanUpdateField} from './createRetirementPlanTypes';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const SectionHeader = ({
  color,
  icon,
  title,
}: {
  color: string;
  icon: IoniconName;
  title: string;
}) => (
  <XStack alignItems="center" gap="$2">
    <Ionicons name={icon} size={24} color={color} />
    <Text variant="h5" color={color} weight="bold">
      {title}
    </Text>
  </XStack>
);

export const RetirementInputField = ({
  errors,
  field,
  keyboardType = 'default',
  label,
  placeholder,
  prefix,
  required = false,
  suffix,
  updateField,
  value,
}: {
  errors: Record<string, string>;
  field: keyof RetirementPlanFormData;
  keyboardType?: 'default' | 'numeric';
  label: string;
  placeholder: string;
  prefix?: string;
  required?: boolean;
  suffix?: string;
  updateField: RetirementPlanUpdateField;
  value: string;
}) => (
  <YStack gap="$2" marginBottom="$3">
    <Text variant="body1" color="$color" weight="semibold">
      {label} {required ? <Text color="$red5">*</Text> : null}
    </Text>
    <YStack position="relative">
      {prefix ? (
        <Text
          variant="body2"
          color="$textSecondary"
          position="absolute"
          left={12}
          top={16}
          zIndex={1}>
          {prefix}
        </Text>
      ) : null}
      <Input
        value={value}
        onChangeText={(text: string) => updateField(field, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        error={errors[field]}
        style={{
          paddingLeft: prefix ? 24 : undefined,
          paddingRight: suffix ? 24 : undefined,
        }}
      />
      {suffix ? (
        <Text
          variant="body2"
          color="$textSecondary"
          position="absolute"
          right={12}
          top={16}
          zIndex={1}>
          {suffix}
        </Text>
      ) : null}
    </YStack>
    {errors[field] ? (
      <Text color="$red5" fontSize="$2" marginTop="$1">
        {errors[field]}
      </Text>
    ) : null}
  </YStack>
);

export const FireNumberLiveCard = ({
  annualExpenses,
  fireNumber,
  formatCurrency,
  safeMonthlyWithdrawal,
}: {
  annualExpenses: number;
  fireNumber: number;
  formatCurrency: (val: number) => string;
  safeMonthlyWithdrawal: number;
}) => (
  <YStack marginBottom="$2">
    <XStack
      padding="$3.5"
      borderRadius="$4"
      backgroundColor="$orange3"
      borderWidth={1}
      borderColor="$orange6"
      justifyContent="space-between"
      alignItems="center">
      <YStack gap="$1" flex={1}>
        <XStack alignItems="center" gap="$2">
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text variant="caption" color="#F59E0B" weight="bold">
            YOUR FIRE TARGET (25x Rule)
          </Text>
        </XStack>
        <Text variant="h3" color="$color" weight="bold">
          {fireNumber > 0 ? formatCurrency(fireNumber) : formatCurrency(1000000)}
        </Text>
        <Text variant="caption" color="$textSecondary">
          Generates{' '}
          <Text color="$green10" weight="bold">
            {fireNumber > 0 ? formatCurrency(safeMonthlyWithdrawal) : formatCurrency(3333)}
            /mo
          </Text>{' '}
          passive income at 4% safe withdrawal
        </Text>
        {annualExpenses <= 0 && (
          <Text variant="caption" color="$textSecondary" fontStyle="italic" marginTop="$0.5">
            Default estimate shown. Enter expenses below for personalized target.
          </Text>
        )}
      </YStack>
    </XStack>
  </YStack>
);

export const formatRiskTolerance = (riskTolerance: RetirementRiskTolerance) =>
  riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1);
