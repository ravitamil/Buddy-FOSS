/* eslint-disable context-patterns/deprecation-warnings */
import React from 'react';
import {renderHook, act, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useBudgetState} from './useBudgetState';
import {budgetService} from '../service';
import type {Budget} from '@/types';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({user: {uid: 'user-123'}}),
}));

jest.mock('@/features/featureControls', () => ({
  useFeatureActionGuard: () => ({assertAllowed: jest.fn()}),
  useFeatureStatus: () => ({canRead: true}),
}));

jest.mock('../service', () => ({
  normalizeBudget: (b: Budget): Budget => ({
    ...b,
    createdAt: b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt),
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt),
  }),
  budgetService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setActive: jest.fn(),
  },
}));

describe('useBudgetState', () => {
  let queryClient: QueryClient;
  let mockBudgetsDb: Budget[];

  beforeEach(() => {
    jest.clearAllMocks();
    mockBudgetsDb = [];

    (budgetService.getAll as jest.Mock).mockImplementation(() =>
      Promise.resolve([...mockBudgetsDb]),
    );
    (budgetService.create as jest.Mock).mockImplementation((_userId: string, budget: Budget) => {
      const created = {
        ...budget,
        id: budget.id || 'budget-new-1',
      };
      if (created.isActive) {
        mockBudgetsDb.forEach((b) => {
          b.isActive = false;
        });
      }
      mockBudgetsDb.push(created);
      return Promise.resolve(created);
    });
    (budgetService.update as jest.Mock).mockImplementation((_userId: string, budget: Budget) => {
      const index = mockBudgetsDb.findIndex((b) => b.id === budget.id);
      if (index !== -1) {
        mockBudgetsDb[index] = budget;
      }
      return Promise.resolve(budget);
    });
    (budgetService.delete as jest.Mock).mockImplementation((_userId: string, budgetId: string) => {
      mockBudgetsDb = mockBudgetsDb.filter((b) => b.id !== budgetId);
      return Promise.resolve();
    });
    (budgetService.setActive as jest.Mock).mockImplementation(
      (_userId: string, budgetId: string | null) => {
        mockBudgetsDb.forEach((b) => {
          b.isActive = b.id === budgetId;
        });
        return Promise.resolve();
      },
    );

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
      },
    });
  });

  const wrapper = ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('preserves newly added budget in cache when followed immediately by setActiveBudget (prevents cache wipe)', async () => {
    const {result} = renderHook(() => useBudgetState(), {wrapper});

    expect(result.current.budgets).toEqual([]);
    expect(result.current.activeBudget).toBeNull();

    let createdId = '';
    await act(async () => {
      const newBudget = await result.current.addBudget({
        name: 'My Monthly Plan',
        currencyCode: 'USD',
        monthlyIncome: 6000,
        plannedExpenses: 3000,
        plannedSavings: 1000,
        customSplits: [],
        period: 'monthly',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      createdId = newBudget.id;
      expect(createdId).toBeDefined();

      // Chained call within the same hook render (stale closure scenario)
      await result.current.setActiveBudget(createdId);
    });

    await waitFor(() => {
      expect(result.current.budgets).toHaveLength(1);
    });
    expect(result.current.budgets[0].id).toBe(createdId);
    expect(result.current.budgets[0].name).toBe('My Monthly Plan');
    expect(result.current.budgets[0].isActive).toBe(true);
    expect(result.current.activeBudget?.id).toBe(createdId);
    expect(result.current.getBudgetById(createdId)?.name).toBe('My Monthly Plan');
  });

  it('updates budget in cache and preserves other budgets', async () => {
    const existingBudget: Budget = {
      id: 'b-1',
      name: 'Plan 1',
      currencyCode: 'USD',
      monthlyIncome: 5000,
      plannedExpenses: 2000,
      plannedSavings: 500,
      customSplits: [],
      period: 'monthly',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockBudgetsDb.push(existingBudget);

    const {result} = renderHook(() => useBudgetState(), {wrapper});

    await waitFor(() => {
      expect(result.current.budgets).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateBudget('b-1', {name: 'Updated Plan 1'});
    });

    await waitFor(() => {
      expect(result.current.getBudgetById('b-1')?.name).toBe('Updated Plan 1');
    });
  });

  it('deletes budget and falls back active budget', async () => {
    const b1: Budget = {
      id: 'b-1',
      name: 'Plan 1',
      currencyCode: 'USD',
      monthlyIncome: 5000,
      plannedExpenses: 2000,
      plannedSavings: 500,
      customSplits: [],
      period: 'monthly',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const b2: Budget = {
      id: 'b-2',
      name: 'Plan 2',
      currencyCode: 'USD',
      monthlyIncome: 4000,
      plannedExpenses: 1500,
      plannedSavings: 500,
      customSplits: [],
      period: 'monthly',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockBudgetsDb.push(b1, b2);

    const {result} = renderHook(() => useBudgetState(), {wrapper});

    await waitFor(() => {
      expect(result.current.budgets).toHaveLength(2);
    });

    await act(async () => {
      await result.current.deleteBudget('b-1');
    });

    await waitFor(() => {
      expect(result.current.budgets).toHaveLength(1);
    });
    expect(result.current.budgets[0].id).toBe('b-2');
    expect(result.current.budgets[0].isActive).toBe(true);
    expect(result.current.activeBudget?.id).toBe('b-2');
  });
});
