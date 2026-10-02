import {useCallback, useMemo} from 'react';
import * as Crypto from 'expo-crypto';

import {useAuth} from '@/context/AuthContext';
import type {Budget} from '@/types';
import {queryKeys} from '@/lib/query-keys';
import {useQueryClient} from '@tanstack/react-query';
import {useFeatureActionGuard} from '@/features/featureControls';

import {useBudgets} from '../queries';
import {budgetService, normalizeBudget} from '../service';
import {
  getActiveBudget,
  removeBudgetWithActiveFallback,
  withActiveBudget,
} from '../model/budgetLifecycle';

export interface BudgetFeatureState {
  budgets: Budget[];
  activeBudgetId: string | null;
  activeBudget: Budget | null;
  isLoading: boolean;
  error: string | null;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  setActiveBudget: (budgetId: string | null) => Promise<void>;
  findBudgets: (predicate: (budget: Budget) => boolean) => Budget[];
  getBudgetById: (id: string) => Budget | undefined;
}

export function useBudgetState(): BudgetFeatureState {
  const {user} = useAuth();
  const userId = user?.uid ?? '';
  const queryClient = useQueryClient();
  const {data: budgets = [], isLoading, error} = useBudgets(userId);
  const createAccess = useFeatureActionGuard('budgets.create');
  const updateAccess = useFeatureActionGuard('budgets.update');
  const deleteAccess = useFeatureActionGuard('budgets.delete');

  const normalizedBudgets = useMemo(() => budgets.map(normalizeBudget), [budgets]);

  const currentBudgets = useMemo(() => {
    if (!userId) return normalizedBudgets;
    const cached = queryClient.getQueryData<Budget[]>(queryKeys.budgets.list(userId));
    return (cached && cached.length > 0 ? cached : normalizedBudgets).map(normalizeBudget);
  }, [normalizedBudgets, queryClient, userId]);

  const activeBudget = useMemo(() => getActiveBudget(currentBudgets), [currentBudgets]);

  const writeBudgetsToCache = useCallback(
    (updater: Budget[] | ((previous: Budget[]) => Budget[])) => {
      if (!userId) return;
      queryClient.setQueryData<Budget[]>(queryKeys.budgets.list(userId), (previous) => {
        const fallback = normalizedBudgets.length > 0 ? normalizedBudgets : [];
        const base =
          typeof updater === 'function'
            ? updater(previous && previous.length > 0 ? previous : fallback)
            : updater;
        return base.map(normalizeBudget);
      });
    },
    [normalizedBudgets, queryClient, userId],
  );

  const addBudget = useCallback(
    async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
      createAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const nextBudget = normalizeBudget({
        ...budget,
        id: Crypto.randomUUID(),
        createdAt: budget.createdAt ?? new Date(),
        updatedAt: new Date(),
      });

      const persistedBudget = await budgetService.create(userId, nextBudget);
      if (nextBudget.isActive) {
        await budgetService.setActive(userId, persistedBudget.id);
      }

      writeBudgetsToCache((previous) => {
        const nextBudgets = nextBudget.isActive
          ? previous.map((currentBudget) => ({...currentBudget, isActive: false}))
          : previous;
        return [...nextBudgets.filter((b) => b.id !== persistedBudget.id), persistedBudget];
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.all,
        refetchType: 'active',
      });

      return persistedBudget;
    },
    [createAccess, queryClient, userId, writeBudgetsToCache],
  );

  const updateBudget = useCallback(
    async (id: string, updates: Partial<Budget>): Promise<Budget> => {
      updateAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const cached = queryClient.getQueryData<Budget[]>(queryKeys.budgets.list(userId));
      const targetList = (cached && cached.length > 0 ? cached : normalizedBudgets).map(
        normalizeBudget,
      );
      const existingBudget = targetList.find((budget) => budget.id === id);
      if (!existingBudget) {
        throw new Error('Budget not found');
      }

      const nextBudget = normalizeBudget({
        ...existingBudget,
        ...updates,
        id,
        updatedAt: new Date(),
      });

      const persistedBudget = await budgetService.update(userId, nextBudget);
      if (nextBudget.isActive) {
        await budgetService.setActive(userId, id);
      }

      writeBudgetsToCache((previous) =>
        previous.map((budget) => {
          if (budget.id === id) {
            return persistedBudget;
          }
          return nextBudget.isActive ? {...budget, isActive: false} : budget;
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.all,
        refetchType: 'active',
      });

      return persistedBudget;
    },
    [normalizedBudgets, queryClient, updateAccess, userId, writeBudgetsToCache],
  );

  const deleteBudget = useCallback(
    async (id: string): Promise<void> => {
      deleteAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await budgetService.delete(userId, id);

      let newActiveId: string | null = null;
      writeBudgetsToCache((previous) => {
        const result = removeBudgetWithActiveFallback(previous, id);
        newActiveId = result.activeBudgetId;
        return result.budgets;
      });

      if (newActiveId !== activeBudget?.id) {
        await budgetService.setActive(userId, newActiveId);
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.all,
        refetchType: 'active',
      });
    },
    [activeBudget?.id, deleteAccess, queryClient, userId, writeBudgetsToCache],
  );

  const setActiveBudget = useCallback(
    async (budgetId: string | null): Promise<void> => {
      updateAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await budgetService.setActive(userId, budgetId);

      writeBudgetsToCache((previous) =>
        withActiveBudget(previous, budgetId).map((budget) => ({
          ...budget,
          updatedAt: budget.id === budgetId ? new Date() : budget.updatedAt,
        })),
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.all,
        refetchType: 'active',
      });
    },
    [queryClient, updateAccess, userId, writeBudgetsToCache],
  );

  const findBudgets = useCallback(
    (predicate: (budget: Budget) => boolean) => currentBudgets.filter(predicate),
    [currentBudgets],
  );

  const getBudgetById = useCallback(
    (id: string) => currentBudgets.find((budget) => budget.id === id),
    [currentBudgets],
  );

  return {
    budgets: currentBudgets,
    activeBudgetId: activeBudget?.id ?? null,
    activeBudget,
    isLoading,
    error: error instanceof Error ? error.message : null,
    addBudget,
    updateBudget,
    deleteBudget,
    setActiveBudget,
    findBudgets,
    getBudgetById,
  };
}
