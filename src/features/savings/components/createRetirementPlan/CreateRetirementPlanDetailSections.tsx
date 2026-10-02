import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';

import type {RetirementFormSectionProps} from './createRetirementPlanTypes';
import {RetirementInputField, SectionHeader} from './CreateRetirementPlanPrimitives';

export const PersonalDetailsSection = ({
  currencySymbol,
  errors,
  formData,
  updateField,
}: RetirementFormSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader color="#8B5CF6" icon="person" title="FIRE & Personal Details" />
      <RetirementInputField
        label="Plan Name"
        value={formData.planName}
        field="planName"
        placeholder="Financial Independence (FIRE)"
        required
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Current Age"
        value={formData.currentAge}
        field="currentAge"
        placeholder="30"
        keyboardType="numeric"
        required
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Target FIRE / Retirement Age"
        value={formData.retirementAge}
        field="retirementAge"
        placeholder="55"
        keyboardType="numeric"
        required
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Life Expectancy"
        value={formData.lifeExpectancy}
        field="lifeExpectancy"
        placeholder="85"
        keyboardType="numeric"
        required
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Current Annual Expenses"
        value={formData.currentAnnualExpenses}
        field="currentAnnualExpenses"
        placeholder="50000"
        keyboardType="numeric"
        prefix={currencySymbol}
        required
        errors={errors}
        updateField={updateField}
      />
    </YStack>
  </GlassSurface>
);

export const InvestmentDetailsSection = ({
  currencySymbol,
  errors,
  formData,
  updateField,
}: RetirementFormSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader color="#10B981" icon="trending-up" title="Investment & Portfolio Details" />
      <RetirementInputField
        label="Current Investment / Savings"
        value={formData.currentSavings}
        field="currentSavings"
        placeholder="0"
        keyboardType="numeric"
        prefix={currencySymbol}
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Monthly Contribution"
        value={formData.monthlyContribution}
        field="monthlyContribution"
        placeholder="500"
        keyboardType="numeric"
        prefix={currencySymbol}
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Expected Return Rate"
        value={formData.expectedReturnRate}
        field="expectedReturnRate"
        placeholder="7"
        keyboardType="numeric"
        suffix="%"
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Inflation Rate"
        value={formData.inflationRate}
        field="inflationRate"
        placeholder="3"
        keyboardType="numeric"
        suffix="%"
        errors={errors}
        updateField={updateField}
      />
    </YStack>
  </GlassSurface>
);

export const IncomeSourcesSection = ({
  currencySymbol,
  errors,
  formData,
  updateField,
}: RetirementFormSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader color="#F59E0B" icon="card" title="Income Sources" />
      <RetirementInputField
        label="Social Security Estimate"
        value={formData.socialSecurityEstimate}
        field="socialSecurityEstimate"
        placeholder="2000"
        keyboardType="numeric"
        prefix={currencySymbol}
        suffix="/month"
        errors={errors}
        updateField={updateField}
      />
      <RetirementInputField
        label="Pension Estimate"
        value={formData.pensionEstimate}
        field="pensionEstimate"
        placeholder="0"
        keyboardType="numeric"
        prefix={currencySymbol}
        suffix="/month"
        errors={errors}
        updateField={updateField}
      />
    </YStack>
  </GlassSurface>
);

export const HealthcareSection = ({
  errors,
  formData,
  updateField,
}: Omit<RetirementFormSectionProps, 'currencySymbol'>) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader color="#EF4444" icon="medical" title="Healthcare" />
      <RetirementInputField
        label="Healthcare Costs Estimate"
        value={formData.healthcareCostsEstimate}
        field="healthcareCostsEstimate"
        placeholder="5"
        keyboardType="numeric"
        suffix="% of income"
        errors={errors}
        updateField={updateField}
      />
    </YStack>
  </GlassSurface>
);
