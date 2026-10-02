import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls/hooks';
import {subscriptionService} from './service';

export function useSubscriptions(userId: string) {
  const feature = useFeatureStatus('subscriptions');
  return useQuery({
    queryKey: queryKeys.subscriptions.list(userId),
    queryFn: () => subscriptionService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
