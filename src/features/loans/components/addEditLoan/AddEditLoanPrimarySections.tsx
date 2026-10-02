import {Input, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {AddEditLoanCard} from '../AddEditLoanCard';
import {LOAN_TYPE_CONFIG} from '../../types/addEditLoanForm';
import type {UseAddEditLoanScreenResult} from '../../hooks/useAddEditLoanScreen';
import {
  Field,
  LoanDateFieldButton,
  NumericInput,
  SECTION_COLORS,
  SelectButton,
  getInterestTypeLabel,
  getLenderTypeLabel,
  getPayoffStrategyLabel,
} from './AddEditLoanFormPrimitives';

export const AddEditLoanBasicInfoSection = ({screen}: {screen: UseAddEditLoanScreenResult}) => {
  const formData = screen.formData;
  const selectedLoanType = formData.loanType ?? 'PERSONAL';
  const selectedConfig = LOAN_TYPE_CONFIG[selectedLoanType];

  return (
    <AddEditLoanCard
      title="Basic Information"
      subtitle="Name and identify this loan"
      accentColor={selectedConfig.color}
      icon={selectedConfig.icon}>
      <YStack gap="$3">
        <Field label="Loan Name" required error={screen.renderErrorText('name')}>
          <Input
            value={formData.name ?? ''}
            onChangeText={(text: string) => screen.updateFormData('name', text)}
            placeholder="Enter a descriptive name for your loan"
            error={screen.renderErrorText('name')}
          />
        </Field>
        <Field label="Loan Type">
          <SelectButton onPress={() => screen.setShowLoanTypeSheet(true)}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name={selectedConfig.icon} size={20} color={selectedConfig.color} />
              <Text variant="body1" color="$color">
                {selectedConfig.displayName}
              </Text>
            </XStack>
          </SelectButton>
        </Field>
        <Field label="Principal Amount" required error={screen.renderErrorText('principalAmount')}>
          <NumericInput
            value={formData.principalAmount}
            onChange={(value) => screen.updateFormData('principalAmount', value)}
            placeholder="Enter the principal loan amount"
            error={screen.renderErrorText('principalAmount')}
          />
        </Field>
      </YStack>
    </AddEditLoanCard>
  );
};

export const AddEditLoanInterestSection = ({screen}: {screen: UseAddEditLoanScreenResult}) => {
  const formData = screen.formData;

  return (
    <AddEditLoanCard
      title="Interest & Tenure"
      subtitle="Set the repayment terms"
      accentColor={SECTION_COLORS.interest}
      icon="trending-up">
      <YStack gap="$3">
        <Field label="Interest Rate (% per annum)" error={screen.renderErrorText('interestRate')}>
          <NumericInput
            value={formData.interestRate}
            onChange={(value) => screen.updateFormData('interestRate', value)}
            placeholder="Enter annual interest rate (optional)"
            error={screen.renderErrorText('interestRate')}
          />
        </Field>
        <Field label="Tenure (months)" required error={screen.renderErrorText('tenure')}>
          <NumericInput
            value={formData.tenure}
            onChange={(value) => screen.updateFormData('tenure', Math.trunc(value))}
            placeholder="Enter loan tenure in months"
            error={screen.renderErrorText('tenure')}
          />
        </Field>
        <Field
          label={`EMI Amount (${screen.currency})`}
          required
          error={screen.renderErrorText('emiAmount')}>
          <NumericInput
            value={formData.emiAmount}
            onChange={(value) => screen.updateFormData('emiAmount', value)}
            placeholder="Enter monthly EMI amount"
            error={screen.renderErrorText('emiAmount')}
          />
        </Field>
        <LoanDateFieldButton
          label="Sanction Date"
          field="sanctionDate"
          fallback="Select sanction date"
          screen={screen}
        />
        <LoanDateFieldButton
          label="Disbursement Date"
          field="disbursementDate"
          fallback="Select disbursement date"
          screen={screen}
        />
        <LoanDateFieldButton
          label="First EMI Date"
          field="firstEmiDate"
          fallback="Select first EMI date"
          required
          screen={screen}
        />
      </YStack>
    </AddEditLoanCard>
  );
};

export const AddEditLoanPayoffSection = ({screen}: {screen: UseAddEditLoanScreenResult}) => {
  const formData = screen.formData;

  return (
    <AddEditLoanCard
      title="Debt Payoff"
      subtitle="Choose how to clear this balance"
      accentColor={SECTION_COLORS.payoff}
      icon="trending-down">
      <YStack gap="$3">
        <Field label="Payoff Strategy">
          <SelectButton onPress={() => screen.setShowPayoffStrategySheet(true)}>
            <Text variant="body1" color="$color">
              {getPayoffStrategyLabel(formData.payoffStrategy)}
            </Text>
          </SelectButton>
        </Field>
        <Field label="Extra Payment (per cycle)">
          <NumericInput
            value={formData.extraPaymentAllocation}
            onChange={(value) => screen.updateFormData('extraPaymentAllocation', value)}
            placeholder="Enter extra payment amount"
          />
        </Field>
        {formData.payoffStrategy === 'custom' ? (
          <Field label="Custom Order Priority (optional)">
            <Input
              keyboardType="numeric"
              value={
                formData.customPayoffOrder !== undefined ? String(formData.customPayoffOrder) : ''
              }
              onChangeText={(text: string) => {
                const value = Number.parseInt(text, 10);
                screen.updateFormData('customPayoffOrder', Number.isNaN(value) ? undefined : value);
              }}
              placeholder="Set this loan's priority order"
            />
          </Field>
        ) : null}
      </YStack>
    </AddEditLoanCard>
  );
};

export const AddEditLoanLenderSection = ({screen}: {screen: UseAddEditLoanScreenResult}) => {
  const formData = screen.formData;

  return (
    <AddEditLoanCard
      title="Lender Information"
      subtitle="Keep your lender and account details together"
      accentColor={SECTION_COLORS.lender}
      icon="business">
      <YStack gap="$3">
        <Field label="Lender Name" required error={screen.renderErrorText('lenderName')}>
          <Input
            value={formData.lenderName ?? ''}
            onChangeText={(text: string) => screen.updateFormData('lenderName', text)}
            placeholder="Enter lender name (e.g., ABC Bank)"
            error={screen.renderErrorText('lenderName')}
          />
        </Field>
        <Field label="Lender Type">
          <SelectButton onPress={() => screen.setShowLenderTypeSheet(true)}>
            <Text variant="body1" color="$color">
              {getLenderTypeLabel(formData.lenderType)}
            </Text>
          </SelectButton>
        </Field>
        <Field label="Borrower Name">
          <Input
            value={formData.borrowerName ?? ''}
            onChangeText={(text: string) => screen.updateFormData('borrowerName', text)}
            placeholder="Enter your full name as borrower"
          />
        </Field>
        <Field label="Loan Account Number">
          <Input
            value={formData.loanAccountNumber ?? ''}
            onChangeText={(text: string) => screen.updateFormData('loanAccountNumber', text)}
            placeholder="Enter loan account number (optional)"
          />
        </Field>
        <Field label="Interest Type">
          <SelectButton onPress={() => screen.setShowInterestTypeSheet(true)}>
            <Text variant="body1" color="$color">
              {getInterestTypeLabel(formData.interestType)}
            </Text>
          </SelectButton>
        </Field>
      </YStack>
    </AddEditLoanCard>
  );
};
