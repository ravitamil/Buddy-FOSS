import {Skeleton} from '@ravitamil/buddy-ui';
import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {BudgetPlanningCard} from '@/features/budgets/components/BudgetPlanningCard';
import type {HomeScreenModel} from '../types';
import {FinancialPlanningQuickActionsCard} from './FinancialPlanningQuickActionsCard';

interface HomeBudgetSectionProps {
  isLoading: boolean;
  budgetData: HomeScreenModel['budgetData'];
  formatCurrency: HomeScreenModel['formatCurrency'];
  onEditBudget: () => void;
  onViewDetails: () => void;
  onSetupBudget: () => void;
  onDebtPayoffPress: () => void;
  onRetirementPress: () => void;
  onNetWorthPress: () => void;
}

export const HomeBudgetSection = ({
  isLoading,
  budgetData,
  formatCurrency,
  onEditBudget,
  onViewDetails,
  onSetupBudget,
  onDebtPayoffPress,
  onRetirementPress,
  onNetWorthPress,
}: HomeBudgetSectionProps) => (
  <VStack gap="$3" marginTop="$1">
    <Skeleton visible={isLoading} height={268} borderRadius={20}>
      <BudgetPlanningCard
        budgetData={budgetData}
        formatCurrency={formatCurrency}
        onEditBudget={onEditBudget}
        onViewDetails={onViewDetails}
        onSetupBudget={onSetupBudget}
      />
    </Skeleton>

    <Skeleton visible={isLoading} height={120} borderRadius={20}>
      <FinancialPlanningQuickActionsCard
        onDebtPayoffPress={onDebtPayoffPress}
        onRetirementPress={onRetirementPress}
        onNetWorthPress={onNetWorthPress}
      />
    </Skeleton>
  </VStack>
);
