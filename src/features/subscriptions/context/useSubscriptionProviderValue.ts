import {useCallback, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {queryKeys} from '@/lib/query-keys';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';
import {subscriptionDatabaseService} from '@/services/SubscriptionDatabaseService';
import type {PaymentRecord, SubscriptionData, SubscriptionStats} from '@/types/finance.types';
import {
  buildSubscriptionStats,
  getSubscriptionMonthlyCost,
  getSubscriptionYearlyCost,
  getUpcomingSubscriptionRenewals,
} from './subscriptionSelectors';
import {
  buildPausedSubscription,
  buildResumedSubscription,
  removePaymentFromSubscription,
} from './subscriptionOperations';
import type {SubscriptionContextType} from './subscriptionContextTypes';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';

const logger = appLogger.contextLogger('SubscriptionContext');

export const useSubscriptionProviderValue = (): SubscriptionContextType => {
  const {isAuthenticated, user} = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.uid ?? '';
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const createAccess = useFeatureActionGuard('subscriptions.create');
  const updateAccess = useFeatureActionGuard('subscriptions.update');
  const deleteAccess = useFeatureActionGuard('subscriptions.delete');
  const paymentAccess = useFeatureActionGuard('subscriptions.recordPayment');
  const feature = useFeatureStatus('subscriptions');

  const {
    data: subscriptions = [],
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery<SubscriptionData[], Error>({
    queryKey: queryKeys.subscriptions.list(userId),
    queryFn: async () => {
      logger.info('Fetching subscriptions from Supabase...');
      return subscriptionDatabaseService.getSubscriptions(userId);
    },
    enabled: Boolean(isAuthenticated && userId && feature.canRead),
  });

  const stats = useMemo<SubscriptionStats>(
    () => buildSubscriptionStats(subscriptions, null),
    [subscriptions],
  );

  const addSubscriptionMutation = useMutation<
    SubscriptionData,
    Error,
    Omit<SubscriptionData, 'id' | 'createdAt' | 'updatedAt'>
  >({
    mutationFn: async (
      subscriptionData: Omit<SubscriptionData, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<SubscriptionData> => {
      createAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      const now = new Date().toISOString();
      const created: SubscriptionData = {
        ...subscriptionData,
        id: Crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await subscriptionDatabaseService.saveSubscriptions(userId, [created]);
      logger.info('Subscription added successfully', {subscriptionId: created.id});
      return created;
    },
    onSuccess: (newSubscription) => {
      setLastSyncTime(new Date());
      if (userId) {
        queryClient.setQueryData(
          queryKeys.subscriptions.list(userId),
          (old: SubscriptionData[] | undefined) => [...(old ?? []), newSubscription],
        );
      }
    },
  });

  const updateSubscriptionMutation = useMutation<
    SubscriptionData,
    Error,
    {id: string; updates: Partial<SubscriptionData>}
  >({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SubscriptionData>;
    }): Promise<SubscriptionData> => {
      updateAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      const current = subscriptions.find((subscription) => subscription.id === id);
      if (!current) throw new Error('Subscription not found');
      const updated = {...current, ...updates, id, updatedAt: new Date().toISOString()};
      await subscriptionDatabaseService.saveSubscriptions(userId, [updated]);
      logger.info('Subscription updated successfully', {subscriptionId: id});
      return updated;
    },
    onSuccess: (updated) => {
      setLastSyncTime(new Date());
      if (userId) {
        queryClient.setQueryData<SubscriptionData[]>(
          queryKeys.subscriptions.list(userId),
          (old): SubscriptionData[] =>
            (old ?? []).map((subscription) =>
              subscription.id === updated.id ? updated : subscription,
            ),
        );
      }
    },
  });

  const deleteSubscriptionMutation = useMutation<string, Error, string>({
    mutationFn: async (id: string): Promise<string> => {
      deleteAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      await subscriptionDatabaseService.deleteSubscription(userId, id);
      logger.info('Subscription deleted successfully', {subscriptionId: id});
      return id;
    },
    onSuccess: (deletedId) => {
      setLastSyncTime(new Date());
      if (userId) {
        queryClient.setQueryData(
          queryKeys.subscriptions.list(userId),
          (old: SubscriptionData[] | undefined) =>
            (old ?? []).filter((subscription) => subscription.id !== deletedId),
        );
      }
    },
  });

  const getSubscriptionById = useCallback(
    (id: string): SubscriptionData | undefined =>
      subscriptions.find((subscription) => subscription.id === id),
    [subscriptions],
  );

  const getUpcomingRenewals = useCallback(
    (days: number = 30): SubscriptionData[] => getUpcomingSubscriptionRenewals(subscriptions, days),
    [subscriptions],
  );

  const getMonthlyCost = useCallback(
    (): number => getSubscriptionMonthlyCost(subscriptions),
    [subscriptions],
  );

  const getYearlyCost = useCallback(
    (): number => getSubscriptionYearlyCost(subscriptions),
    [subscriptions],
  );

  const pauseSubscription = useCallback(
    async (id: string): Promise<SubscriptionData> => {
      const subscription = getSubscriptionById(id);
      if (!subscription) throw new Error('Subscription not found');

      await updateSubscriptionMutation.mutateAsync({id, updates: {status: 'paused'}});
      return buildPausedSubscription(subscription);
    },
    [getSubscriptionById, updateSubscriptionMutation],
  );

  const resumeSubscription = useCallback(
    async (id: string, nextBilling?: string): Promise<SubscriptionData> => {
      const subscription = getSubscriptionById(id);
      if (!subscription) throw new Error('Subscription not found');

      const resumedSubscription = buildResumedSubscription(subscription, nextBilling);
      await updateSubscriptionMutation.mutateAsync({
        id,
        updates: {
          status: 'active',
          nextBilling: resumedSubscription.nextBilling,
        },
      });
      return resumedSubscription;
    },
    [getSubscriptionById, updateSubscriptionMutation],
  );

  const addSubscriptionPayment = useCallback(
    async (
      id: string,
      payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
    ): Promise<SubscriptionData> => {
      const subscription = getSubscriptionById(id);
      paymentAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      if (!subscription) throw new Error('Subscription not found');

      const result = await subscriptionDatabaseService.recordPaymentAtomic(
        userId,
        id,
        payment,
        payment.method.startsWith('auto')
          ? `subscription:${id}:${payment.date}`
          : Crypto.randomUUID(),
      );
      const recordedPayment: PaymentRecord = {
        ...payment,
        id: result.paymentId,
        createdAt: new Date().toISOString(),
      };
      const updated: SubscriptionData = {
        ...subscription,
        nextBilling: result.nextBilling ?? subscription.nextBilling,
        paymentHistory: [...subscription.paymentHistory, recordedPayment],
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<SubscriptionData[]>(queryKeys.subscriptions.list(userId), (old) =>
        (old ?? []).map((item) => (item.id === id ? updated : item)),
      );
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.subscriptions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)}),
      ]);
      return updated;
    },
    [getSubscriptionById, paymentAccess, queryClient, userId],
  );

  const updateSubscriptionPayment = useCallback(
    async (
      id: string,
      paymentId: string,
      updates: Partial<PaymentRecord>,
    ): Promise<SubscriptionData> => {
      const subscription = getSubscriptionById(id);
      paymentAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      if (!subscription) throw new Error('Subscription not found');

      const currentPayment = subscription.paymentHistory.find(
        (payment) => payment.id === paymentId,
      );
      if (!currentPayment) throw new Error('Subscription payment not found');
      const updatedPayment = {...currentPayment, ...updates, id: paymentId};
      await subscriptionDatabaseService.updatePaymentAtomic(userId, id, updatedPayment);
      const updated: SubscriptionData = {
        ...subscription,
        paymentHistory: subscription.paymentHistory.map((payment) =>
          payment.id === paymentId ? updatedPayment : payment,
        ),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<SubscriptionData[]>(queryKeys.subscriptions.list(userId), (old) =>
        (old ?? []).map((item) => (item.id === id ? updated : item)),
      );
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)}),
      ]);
      return updated;
    },
    [getSubscriptionById, paymentAccess, queryClient, userId],
  );

  const deleteSubscriptionPayment = useCallback(
    async (id: string, paymentId: string): Promise<void> => {
      const subscription = getSubscriptionById(id);
      paymentAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      if (!subscription) throw new Error('Subscription not found');

      await subscriptionDatabaseService.deletePayment(userId, id, paymentId);
      const updated = {
        ...subscription,
        paymentHistory: removePaymentFromSubscription(subscription, paymentId),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<SubscriptionData[]>(queryKeys.subscriptions.list(userId), (old) =>
        (old ?? []).map((item) => (item.id === id ? updated : item)),
      );
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)}),
      ]);
    },
    [getSubscriptionById, paymentAccess, queryClient, userId],
  );

  const syncWithRemote = useCallback(async (): Promise<void> => {
    setLastSyncTime(new Date());
    await queryClient.invalidateQueries({queryKey: queryKeys.subscriptions.all});
    logger.info('Subscriptions synced with remote');
  }, [queryClient]);

  const refreshSubscriptions = useCallback(async (): Promise<void> => {
    if (userId) {
      await queryClient.invalidateQueries({queryKey: queryKeys.subscriptions.list(userId)});
    }
  }, [userId, queryClient]);

  const getStats = useCallback(
    (): SubscriptionStats => buildSubscriptionStats(subscriptions, stats),
    [subscriptions, stats],
  );

  return useMemo<SubscriptionContextType>(
    () => ({
      subscriptions,
      isLoading: isQueryLoading,
      error: queryError?.message || null,
      lastSyncTime,
      stats,
      addSubscription: addSubscriptionMutation.mutateAsync,
      updateSubscription: async (id: string, updates: Partial<SubscriptionData>) => {
        return updateSubscriptionMutation.mutateAsync({id, updates});
      },
      deleteSubscription: async (id: string) => {
        await deleteSubscriptionMutation.mutateAsync(id);
      },
      pauseSubscription,
      resumeSubscription,
      addSubscriptionPayment,
      updateSubscriptionPayment,
      deleteSubscriptionPayment,
      getSubscriptionById,
      getUpcomingRenewals,
      getMonthlyCost,
      getYearlyCost,
      getStats,
      syncWithRemote,
      refreshSubscriptions,
    }),
    [
      subscriptions,
      isQueryLoading,
      queryError,
      lastSyncTime,
      stats,
      getSubscriptionById,
      getUpcomingRenewals,
      getMonthlyCost,
      getYearlyCost,
      getStats,
      pauseSubscription,
      resumeSubscription,
      addSubscriptionPayment,
      updateSubscriptionPayment,
      deleteSubscriptionPayment,
      syncWithRemote,
      refreshSubscriptions,
      addSubscriptionMutation,
      updateSubscriptionMutation,
      deleteSubscriptionMutation,
    ],
  );
};
