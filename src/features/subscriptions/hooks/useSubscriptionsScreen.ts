import {useCallback, useState} from 'react';
import {useRouter} from 'expo-router';

import {useSettings} from '@/context';
import {useSubscriptionQuery as useSubscription} from '@/context/SubscriptionContext.query';
import {logger as appLogger} from '@/services/LoggerService';

export function useSubscriptionsScreen() {
  const router = useRouter();
  const {formatCurrency} = useSettings();
  const {subscriptions, refreshSubscriptions, isLoading} = useSubscription();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSubscriptions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshSubscriptions]);

  const handleRefreshPress = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const handleViewSubscription = useCallback(
    (subscriptionId: string) => {
      appLogger.debug('SubscriptionsScreen: Navigating to subscription details', {
        subscriptionId,
      });
      router.push(`/subscription-detail/${subscriptionId}`);
    },
    [router],
  );

  const handleAddSubscription = useCallback(() => {
    appLogger.debug('SubscriptionsScreen: Navigating to add subscription');
    router.push('/add-edit-subscription');
  }, [router]);

  return {
    formatCurrency,
    handleAddSubscription,
    handleRefreshPress,
    handleViewSubscription,
    hasSubscriptionsData: subscriptions.length > 0,
    isLoading,
    refreshing,
    subscriptions,
  };
}
