import {useCallback, useMemo} from 'react';
import * as Crypto from 'expo-crypto';

import {useAuth} from '@/context/AuthContext';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import type {SavingsGoal} from '@/types';
import {useFeatureActionGuard} from '@/features/featureControls';

import {useSavings as useSavingsQuery} from '../queries';
import {normalizeSavingsGoal, savingsService} from '../service';

export interface SavingsFeatureState {
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<SavingsGoal>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  depositSavingsGoal: (
    id: string,
    amount: number,
    walletId?: string,
    note?: string,
  ) => Promise<void>;
  getSavingsGoalById: (id: string) => SavingsGoal | undefined;
  findSavingsGoals: (predicate: (goal: SavingsGoal) => boolean) => SavingsGoal[];
}

export function useSavingsState(): SavingsFeatureState {
  const {user} = useAuth();
  const userId = user?.uid ?? '';
  const queryClient = useQueryClient();
  const {data: savingsGoals = [], isLoading, error} = useSavingsQuery(userId);
  const createAccess = useFeatureActionGuard('savings.create');
  const updateAccess = useFeatureActionGuard('savings.update');
  const deleteAccess = useFeatureActionGuard('savings.delete');

  const normalizedSavingsGoals = useMemo(
    () => savingsGoals.map(normalizeSavingsGoal),
    [savingsGoals],
  );

  const writeSavingsGoalsToCache = useCallback(
    (nextGoals: SavingsGoal[]) => {
      queryClient.setQueryData(queryKeys.savings.list(userId), nextGoals);
    },
    [queryClient, userId],
  );

  const addSavingsGoal = useCallback(
    async (goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> => {
      createAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const nextGoal = normalizeSavingsGoal({
        ...goal,
        id: Crypto.randomUUID(),
        createdAt: goal.createdAt ?? new Date(),
        updatedAt: new Date(),
      });

      await savingsService.create(userId, nextGoal);
      writeSavingsGoalsToCache([...normalizedSavingsGoals, nextGoal]);
      return nextGoal;
    },
    [createAccess, normalizedSavingsGoals, userId, writeSavingsGoalsToCache],
  );

  const updateSavingsGoal = useCallback(
    async (id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
      updateAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const existingGoal = normalizedSavingsGoals.find((goal) => goal.id === id);
      if (!existingGoal) {
        throw new Error('Savings goal not found');
      }

      const nextGoal = normalizeSavingsGoal({
        ...existingGoal,
        ...updates,
        id,
        updatedAt: new Date(),
      });

      await savingsService.update(userId, nextGoal);
      writeSavingsGoalsToCache(
        normalizedSavingsGoals.map((goal) => (goal.id === id ? nextGoal : goal)),
      );
      return nextGoal;
    },
    [normalizedSavingsGoals, updateAccess, userId, writeSavingsGoalsToCache],
  );

  const deleteSavingsGoal = useCallback(
    async (id: string): Promise<void> => {
      deleteAccess.assertAllowed();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await savingsService.delete(userId, id);
      writeSavingsGoalsToCache(normalizedSavingsGoals.filter((goal) => goal.id !== id));
    },
    [deleteAccess, normalizedSavingsGoals, userId, writeSavingsGoalsToCache],
  );

  const depositSavingsGoal = useCallback(
    async (id: string, amount: number, walletId?: string, note?: string): Promise<void> => {
      updateAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');

      const result = await savingsService.deposit(
        userId,
        id,
        amount,
        walletId,
        note,
        Crypto.randomUUID(),
      );
      writeSavingsGoalsToCache(
        normalizedSavingsGoals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                currentAmount: result.currentAmount,
                isCompleted: result.isCompleted,
                updatedAt: new Date(),
              }
            : goal,
        ),
      );
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)}),
      ]);
    },
    [normalizedSavingsGoals, queryClient, updateAccess, userId, writeSavingsGoalsToCache],
  );

  const getSavingsGoalById = useCallback(
    (id: string) => normalizedSavingsGoals.find((goal) => goal.id === id),
    [normalizedSavingsGoals],
  );

  const findSavingsGoals = useCallback(
    (predicate: (goal: SavingsGoal) => boolean) => normalizedSavingsGoals.filter(predicate),
    [normalizedSavingsGoals],
  );

  return {
    savingsGoals: normalizedSavingsGoals,
    isLoading,
    error: error instanceof Error ? error.message : null,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    depositSavingsGoal,
    getSavingsGoalById,
    findSavingsGoals,
  };
}
