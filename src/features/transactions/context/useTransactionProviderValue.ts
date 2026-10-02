import {useCallback, useMemo, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {transactionService} from '../service';
import {queryKeys} from '@/lib/query-keys';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';
import type {Transaction} from '@/types';
import type {TransactionContextType} from './transactionContextTypes';
import {
  createTransactionExport,
  createTransactionsWithIds,
  getTransactionError,
} from './transactionProviderHelpers';
import {
  getTransactionCategoryTotal,
  getTransactionExpenseTotal,
  getTransactionIncomeTotal,
  getTransactionMonthlySpendingTrend,
  getTransactionsBetweenDates,
  getTransactionsByCategoryId,
} from './transactionSelectors';
import {useTransactionMutations} from './useTransactionMutations';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';

const logger = appLogger.contextLogger('TransactionContext');

export const useTransactionProviderValue = (): TransactionContextType => {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const feature = useFeatureStatus('transactions');
  const createAccess = useFeatureActionGuard('transactions.create');
  const deleteAccess = useFeatureActionGuard('transactions.delete');

  const {
    data: transactions = [],
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.transactions.list(user?.uid ?? ''),
    queryFn: async () => {
      if (!user) return [];
      logger.info('Fetching transactions from Supabase...');
      return transactionService.getAll(user.uid);
    },
    enabled: Boolean(user && feature.canRead),
  });

  const {addMutation, updateMutation, deleteMutation} = useTransactionMutations({
    userId: user?.uid,
    transactions,
    queryClient,
  });

  const error = useMemo(
    () =>
      getTransactionError(
        queryError,
        addMutation.error,
        updateMutation.error,
        deleteMutation.error,
      ),
    [queryError, addMutation.error, updateMutation.error, deleteMutation.error],
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => addMutation.mutateAsync(transaction),
    [addMutation],
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => updateMutation.mutateAsync({id, updates}),
    [updateMutation],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const addManyTransactions = useCallback(
    async (transactionsData: Omit<Transaction, 'id'>[]): Promise<Transaction[]> => {
      try {
        createAccess.assertAllowed();
        if (!user) throw new Error('User not authenticated');
        const newTransactions = createTransactionsWithIds(transactionsData, Crypto.randomUUID);
        await transactionService.saveMany(user.uid, newTransactions);
        void queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.list(user?.uid ?? ''),
        });
        void queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(user.uid)});
        return newTransactions;
      } catch (error) {
        logger.error('Failed to add multiple transactions', error);
        throw error;
      }
    },
    [createAccess, queryClient, user],
  );

  const deleteManyTransactions = useCallback(
    async (ids: string[]): Promise<void> => {
      try {
        deleteAccess.assertAllowed();
        if (!user) throw new Error('User not authenticated');
        for (const id of ids) {
          await transactionService.delete(user.uid, id);
        }
        void queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.list(user?.uid ?? ''),
        });
        void queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(user.uid)});
      } catch (error) {
        logger.error('Failed to delete multiple transactions', error);
        throw error;
      }
    },
    [deleteAccess, queryClient, user],
  );

  const getTransactionById = useCallback(
    (id: string): Transaction | undefined =>
      transactions.find((transaction) => transaction.id === id),
    [transactions],
  );

  const getTransactionsByCategory = useCallback(
    (categoryId: string): Transaction[] => getTransactionsByCategoryId(transactions, categoryId),
    [transactions],
  );

  const getTransactionsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Transaction[] =>
      getTransactionsBetweenDates(transactions, startDate, endDate),
    [transactions],
  );

  const getTransactionsByType = useCallback(
    (type: 'income' | 'expense'): Transaction[] =>
      transactions.filter((transaction) => transaction.type === type),
    [transactions],
  );

  const findTransactions = useCallback(
    (predicate: (transaction: Transaction) => boolean): Transaction[] =>
      transactions.filter(predicate),
    [transactions],
  );

  const getTotalIncome = useCallback(
    (): number => getTransactionIncomeTotal(transactions, user?.uid),
    [transactions, user?.uid],
  );

  const getTotalExpenses = useCallback(
    (): number => getTransactionExpenseTotal(transactions, user?.uid),
    [transactions, user?.uid],
  );

  const getNetAmount = useCallback(
    (): number => getTotalIncome() - getTotalExpenses(),
    [getTotalIncome, getTotalExpenses],
  );

  const getMonthlySpendingTrend = useCallback(
    (): Array<{month: string; amount: number}> =>
      getTransactionMonthlySpendingTrend(transactions, user?.uid),
    [transactions, user?.uid],
  );

  const getCategoryTotal = useCallback(
    (categoryId: string): number =>
      getTransactionCategoryTotal(transactions, categoryId, user?.uid),
    [transactions, user?.uid],
  );

  const importTransactions = useCallback(
    async (transactionsData: Omit<Transaction, 'id'>[]): Promise<Transaction[]> =>
      addManyTransactions(transactionsData),
    [addManyTransactions],
  );

  const exportTransactions = useCallback(
    () => createTransactionExport(transactions),
    [transactions],
  );

  const syncWithRemote = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(user?.uid ?? '')});
    setLastSyncTime(new Date());
    logger.info('Transactions synced with remote successfully');
  }, [queryClient, user?.uid]);

  const syncEntityWithRemote = useCallback(
    async (id: string): Promise<void> => {
      await queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(user?.uid ?? '')});
      logger.info('Transaction entity synced with remote', {transactionId: id});
    },
    [queryClient, user?.uid],
  );

  const loadFromRemote = useCallback(async (): Promise<void> => {
    await queryClient.refetchQueries({queryKey: queryKeys.transactions.list(user?.uid ?? '')});
    setLastSyncTime(new Date());
    logger.info('Transactions loaded from remote successfully');
  }, [queryClient, user?.uid]);

  const isLoading =
    isQueryLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return useMemo<TransactionContextType>(
    () => ({
      transactions,
      isLoading,
      error,
      lastSyncTime,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addManyTransactions,
      deleteManyTransactions,
      getTransactionById,
      getTransactionsByCategory,
      getTransactionsByDateRange,
      getTransactionsByType,
      findTransactions,
      getTotalIncome,
      getTotalExpenses,
      getNetAmount,
      getMonthlySpendingTrend,
      getCategoryTotal,
      importTransactions,
      exportTransactions,
      syncWithRemote,
      syncEntityWithRemote,
      loadFromRemote,
    }),
    [
      transactions,
      isLoading,
      error,
      lastSyncTime,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addManyTransactions,
      deleteManyTransactions,
      getTransactionById,
      getTransactionsByCategory,
      getTransactionsByDateRange,
      getTransactionsByType,
      findTransactions,
      getTotalIncome,
      getTotalExpenses,
      getNetAmount,
      getMonthlySpendingTrend,
      getCategoryTotal,
      importTransactions,
      exportTransactions,
      syncWithRemote,
      syncEntityWithRemote,
      loadFromRemote,
    ],
  );
};
