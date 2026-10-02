import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls';
import {savingsService} from './service';

export function useSavings(userId: string) {
  const feature = useFeatureStatus('savings');
  return useQuery({
    queryKey: queryKeys.savings.list(userId),
    queryFn: () => savingsService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
