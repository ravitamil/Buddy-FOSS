import {Input, SelectField, Text, ToggleField} from '@ravitamil/buddy-ui';
import React from 'react';
import {Separator, XStack, YStack} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {AddEditLoanCard} from './AddEditLoanCard';
import type {UseAddEditLoanScreenResult} from '../hooks/useAddEditLoanScreen';

interface SupportSectionProps {
  screen: UseAddEditLoanScreenResult;
}

const SUPPORT_SECTION_COLORS = {
  calculated: '#8B5CF6',
  charges: '#EF4444',
  reminders: '#06B6D4',
} as const;

const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <YStack gap="$2">
    <Text variant="body1" color="$color">
      {label}
    </Text>
    {children}
  </YStack>
);

const NumericInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder: string;
}) => (
  <Input
    value={(value ?? 0).toString()}
    onChangeText={(text: string) => onChange(Number.parseFloat(text) || 0)}
    placeholder={placeholder}
    keyboardType="numeric"
  />
);

export const AddEditLoanCalculatedValuesSection = ({screen}: SupportSectionProps) => {
  const formData = screen.formData;

  return (
    <AddEditLoanCard
      title="Calculated Values"
      subtitle="A live view of your repayment totals"
      accentColor={SUPPORT_SECTION_COLORS.calculated}
      icon="calculator">
      <YStack gap="$3">
        <YStack gap="$3">
          <AmountRow
            label="Monthly EMI"
            value={screen.formatCurrency(formData.emiAmount ?? 0)}
            highlight
          />
          <AmountRow
            label="Total Amount Payable"
            value={screen.formatCurrency(formData.totalAmount ?? 0)}
          />
          <AmountRow
            label="Total Interest"
            value={screen.formatCurrency(formData.totalInterest ?? 0)}
          />
          <Separator marginVertical="$2" />
          <AmountRow
            label="Interest Rate"
            value={`${formData.interestRate ?? 0}% per annum`}
            muted
          />
          <AmountRow
            label="Loan Tenure"
            value={`${formData.tenure ?? 0} months (${Math.round(((formData.tenure ?? 0) / 12) * 10) / 10} years)`}
            muted
          />
        </YStack>
      </YStack>
    </AddEditLoanCard>
  );
};

const AmountRow = ({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) => (
  <XStack justifyContent="space-between" alignItems="center">
    <Text variant={muted ? 'body2' : 'body1'} color={muted ? '$textSecondary' : '$color'}>
      {label}
    </Text>
    <Text
      variant={highlight ? 'h6' : muted ? 'body2' : 'body1'}
      color={highlight ? SUPPORT_SECTION_COLORS.calculated : muted ? '$textSecondary' : '$color'}
      weight={muted ? 'normal' : 'bold'}>
      {value}
    </Text>
  </XStack>
);

export const AddEditLoanAdditionalChargesSection = ({screen}: SupportSectionProps) => (
  <AddEditLoanCard
    title="Additional Charges"
    subtitle="Add fees that affect the full cost"
    accentColor={SUPPORT_SECTION_COLORS.charges}
    icon="receipt">
    <YStack gap="$3">
      <Field label={`Processing Fee (${screen.currency})`}>
        <NumericInput
          value={screen.formData.processingFee}
          onChange={(value) => screen.updateFormData('processingFee', value)}
          placeholder="Enter one-time processing fee amount"
        />
      </Field>
      <Field label="Prepayment Charges (%)">
        <NumericInput
          value={screen.formData.prepaymentChargesPercentage}
          onChange={(value) => screen.updateFormData('prepaymentChargesPercentage', value)}
          placeholder="Enter prepayment penalty percentage"
        />
      </Field>
      <Field label="Late Fee (%)">
        <NumericInput
          value={screen.formData.lateFeePercentage}
          onChange={(value) => screen.updateFormData('lateFeePercentage', value)}
          placeholder="Enter late payment penalty percentage"
        />
      </Field>
      <Field label={`Other Charges (${screen.currency})`}>
        <NumericInput
          value={screen.formData.otherCharges}
          onChange={(value) => screen.updateFormData('otherCharges', value)}
          placeholder="Enter any additional charges or fees"
        />
      </Field>
    </YStack>
  </AddEditLoanCard>
);

export function AddEditLoanRemindersSection({screen}: SupportSectionProps) {
  const remindersEnabled = screen.formData.reminderEnabled ?? false;
  const autoTrackEnabled = screen.formData.autoPayEnabled ?? false;

  return (
    <AddEditLoanCard
      title="Reminders & Automation"
      subtitle="Stay ahead of upcoming EMI payments"
      accentColor={SUPPORT_SECTION_COLORS.reminders}
      icon="notifications">
      <YStack gap="$4">
        <ToggleField
          leading={<Ionicons name="notifications" size={20} color="#2196F3" />}
          title="EMI Reminders"
          description="Get notified before your payment is due"
          checked={remindersEnabled}
          tone="primary"
          onCheckedChange={(checked) => screen.updateFormData('reminderEnabled', checked)}
          testID="loan-toggle-emi-reminders"
        />
        {remindersEnabled ? (
          <YStack gap="$2">
            <Text variant="body2" color="$textSecondary" weight="medium">
              Remind me before payment due date
            </Text>
            <SelectField
              onPress={() => screen.setShowReminderSheet(true)}
              label="Reminder timing"
              value={`${screen.formData.reminderDaysBefore} day${
                screen.formData.reminderDaysBefore !== 1 ? 's' : ''
              } before`}
              compact
            />
          </YStack>
        ) : null}
        <ToggleField
          leading={<Ionicons name="card" size={20} color="#4CAF50" />}
          title="Auto-Track"
          description="Automatically track payments when due"
          checked={autoTrackEnabled}
          tone="success"
          onCheckedChange={(checked) => screen.updateFormData('autoPayEnabled', checked)}
          testID="loan-toggle-auto-track"
        />
      </YStack>
    </AddEditLoanCard>
  );
}
