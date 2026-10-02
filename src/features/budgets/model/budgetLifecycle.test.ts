import type {Budget} from '@/types';

import {getActiveBudget, removeBudgetWithActiveFallback, withActiveBudget} from './budgetLifecycle';

const createPlan = (id: string, isActive = false): Budget => ({
  id,
  name: `Plan ${id}`,
  currencyCode: 'USD',
  monthlyIncome: 5_000,
  plannedExpenses: 2_000,
  plannedSavings: 500,
  customSplits: [],
  period: 'monthly',
  isActive,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
});

describe('budget plan lifecycle', () => {
  it('activates exactly the selected plan', () => {
    const plans = withActiveBudget([createPlan('one', true), createPlan('two')], 'two');

    expect(plans.filter((plan) => plan.isActive).map((plan) => plan.id)).toEqual(['two']);
    expect(getActiveBudget(plans)?.id).toBe('two');
  });

  it('activates a remaining plan when the active plan is deleted', () => {
    const result = removeBudgetWithActiveFallback(
      [createPlan('one', true), createPlan('two'), createPlan('three')],
      'one',
    );

    expect(result.activeBudgetId).toBe('two');
    expect(result.budgets.filter((plan) => plan.isActive).map((plan) => plan.id)).toEqual(['two']);
  });

  it('returns an empty lifecycle state after the final plan is deleted', () => {
    const result = removeBudgetWithActiveFallback([createPlan('only', true)], 'only');

    expect(result).toEqual({budgets: [], activeBudgetId: null});
  });
});
