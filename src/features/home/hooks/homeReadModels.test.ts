import type {Budget, Category, Transaction} from '@/types';
import {semanticHexColor} from '@ravitamil/buddy-ui';

import {
  calculateMonthlyPercentage,
  createBudgetData,
  createFinancialData,
  createHomeGroupCards,
  createHomeStatCards,
  createHomeTransactionItems,
  getStatTrendInfo,
} from './homeReadModels';

const referenceDate = new Date(2026, 5, 20);
const transactions = [
  {
    id: 'last-income',
    description: 'Last income',
    amount: 100,
    category: 'Salary',
    date: '2026-05-10',
    type: 'income',
  },
  {
    id: 'last-expense',
    description: 'Last expense',
    amount: -50,
    category: 'Food',
    date: '2026-05-12',
    type: 'expense',
  },
  {
    id: 'current-income',
    description: 'Current income',
    amount: 150,
    category: 'Salary',
    date: '2026-06-10',
    type: 'income',
  },
  {
    id: 'current-expense',
    description: 'Current expense',
    amount: -25,
    category: 'Food',
    date: '2026-06-12',
    type: 'expense',
  },
] as Transaction[];

describe('homeReadModels', () => {
  it('calculates monthly percentage changes for each home stat', () => {
    expect(calculateMonthlyPercentage(transactions, 'income', referenceDate)).toBe('+50.0');
    expect(calculateMonthlyPercentage(transactions, 'expense', referenceDate)).toBe('-50.0');
    expect(calculateMonthlyPercentage(transactions, 'investment', referenceDate)).toBe('+150.0');
    expect(calculateMonthlyPercentage([], 'income', referenceDate)).toBe('0.0');
  });

  it('determines correct trend, icon, and colors for stats', () => {
    expect(getStatTrendInfo('+10.0', 'income')).toEqual({
      trend: 'positive',
      percentageColor: '#10B981',
      percentageIcon: 'arrow-up',
    });
    expect(getStatTrendInfo('-10.0', 'income')).toEqual({
      trend: 'negative',
      percentageColor: '#EF4444',
      percentageIcon: 'arrow-down',
    });
    expect(getStatTrendInfo('+10.0', 'expense')).toEqual({
      trend: 'negative',
      percentageColor: '#EF4444',
      percentageIcon: 'arrow-up',
    });
    expect(getStatTrendInfo('-10.0', 'expense')).toEqual({
      trend: 'positive',
      percentageColor: '#10B981',
      percentageIcon: 'arrow-down',
    });
    expect(getStatTrendInfo('0.0', 'income')).toEqual({
      trend: 'neutral',
      percentageColor: '#9CA3AF',
      percentageIcon: 'remove',
    });
  });

  it('creates budget data with defaults for optional values', () => {
    const now = new Date();
    const budget = {
      monthlyIncome: 5000,
      plannedExpenses: 3000,
      plannedSavings: 1000,
      customSplits: [],
    } as Budget;

    expect(createBudgetData(budget)).toEqual({
      budgetName: undefined,
      period: undefined,
      daysRemaining: 0,
      periodLabel: new Date().toLocaleDateString(undefined, {month: 'long'}),
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      periodEndExclusive: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      monthlyIncome: 5000,
      plannedExpenses: 3000,
      plannedSavings: 1000,
      actualSpent: 0,
      actualIncome: 0,
      totalSpendingPlan: 3000,
      remainingSpending: 3000,
      utilizationPercentage: 0,
      dailySafeToSpend: 0,
      customSplits: [],
      monthlyLoanEMIs: 0,
      monthlySubscriptions: 0,
      monthlyRecurringExpenses: 0,
      financialHealthScore: 0,
      topBudgetCategories: [],
    });
  });

  it('creates financial data from the analytics summary', () => {
    expect(createFinancialData({totalIncome: 900, totalExpenses: 350})).toEqual({
      income: 900,
      expenses: 350,
      savings: 550,
    });
  });

  it('creates stat cards with formatted values and navigation actions', () => {
    const navigate = jest.fn();
    const cards = createHomeStatCards({
      transactions,
      financialData: {income: 150, expenses: 25, savings: 125},
      formatCurrency: (amount) => `$${amount}`,
      navigate,
      referenceDate,
    });

    expect(
      cards.map(({title, value, percentage, percentageIcon, trend, percentageColor}) => ({
        title,
        value,
        percentage,
        percentageIcon,
        trend,
        percentageColor,
      })),
    ).toEqual([
      {
        title: 'Income',
        value: '$150',
        percentage: '+50.0%',
        percentageIcon: 'arrow-up',
        trend: 'positive',
        percentageColor: '#10B981',
      },
      {
        title: 'Expense',
        value: '$25',
        percentage: '-50.0%',
        percentageIcon: 'arrow-down',
        trend: 'positive',
        percentageColor: '#10B981',
      },
      {
        title: 'Savings',
        value: '$125',
        percentage: '+150.0%',
        percentageIcon: 'arrow-up',
        trend: 'positive',
        percentageColor: '#10B981',
      },
    ]);

    cards[0].onPress();
    cards[1].onPress();
    cards[2].onPress();

    expect(navigate.mock.calls).toEqual([
      ['/transactions?type=income'],
      ['/transactions?type=expense'],
      ['/savings-portfolio'],
    ]);
  });

  it('creates group cards with totals and group routes', () => {
    const navigate = jest.fn();
    const cards = createHomeGroupCards({
      groups: [
        {
          id: 'group-1',
          name: 'Trip',
          emoji: '✈️',
          members: [{id: 'one'}, {id: 'two'}],
          transactions: [
            {
              id: 'expense-1',
              amount: -80,
              category: 'Travel',
              description: 'Hotel',
              date: '2026-09-01',
              type: 'expense',
              groupId: 'group-1',
              splitAmounts: {'user-1': 40, 'user-2': 40},
            },
            {
              id: 'expense-2',
              amount: -20,
              category: 'Travel',
              description: 'Taxi',
              date: '2026-09-02',
              type: 'expense',
              groupId: 'group-1',
              splitAmounts: {'user-1': 10, 'user-2': 10},
            },
          ],
        },
      ],
      formatCurrency: (amount) => `$${amount}`,
      navigate,
      userId: 'user-1',
    });

    expect(cards[0].props).toMatchObject({
      members: 2,
      totalAmount: 100,
      yourShare: 50,
      icon: 'airplane',
    });

    cards[0].props.onPress();
    cards[0].props.onAddExpense();

    expect(navigate.mock.calls).toEqual([['/groups/group-1'], ['/groups/group-1/add-transaction']]);
  });

  it('creates recent transaction items with category and detail routes', () => {
    const navigate = jest.fn();
    const categories = [
      {id: 'food', name: 'Food', type: 'expense', icon: 'fast-food', color: '#123456'},
    ] as Category[];
    const groups = [{id: 'group-1', name: 'Trip', emoji: '✈️'}];
    const items = createHomeTransactionItems({
      transactions: [
        {...transactions[3], categoryId: 'food'},
        {...transactions[2], id: 'group-transaction', groupId: 'group-1'},
      ],
      categories,
      navigate,
      groups,
    });

    expect(items[0].category).toEqual({
      name: 'Food',
      icon: 'fast-food',
      color: '#123456',
    });

    // Group transaction should resolve group name and emoji
    expect(items[1].groupName).toBe('Trip');
    expect(items[1].groupEmoji).toBe('✈️');

    items[0].onPress();
    items[1].onPress();

    expect(navigate.mock.calls).toEqual([
      ['/transactions/current-expense'],
      ['/groups/group-1/transactions/group-transaction'],
    ]);
  });

  it('formats settlement transactions with swap-horizontal icon and settled status', () => {
    const navigate = jest.fn();
    const categories = [] as Category[];
    const items = createHomeTransactionItems({
      transactions: [
        {
          ...transactions[0],
          id: 'settlement-1',
          isSettlement: true,
          description: 'Repayment from Vimal Cse to Ravitamil',
          category: 'Settlement',
          groupId: 'group-1',
        },
      ],
      categories,
      navigate,
      groups: [{id: 'group-1', name: 'Trip', emoji: '✈️'}],
      currentUserName: 'Ravitamil',
    });

    expect(items[0].category).toEqual({
      name: 'Settlement',
      icon: 'swap-horizontal',
      color: semanticHexColor('success'),
    });
    expect(items[0].description).toBe('Repayment from Vimal Cse');
    expect(items[0].settlementStatus).toBe('settled');
    expect(items[0].groupName).toBe('Trip');
    expect(items[0].groupEmoji).toBe('✈️');
  });

  it('derives group expense settlement status through the signed-in group member', () => {
    const items = createHomeTransactionItems({
      transactions: [
        {
          ...transactions[3],
          groupId: 'group-1',
          paidBy: 'payer',
          splitDetails: [
            {
              memberId: 'member-user',
              memberName: 'Ravitamil',
              amount: 25,
              settledAmount: 10,
              isPaid: false,
            },
          ],
        },
      ],
      categories: [],
      groups: [
        {
          id: 'group-1',
          name: 'Trip',
          emoji: '✈️',
          members: [{id: 'member-user', name: 'Ravitamil', supabaseUserId: 'auth-user'}],
        },
      ],
      currentUserId: 'auth-user',
      navigate: jest.fn(),
    });

    expect(items[0].settlementStatus).toBe('partial');
  });
});
