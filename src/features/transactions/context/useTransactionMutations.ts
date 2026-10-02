import {useMutation, type QueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {transactionService} from '../service';
import {queryKeys} from '@/lib/query-keys';
import {logger as appLogger} from '@/services/LoggerService';
import type {Transaction} from '@/types';
import {useFeatureActionGuard} from '@/features/featureControls';

import {
  prependOptimisticTransaction,
  removeCachedTransaction,
  updateCachedTransaction,
} from './transactionProviderHelpers';

const logger = appLogger.contextLogger('TransactionContext');

interface UseTransactionMutationsInput {
  userId?: string;
  transactions: Transaction[];
  queryClient: QueryClient;
}

export const useTransactionMutations = ({
  userId,
  transactions,
  queryClient,
}: UseTransactionMutationsInput) => {
  const transactionQueryKey = queryKeys.transactions.list(userId ?? '');
  const createAccess = useFeatureActionGuard('transactions.create');
  const updateAccess = useFeatureActionGuard('transactions.update');
  const deleteAccess = useFeatureActionGuard('transactions.delete');
  const invalidateTransactionDependents = () => {
    void queryClient.invalidateQueries({queryKey: transactionQueryKey});
    if (userId) {
      void queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)});
    }
  };

  const addMutation = useMutation({
    mutationFn: async (transactionData: Omit<Transaction, 'id'>) => {
      createAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const newTransaction = {...transactionData, id: Crypto.randomUUID()};
      await transactionService.create(userId, newTransaction);
      return newTransaction;
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({queryKey: transactionQueryKey});
      const previousTransactions = queryClient.getQueryData(transactionQueryKey);
      const optimisticTransaction = {...newTransaction, id: `temp-${Date.now()}`};
      queryClient.setQueryData(transactionQueryKey, (old: Transaction[] = []) =>
        prependOptimisticTransaction(old, optimisticTransaction),
      );
      return {previousTransactions};
    },
    onError: (error, _newTransaction, context) => {
      queryClient.setQueryData(transactionQueryKey, context?.previousTransactions);
      logger.error('Add mutation failed', error);
    },
    onSuccess: (newTransaction) => {
      logger.info('Transaction added successfully', {transactionId: newTransaction.id});
    },
    onSettled: () => {
      invalidateTransactionDependents();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<Transaction>}) => {
      updateAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const current = transactions.find((transaction) => transaction.id === id);
      if (!current) throw new Error('Transaction not found');
      const updatedTransaction = {...current, ...updates};
      await transactionService.update(userId, updatedTransaction);
      return updatedTransaction;
    },
    onMutate: async ({id, updates}) => {
      await queryClient.cancelQueries({queryKey: transactionQueryKey});
      const previousTransactions = queryClient.getQueryData(transactionQueryKey);
      queryClient.setQueryData(transactionQueryKey, (old: Transaction[] = []) =>
        updateCachedTransaction(old, id, updates),
      );
      return {previousTransactions};
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(transactionQueryKey, context?.previousTransactions);
      logger.error('Update mutation failed', error);
    },
    onSuccess: (updatedTransaction) => {
      logger.info('Transaction updated successfully', {transactionId: updatedTransaction.id});
    },
    onSettled: () => {
      invalidateTransactionDependents();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      await transactionService.delete(userId, id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({queryKey: transactionQueryKey});
      const previousTransactions = queryClient.getQueryData(transactionQueryKey);
      queryClient.setQueryData(transactionQueryKey, (old: Transaction[] = []) =>
        removeCachedTransaction(old, id),
      );
      return {previousTransactions};
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(transactionQueryKey, context?.previousTransactions);
      logger.error('Delete mutation failed', error);
    },
    onSuccess: (deletedId) => {
      logger.info('Transaction deleted successfully', {transactionId: deletedId});
    },
    onSettled: () => {
      invalidateTransactionDependents();
    },
  });

  return {addMutation, updateMutation, deleteMutation};
};
