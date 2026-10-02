import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls/hooks';
import {loanService} from './service';

export function useLoans(userId: string) {
  const feature = useFeatureStatus('loans');
  return useQuery({
    queryKey: queryKeys.loans.list(userId),
    queryFn: () => loanService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
