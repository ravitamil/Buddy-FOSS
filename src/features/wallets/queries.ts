import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureAction, useFeatureStatus} from '@/features/featureControls';
import {walletService} from './service';

export function useWallets(userId: string) {
  const feature = useFeatureStatus('wallets');
  const createAction = useFeatureAction('wallets.create');
  return useQuery({
    queryKey: queryKeys.wallets.list(userId),
    queryFn: async () => {
      const wallets = await walletService.getAll(userId);
      if (wallets.length > 0 || !createAction.isAllowed) return wallets;
      return walletService.seedDefaults(userId);
    },
    enabled: !!userId && feature.canRead,
  });
}
