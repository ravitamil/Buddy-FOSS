import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {
  AllocationsCard,
  BudgetSummaryCard,
  CustomSplitsCard,
  PlanInformationCard,
  SavingsGoalAllocationsCard,
} from './BudgetSetupBasicSection';
import {BudgetSetupCategorySection} from './BudgetSetupCategorySection';
import {BudgetSetupIncomeSection} from './BudgetSetupIncomeSection';
import {BudgetSetupRecurringSection} from './BudgetSetupRecurringSection';
import type {BudgetSetupStep, UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';

interface BudgetSetupSectionsProps {
  screen: UseBudgetSetupScreenResult;
  step?: BudgetSetupStep;
}

export function BudgetSetupSections({screen, step}: BudgetSetupSectionsProps) {
  const activeStep = step ?? screen.currentStep;

  if (activeStep === 0) {
    return (
      <VStack gap="$4">
        <PlanInformationCard screen={screen} />
        <BudgetSetupIncomeSection screen={screen} />
        <BudgetSetupRecurringSection screen={screen} />
      </VStack>
    );
  }

  if (activeStep === 1) {
    return (
      <VStack gap="$4">
        <AllocationsCard screen={screen} />
        <SavingsGoalAllocationsCard screen={screen} />
        <CustomSplitsCard screen={screen} />
      </VStack>
    );
  }

  return (
    <VStack gap="$4">
      <BudgetSetupCategorySection screen={screen} />
      <BudgetSummaryCard screen={screen} />
    </VStack>
  );
}
