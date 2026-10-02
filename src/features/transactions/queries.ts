import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls';
import {transactionService} from './service';

export function useTransactions(userId: string) {
  const feature = useFeatureStatus('transactions');
  return useQuery({
    queryKey: queryKeys.transactions.list(userId),
    queryFn: () => transactionService.getAll(userId),
    enabled: !!userId && feature.canRead,
  });
}
