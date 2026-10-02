import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import {BudgetOverview} from './BudgetOverview';
import type {BudgetData} from './budgetPlanningTypes';

describe('BudgetOverview', () => {
  const mockBudgetData: BudgetData = {
    budgetName: 'Household Budget',
    period: 'monthly',
    daysRemaining: 18,
    periodLabel: 'September',
    periodStart: '2026-09-01T00:00:00.000Z',
    periodEndExclusive: '2026-10-01T00:00:00.000Z',
    monthlyIncome: 5000,
    plannedExpenses: 3000,
    plannedSavings: 1000,
    actualSpent: 1200,
    actualIncome: 5000,
    totalSpendingPlan: 3000,
    remainingSpending: 1800,
    utilizationPercentage: 40,
    dailySafeToSpend: 100,
    customSplits: [],
    topBudgetCategories: [],
  };

  it('renders budget name, plan period, metrics, and velocity pill', () => {
    const onViewDetails = jest.fn();
    const {getByText, getByLabelText} = render(
      <BudgetOverview
        budgetData={mockBudgetData}
        formatCurrency={(val) => `$${val}`}
        onViewDetails={onViewDetails}
      />,
    );

    expect(getByText('Your budget')).toBeTruthy();
    expect(getByText('Household Budget')).toBeTruthy();
    expect(getByText('Active • Monthly plan')).toBeTruthy();
    expect(getByText('40% used')).toBeTruthy();
    expect(getByText('$1200')).toBeTruthy();
    expect(getByText('$1800')).toBeTruthy();
    expect(getByText('$100')).toBeTruthy();
    expect(getByText(/18 days/)).toBeTruthy();

    fireEvent.press(getByLabelText('View Household Budget details'));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('handles fallback budget name when not specified', () => {
    const {getByText} = render(
      <BudgetOverview
        budgetData={{...mockBudgetData, budgetName: undefined}}
        formatCurrency={(val) => `$${val}`}
        onViewDetails={jest.fn()}
      />,
    );

    expect(getByText('September Plan')).toBeTruthy();
  });
});
