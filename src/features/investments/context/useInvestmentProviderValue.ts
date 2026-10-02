import {useCallback, useMemo, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';

import {investmentService} from '../service';
import {queryKeys} from '@/lib/query-keys';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';
import type {Investment, InvestmentCategory} from '@/types';
import {
  applyMockInvestmentPriceUpdate,
  getInvestmentGainLoss,
  getInvestmentTotalCost,
  getInvestmentTotalValue,
} from './investmentCalculations';
import type {InvestmentContextType} from './investmentContextTypes';
import {DEFAULT_INVESTMENT_CATEGORIES} from './investmentDefaults';
import {getErrorMessage} from './investmentProviderModel';
import {useInvestmentMutations} from './useInvestmentMutations';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';

const logger = appLogger.contextLogger('InvestmentContext');

export const useInvestmentProviderValue = (): InvestmentContextType => {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.uid ?? '';
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const updateAccess = useFeatureActionGuard('investments.update');
  const feature = useFeatureStatus('investments');

  const {
    data: investmentCategories = DEFAULT_INVESTMENT_CATEGORIES,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: queryKeys.investments.categories.list(userId),
    queryFn: async () => {
      if (!user) return DEFAULT_INVESTMENT_CATEGORIES;
      logger.info('Fetching investment categories from Supabase...');
      const remoteCategories = await investmentService.getCategories(user.uid);

      if (remoteCategories.length === 0) {
        return DEFAULT_INVESTMENT_CATEGORIES;
      }

      return remoteCategories;
    },
    enabled: Boolean(user && feature.canRead),
  });

  const {
    data: investments = [],
    isLoading: isInvestmentsLoading,
    error: investmentsError,
  } = useQuery({
    queryKey: queryKeys.investments.list(userId),
    queryFn: async () => {
      if (!user) return [];
      logger.info('Fetching investments from Supabase...');
      return investmentService.getAll(user.uid);
    },
    enabled: Boolean(user && feature.canRead),
  });

  const error = useMemo(() => {
    const catErr = getErrorMessage(categoriesError);
    const invErr = getErrorMessage(investmentsError);
    return catErr || invErr || null;
  }, [categoriesError, investmentsError]);

  const {
    addCategoryMutation,
    addInvestmentMutation,
    deleteCategoryMutation,
    deleteInvestmentMutation,
    updateCategoryMutation,
    updateInvestmentMutation,
  } = useInvestmentMutations({
    investmentCategories,
    investments,
    userId,
  });

  const addInvestment = useCallback(
    async (data: Omit<Investment, 'id' | 'lastUpdated' | 'createdAt'>) =>
      addInvestmentMutation.mutateAsync(data),
    [addInvestmentMutation],
  );

  const updateInvestment = useCallback(
    async (id: string, updates: Partial<Investment>) =>
      updateInvestmentMutation.mutateAsync({id, updates}),
    [updateInvestmentMutation],
  );

  const deleteInvestment = useCallback(
    async (id: string) => {
      await deleteInvestmentMutation.mutateAsync(id);
    },
    [deleteInvestmentMutation],
  );

  const addInvestmentCategory = useCallback(
    async (category: Omit<InvestmentCategory, 'id'>) => addCategoryMutation.mutateAsync(category),
    [addCategoryMutation],
  );

  const updateInvestmentCategory = useCallback(
    async (id: string, updates: Partial<InvestmentCategory>) =>
      updateCategoryMutation.mutateAsync({id, updates}),
    [updateCategoryMutation],
  );

  const deleteInvestmentCategory = useCallback(
    async (id: string) => {
      await deleteCategoryMutation.mutateAsync(id);
    },
    [deleteCategoryMutation],
  );

  const getInvestmentById = useCallback(
    (id: string): Investment | undefined => investments.find((investment) => investment.id === id),
    [investments],
  );

  const getTotalValue = useCallback(
    (): number => getInvestmentTotalValue(investments),
    [investments],
  );

  const getTotalCost = useCallback(
    (): number => getInvestmentTotalCost(investments),
    [investments],
  );

  const getTotalGainLoss = useCallback(
    (): {amount: number; percentage: number} => getInvestmentGainLoss(investments),
    [investments],
  );

  const syncWithRemote = useCallback(async (): Promise<void> => {
    if (!userId) return;
    await queryClient.invalidateQueries({queryKey: queryKeys.investments.list(userId)});
    await queryClient.invalidateQueries({queryKey: queryKeys.investments.categories.list(userId)});
    setLastSyncTime(new Date());
    logger.info('Investments synced with remote successfully');
  }, [queryClient, userId]);

  const updatePrices = useCallback(async (): Promise<void> => {
    updateAccess.assertAllowed();
    const updatedInvestments = applyMockInvestmentPriceUpdate(investments);

    if (user) {
      await investmentService.saveMany(user.uid, updatedInvestments);
      queryClient.setQueryData(queryKeys.investments.list(user.uid), updatedInvestments);
    }
    logger.info('Investment prices updated');
  }, [investments, queryClient, updateAccess, user]);

  const isLoading =
    isCategoriesLoading ||
    isInvestmentsLoading ||
    addInvestmentMutation.isPending ||
    updateInvestmentMutation.isPending ||
    deleteInvestmentMutation.isPending ||
    addCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  return useMemo<InvestmentContextType>(
    () => ({
      investments,
      investmentCategories,
      isLoading,
      error,
      lastSyncTime,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addInvestmentCategory,
      updateInvestmentCategory,
      deleteInvestmentCategory,
      getInvestmentById,
      getTotalValue,
      getTotalCost,
      getTotalGainLoss,
      syncWithRemote,
      updatePrices,
    }),
    [
      investments,
      investmentCategories,
      isLoading,
      error,
      lastSyncTime,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addInvestmentCategory,
      updateInvestmentCategory,
      deleteInvestmentCategory,
      getInvestmentById,
      getTotalValue,
      getTotalCost,
      getTotalGainLoss,
      syncWithRemote,
      updatePrices,
    ],
  );
};
