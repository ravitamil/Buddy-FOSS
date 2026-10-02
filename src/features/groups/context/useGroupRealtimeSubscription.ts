import {useEffect} from 'react';
import type {QueryClient} from '@tanstack/react-query';

import {invalidateGroupRealtimeCaches} from '@/services/GroupRealtimeInvalidation';
import {subscribeToUserGroupChanges} from '@/services/GroupRealtimeService';

interface GroupRealtimeLogger {
  info: (message: string, metadata?: Record<string, unknown>) => void;
}

interface UseGroupRealtimeSubscriptionParams {
  userId?: string | null;
  queryClient: QueryClient;
  logger: GroupRealtimeLogger;
}

export const useGroupRealtimeSubscription = ({
  userId,
  queryClient,
  logger,
}: UseGroupRealtimeSubscriptionParams): void => {
  useEffect(() => {
    if (!userId) return;

    logger.info('Setting up group realtime subscription', {userId});

    const subscription = subscribeToUserGroupChanges(userId, {
      onGroupChanged: () => invalidateGroupRealtimeCaches(queryClient, userId, 'group'),
      onMemberChanged: () => invalidateGroupRealtimeCaches(queryClient, userId, 'member'),
      onGroupTransactionChanged: () => {
        invalidateGroupRealtimeCaches(queryClient, userId, 'groupTransaction');
      },
    });

    return () => {
      logger.info('Cleaning up group realtime subscription', {userId});
      subscription.unsubscribe();
    };
  }, [userId, queryClient, logger]);
};
