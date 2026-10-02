import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {CategoryBudgetSetup} from './CategoryBudgetSetupFrame';
import {AddEditBudgetCard} from './AddEditBudgetCard';
import {BudgetToggle} from './BudgetSetupControls';
import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';

interface BudgetSetupCategorySectionProps {
  screen: UseBudgetSetupScreenResult;
}

export function BudgetSetupCategorySection({screen}: BudgetSetupCategorySectionProps) {
  return (
    <AddEditBudgetCard
      title="Category-Based Budgeting"
      subtitle="Allocate your flexible spending to specific categories."
      icon="apps"
      accentColor="#F59E0B"
      rightElement={
        <BudgetToggle
          enabled={screen.enableCategoryBudgets}
          onChange={screen.setEnableCategoryBudgets}
          accessibilityLabel="Category-based budgeting"
        />
      }>
      {screen.enableCategoryBudgets ? (
        <VStack paddingTop="$2">
          <CategoryBudgetSetup
            totalBudget={screen.totals.expensesAmount}
            categories={screen.categories}
            allocations={screen.categoryAllocations}
            onAllocationsChange={screen.setCategoryAllocations}
            currencySymbol={screen.currencySymbol}
          />
        </VStack>
      ) : null}
    </AddEditBudgetCard>
  );
}
