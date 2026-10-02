import {queryKeys} from '../../lib/query-keys';
import {
  invalidateGroupRealtimeCaches,
  type GroupRealtimeInvalidationEvent,
} from '../../services/GroupRealtimeInvalidation';

const createQueryClientMock = () => ({
  invalidateQueries: jest.fn(),
});

describe('cross-entity realtime cache invalidation', () => {
  const userId = 'user-123';

  it.each<GroupRealtimeInvalidationEvent>(['group', 'member'])(
    'invalidates only group caches for %s changes',
    (event) => {
      const queryClient = createQueryClientMock();

      invalidateGroupRealtimeCaches(queryClient, userId, event);

      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.groups.list(userId),
      });
    },
  );

  it('invalidates group, transaction, and budget caches for group transaction changes', () => {
    const queryClient = createQueryClientMock();

    invalidateGroupRealtimeCaches(queryClient, userId, 'groupTransaction');

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(4);
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: queryKeys.groups.list(userId),
    });
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: queryKeys.transactions.list(userId),
    });
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: queryKeys.budgets.list(userId),
    });
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: queryKeys.budgets.active(userId),
    });
  });
});
