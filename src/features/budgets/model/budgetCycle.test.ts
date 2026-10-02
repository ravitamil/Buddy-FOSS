import type {Budget, Category, SavingsGoal, Transaction} from '@/types';

import {
  createBudgetCycleModel,
  findCategoryBudgetProgress,
  getBudgetPeriodBounds,
} from './budgetCycle';

const budget: Budget = {
  id: 'budget-1',
  name: 'August plan',
  currencyCode: 'USD',
  monthlyIncome: 5_000,
  plannedExpenses: 2_000,
  plannedSavings: 500,
  customSplits: [
    {id: 'split-1', name: 'Giving', amount: 100, percentage: 2, color: '$colorSubtitle'},
  ],
  period: 'monthly',
  isActive: true,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
  linkedRecurringItems: [
    {
      templateId: 'rent',
      description: 'Rent',
      amount: 800,
      type: 'expense',
      isAutoPopulated: true,
    },
  ],
  categoryAllocations: [
    {categoryId: 'food-id', categoryName: 'Food', amount: 600},
    {categoryId: 'travel-id', categoryName: 'Travel', amount: 300},
  ],
  savingsGoalsAllocation: [{goalId: 'goal-1', allocatedAmount: 500, percentageOfIncome: 10}],
};

const categories: Category[] = [
  {id: 'food-id', name: 'Food', type: 'expense', icon: 'restaurant', color: '$red10'},
  {id: 'travel-id', name: 'Travel', type: 'expense', icon: 'airplane', color: '$blue10'},
];

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    amount: -150,
    category: 'Food',
    categoryId: 'food-id',
    description: 'Groceries',
    date: '2026-08-10T12:00:00.000Z',
    type: 'expense',
  },
  {
    id: 'tx-2',
    amount: -50,
    category: 'travel-id',
    description: 'Bus',
    date: '2026-08-11T12:00:00.000Z',
    type: 'expense',
  },
  {
    id: 'tx-3',
    amount: 4_900,
    category: 'Salary',
    description: 'Salary',
    date: '2026-08-02T12:00:00.000Z',
    type: 'income',
  },
  {
    id: 'group-tx',
    amount: -300,
    category: 'Food',
    categoryId: 'food-id',
    description: 'Shared dinner',
    date: '2026-08-12T12:00:00.000Z',
    type: 'expense',
    groupId: 'group-1',
    splitAmounts: {'user-1': 100, 'user-2': 200},
  },
  {
    id: 'tx-old',
    amount: -999,
    category: 'Food',
    description: 'Previous month',
    date: '2026-07-31T12:00:00.000Z',
    type: 'expense',
  },
  {
    id: 'settlement',
    amount: -500,
    category: 'Travel',
    description: 'Group settlement',
    date: '2026-08-13T12:00:00.000Z',
    type: 'expense',
    groupId: 'group-1',
    isSettlement: true,
  },
];

const savingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency fund',
    targetAmount: 10_000,
    currentAmount: 2_500,
    deadline: new Date('2027-08-01T00:00:00.000Z'),
  },
];

describe('budget cycle model', () => {
  it('separates the saved plan from live actuals and commitments', () => {
    const model = createBudgetCycleModel({
      budget,
      transactions,
      categories,
      loans: [
        {status: 'ACTIVE', emiAmount: 400},
        {status: 'CLOSED', emiAmount: 900},
      ],
      subscriptions: [
        {status: 'active', amount: 120, billingCycle: 'yearly'},
        {status: 'paused', amount: 30, billingCycle: 'monthly'},
      ],
      savingsGoals,
      referenceDate: new Date('2026-08-15T10:00:00.000Z'),
      userId: 'user-1',
    });

    expect(model.actualSpent).toBe(300);
    expect(model.actualIncome).toBe(4_900);
    expect(model.committedLoans).toBe(400);
    expect(model.committedSubscriptions).toBe(10);
    expect(model.committedRecurringExpenses).toBe(800);
    expect(model.totalCommitted).toBe(1_210);
    expect(model.totalPlannedOutflow).toBe(3_810);
    expect(model.unallocated).toBe(1_190);
    expect(model.remainingSpending).toBe(2_910);
    expect(model.categoryProgress[0]).toMatchObject({spent: 250, remaining: 350});
    expect(model.categoryProgress[1]).toMatchObject({spent: 50, remaining: 250});
    expect(model.savingsAllocations[0]).toMatchObject({
      goalName: 'Emergency fund',
      currentAmount: 2_500,
      targetAmount: 10_000,
    });
  });

  it('matches category guardrails by stable id or display name', () => {
    const model = createBudgetCycleModel({
      budget,
      transactions,
      categories,
      referenceDate: new Date('2026-08-15T10:00:00.000Z'),
      userId: 'user-1',
    });

    expect(findCategoryBudgetProgress(model, categories[0])?.spent).toBe(250);
    expect(findCategoryBudgetProgress(model, {id: 'unknown', name: 'Travel'})?.spent).toBe(50);
  });

  it('uses Monday-to-Monday bounds for weekly plans', () => {
    const period = getBudgetPeriodBounds({period: 'weekly'}, new Date('2026-08-29T14:00:00.000Z'));

    expect(period.start.getDay()).toBe(1);
    expect((period.endExclusive.getTime() - period.start.getTime()) / 86_400_000).toBe(7);
  });

  it('uses calendar-year bounds and annual planned amounts for yearly plans', () => {
    const model = createBudgetCycleModel({
      budget: {...budget, period: 'yearly'},
      transactions: [],
      referenceDate: new Date('2026-08-29T14:00:00.000Z'),
    });

    expect(model.period.start).toEqual(new Date(2026, 0, 1));
    expect(model.period.endExclusive).toEqual(new Date(2027, 0, 1));
    expect(model.plannedIncome).toBe(60_000);
    expect(model.plannedVariableSpending).toBe(24_000);
  });

  it('scales normalized monthly plan amounts into weekly cycles', () => {
    const model = createBudgetCycleModel({
      budget: {...budget, period: 'weekly'},
      transactions: [],
      loans: [{status: 'ACTIVE', emiAmount: 400}],
      referenceDate: new Date('2026-08-29T14:00:00.000Z'),
    });

    expect(model.plannedIncome).toBeCloseTo(5_000 * (12 / 52));
    expect(model.plannedVariableSpending).toBeCloseTo(2_000 * (12 / 52));
    expect(model.committedLoans).toBeCloseTo(400 * (12 / 52));
  });
});
