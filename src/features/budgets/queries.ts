import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls';
import {budgetService} from './service';

export function useBudgets(userId: string) {
  const feature = useFeatureStatus('budgets');
  return useQuery({
    queryKey: queryKeys.budgets.list(userId),
    queryFn: () => budgetService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
