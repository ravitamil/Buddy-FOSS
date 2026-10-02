import type {QueryClient} from '@tanstack/react-query';

import {queryKeys} from '../lib/query-keys';

export type GroupRealtimeInvalidationEvent = 'group' | 'member' | 'groupTransaction';

export const invalidateGroupRealtimeCaches = (
  queryClient: Pick<QueryClient, 'invalidateQueries'>,
  userId: string,
  event: GroupRealtimeInvalidationEvent,
): void => {
  void queryClient.invalidateQueries({queryKey: queryKeys.groups.list(userId)});

  if (event !== 'groupTransaction') return;

  void queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)});
  void queryClient.invalidateQueries({queryKey: queryKeys.budgets.list(userId)});
  void queryClient.invalidateQueries({queryKey: queryKeys.budgets.active(userId)});
};
