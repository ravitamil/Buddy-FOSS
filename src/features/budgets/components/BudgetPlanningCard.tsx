import React from 'react';
import {BudgetOverview} from './budgetPlanning/BudgetOverview';
import {BudgetZeroState} from './budgetPlanning/BudgetZeroState';
import type {BudgetPlanningCardProps} from './budgetPlanning/budgetPlanningTypes';

export type {BudgetData, BudgetPlanningCardProps} from './budgetPlanning/budgetPlanningTypes';

export function BudgetPlanningCard({
  budgetData,
  formatCurrency,
  onViewDetails,
  onSetupBudget,
}: BudgetPlanningCardProps) {
  if (!budgetData.monthlyIncome || budgetData.monthlyIncome === 0) {
    return <BudgetZeroState onSetupBudget={onSetupBudget} />;
  }

  return (
    <BudgetOverview
      budgetData={budgetData}
      formatCurrency={formatCurrency}
      onViewDetails={onViewDetails}
    />
  );
}

export default BudgetPlanningCard;
