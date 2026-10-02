import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls';
import {categoryService} from './service';

export function useCategories(userId: string) {
  const feature = useFeatureStatus('categories');
  return useQuery({
    queryKey: queryKeys.categories.list(userId),
    queryFn: () => categoryService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
