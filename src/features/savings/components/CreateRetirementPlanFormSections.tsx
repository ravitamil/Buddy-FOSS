import React from 'react';
import {useTheme, YStack} from 'tamagui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {DeleteRetirementPlanButton} from './createRetirementPlan/CreateRetirementPlanActions';
import {FireNumberLiveCard} from './createRetirementPlan/CreateRetirementPlanPrimitives';
import {
  HealthcareSection,
  IncomeSourcesSection,
  InvestmentDetailsSection,
  PersonalDetailsSection,
} from './createRetirementPlan/CreateRetirementPlanDetailSections';
import {RetirementGoalSummaryCard} from './createRetirementPlan/CreateRetirementPlanGoalSummary';
import {
  RiskProfileSection,
  RiskProfileSheet,
} from './createRetirementPlan/CreateRetirementPlanRiskProfile';
import type {CreateRetirementPlanFormSectionsProps} from './createRetirementPlan/createRetirementPlanTypes';

export const CreateRetirementPlanFormSections = ({
  currencySymbol,
  errors,
  fireMilestones,
  fireNumber = 0,
  formData,
  formatCurrency,
  goal,
  handleDeleteRetirementGoal,
  setShowRiskProfileSheet,
  showRiskProfileSheet,
  updateField,
}: CreateRetirementPlanFormSectionsProps) => {
  const theme = useTheme();
  const {isDarkMode} = useTamaguiTheme();
  const themeColor = String(theme.color?.val ?? '');

  return (
    <>
      <YStack flex={1} padding="$4" gap="$4" paddingBottom="$8">
        {goal ? <RetirementGoalSummaryCard goal={goal} formatCurrency={formatCurrency} /> : null}

        <FireNumberLiveCard
          annualExpenses={parseFloat(formData.currentAnnualExpenses) || 0}
          fireNumber={fireNumber}
          formatCurrency={formatCurrency}
          safeMonthlyWithdrawal={fireMilestones?.safeMonthlyWithdrawal || 0}
        />

        <YStack gap="$3">
          <PersonalDetailsSection
            currencySymbol={currencySymbol}
            errors={errors}
            formData={formData}
            updateField={updateField}
          />
          <InvestmentDetailsSection
            currencySymbol={currencySymbol}
            errors={errors}
            formData={formData}
            updateField={updateField}
          />
          <IncomeSourcesSection
            currencySymbol={currencySymbol}
            errors={errors}
            formData={formData}
            updateField={updateField}
          />
          <HealthcareSection errors={errors} formData={formData} updateField={updateField} />
          <RiskProfileSection
            formData={formData}
            isDarkMode={isDarkMode}
            setShowRiskProfileSheet={setShowRiskProfileSheet}
            themeColor={themeColor}
          />
        </YStack>

        {goal ? (
          <DeleteRetirementPlanButton
            isDarkMode={isDarkMode}
            onPress={handleDeleteRetirementGoal}
          />
        ) : null}
      </YStack>

      <RiskProfileSheet
        currentRiskTolerance={formData.riskTolerance}
        isDarkMode={isDarkMode}
        onOpenChange={setShowRiskProfileSheet}
        open={showRiskProfileSheet}
        updateField={updateField}
      />
    </>
  );
};
