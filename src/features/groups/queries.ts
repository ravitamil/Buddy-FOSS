import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls/hooks';
import {groupService} from './service';

export function useGroups(userId: string) {
  const feature = useFeatureStatus('groups');
  return useQuery({
    queryKey: queryKeys.groups.list(userId),
    queryFn: () => groupService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
