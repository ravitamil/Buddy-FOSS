import {act, renderHook} from '@testing-library/react-native';
import dayjs from 'dayjs';

import {useAnalyticsScreen} from './useAnalyticsScreen';

const mockTransactions = [
  {
    id: 'tx-1',
    description: 'Tech Salary',
    amount: 5000,
    date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
    type: 'income',
    category: 'Salary',
    categoryId: 'cat-salary',
  },
  {
    id: 'tx-2',
    description: 'Whole Foods Market',
    amount: 450,
    date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
    type: 'expense',
    category: 'Groceries',
    categoryId: 'cat-groceries',
  },
  {
    id: 'tx-3',
    description: 'Electric Utility',
    amount: 120,
    date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
    type: 'expense',
    category: 'Utilities',
    categoryId: 'cat-utilities',
  },
  {
    id: 'tx-4',
    description: 'Netflix Subscription',
    amount: 25,
    date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
    type: 'expense',
    category: 'Entertainment',
    categoryId: 'cat-entertainment',
  },
  // Prior period transaction (last month)
  {
    id: 'tx-prior-1',
    description: 'Old Grocery Store',
    amount: 800,
    date: dayjs().subtract(1, 'month').format('YYYY-MM-DDTHH:mm:ssZ'),
    type: 'expense',
    category: 'Groceries',
    categoryId: 'cat-groceries',
  },
];

const mockCategories = [
  {id: 'cat-salary', name: 'Salary', icon: 'cash-outline', color: '#10B981', type: 'income'},
  {id: 'cat-groceries', name: 'Groceries', icon: 'cart-outline', color: '#3B82F6', type: 'expense'},
  {
    id: 'cat-utilities',
    name: 'Utilities',
    icon: 'flash-outline',
    color: '#F59E0B',
    type: 'expense',
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    icon: 'film-outline',
    color: '#EC4899',
    type: 'expense',
  },
];

const mockActiveBudget = {
  id: 'budget-1',
  name: 'Monthly Budget',
  plannedExpenses: 2000,
  isActive: true,
  startDate: dayjs().startOf('month').toISOString(),
};

jest.mock('@/context', () => ({
  useTransaction: () => ({
    transactions: mockTransactions,
  }),
  useAuth: () => ({
    user: {uid: 'test-user-id'},
  }),
  useCategory: () => ({
    categories: mockCategories,
  }),
  useBudget: () => ({
    activeBudget: mockActiveBudget,
    budgets: [mockActiveBudget],
  }),
  useSettings: () => ({
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
    currency: 'USD',
  }),
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
  }),
}));

jest.mock('tamagui', () => ({
  useTheme: () => ({
    color: {val: '#000000'},
  }),
}));

describe('useAnalyticsScreen', () => {
  it('initializes with month period and computes metrics accurately', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    expect(result.current.selectedPeriod).toBe('month');
    expect(result.current.screenId).toBe('analytics');

    // Total income = 5000
    expect(result.current.totalIncome).toBe(5000);

    // Total expenses = 450 + 120 + 25 = 595
    expect(result.current.totalExpenses).toBe(595);

    // Net balance = 5000 - 595 = 4405
    expect(result.current.netBalance).toBe(4405);

    // Savings rate = (4405 / 5000) * 100 = 88.1%
    expect(result.current.savingsRate).toBeCloseTo(88.1, 1);

    // Budget integration
    expect(result.current.hasActiveBudget).toBe(true);
    expect(result.current.budgetLimit).toBe(2000);
    expect(result.current.budgetRemaining).toBe(2000 - 595);
    expect(result.current.budgetUsagePct).toBeCloseTo((595 / 2000) * 100, 1);
  });

  it('aggregates category breakdown and ranks by spending', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    expect(result.current.categoryBreakdown.length).toBe(3);

    const topCategory = result.current.categoryBreakdown[0];
    expect(topCategory.name).toBe('Groceries');
    expect(topCategory.amount).toBe(450);
    expect(topCategory.percentage).toBeCloseTo((450 / 595) * 100, 1);

    const secondCategory = result.current.categoryBreakdown[1];
    expect(secondCategory.name).toBe('Utilities');
    expect(secondCategory.amount).toBe(120);

    expect(result.current.pieData.length).toBe(3);
  });

  it('computes dynamic financial health score and insights', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    const {financialHealth} = result.current;
    expect(financialHealth.score).toBeGreaterThan(70);
    expect(financialHealth.rating).toBe('Excellent');
    expect(financialHealth.tone).toBe('positive');
    expect(financialHealth.insights.length).toBeGreaterThan(0);
  });

  it('extracts top expense transactions sorted by amount descending', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    expect(result.current.topExpenses.length).toBe(3);
    expect(result.current.topExpenses[0].description).toBe('Whole Foods Market');
    expect(result.current.topExpenses[0].amount).toBe(450);
    expect(result.current.topExpenses[1].description).toBe('Electric Utility');
    expect(result.current.topExpenses[1].amount).toBe(120);
    expect(result.current.topExpenses[2].description).toBe('Netflix Subscription');
    expect(result.current.topExpenses[2].amount).toBe(25);
  });

  it('allows period switching to week, quarter, and year', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    act(() => {
      result.current.setSelectedPeriod('week');
    });
    expect(result.current.selectedPeriod).toBe('week');

    act(() => {
      result.current.setSelectedPeriod('quarter');
    });
    expect(result.current.selectedPeriod).toBe('quarter');

    act(() => {
      result.current.setSelectedPeriod('year');
    });
    expect(result.current.selectedPeriod).toBe('year');
  });

  it('triggers onRefresh handler without crashing', () => {
    const {result} = renderHook(() => useAnalyticsScreen());

    act(() => {
      result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(true);
  });
});
