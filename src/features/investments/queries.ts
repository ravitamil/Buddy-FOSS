import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useFeatureStatus} from '@/features/featureControls';
import {investmentService} from './service';

export function useInvestments(userId: string, portfolioId?: string) {
  const feature = useFeatureStatus('investments');
  return useQuery({
    queryKey: portfolioId
      ? queryKeys.investments.byPortfolio(userId, portfolioId)
      : queryKeys.investments.list(userId),
    queryFn: () => investmentService.getAll(userId, portfolioId),
    enabled: !!userId && feature.canRead,
  });
}

export function usePortfolios(userId: string) {
  const feature = useFeatureStatus('investments');
  return useQuery({
    queryKey: queryKeys.investments.portfolios.list(userId),
    queryFn: () => investmentService.getPortfolios(userId),
    enabled: !!userId && feature.canRead,
  });
}

export function useInvestmentCategories(userId: string) {
  const feature = useFeatureStatus('investments');
  return useQuery({
    queryKey: queryKeys.investments.categories.list(userId),
    queryFn: () => investmentService.getCategories(userId),
    enabled: !!userId && feature.canRead,
  });
}
