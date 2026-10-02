import {useMutation, useQueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {investmentService} from '../service';
import {queryKeys} from '@/lib/query-keys';
import {logger as appLogger} from '@/services/LoggerService';
import type {Investment, InvestmentCategory} from '@/types';
import {useFeatureActionGuard} from '@/features/featureControls';
import {
  appendItem,
  createInvestment,
  createInvestmentCategory,
  removeItemById,
  replaceItemById,
  updateExistingCategory,
  updateExistingInvestment,
} from './investmentProviderModel';

const logger = appLogger.contextLogger('InvestmentContext');

interface UseInvestmentMutationsInput {
  investmentCategories: InvestmentCategory[];
  investments: Investment[];
  userId: string;
}

export const useInvestmentMutations = ({
  investmentCategories,
  investments,
  userId,
}: UseInvestmentMutationsInput) => {
  const queryClient = useQueryClient();
  const investmentKey = queryKeys.investments.list(userId);
  const categoryKey = queryKeys.investments.categories.list(userId);
  const createAccess = useFeatureActionGuard('investments.create');
  const updateAccess = useFeatureActionGuard('investments.update');
  const deleteAccess = useFeatureActionGuard('investments.delete');
  const saveCategoryAccess = useFeatureActionGuard('investments.saveCategory');
  const deleteCategoryAccess = useFeatureActionGuard('investments.deleteCategory');

  const addInvestmentMutation = useMutation({
    mutationFn: async (data: Omit<Investment, 'id' | 'lastUpdated' | 'createdAt'>) => {
      createAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const investment = createInvestment(data, Crypto.randomUUID(), new Date());
      await investmentService.create(userId, investment);
      return investment;
    },
    onSuccess: (investment) => {
      queryClient.setQueryData(investmentKey, (old: Investment[] = []) =>
        appendItem(old, investment),
      );
      logger.info('Investment added successfully', {investmentId: investment.id});
    },
  });

  const updateInvestmentMutation = useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<Investment>}) => {
      updateAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const investment = updateExistingInvestment(investments, id, updates, new Date());
      await investmentService.update(userId, investment);
      return investment;
    },
    onSuccess: (investment) => {
      queryClient.setQueryData(investmentKey, (old: Investment[] = []) =>
        replaceItemById(old, investment),
      );
      logger.info('Investment updated successfully', {investmentId: investment.id});
    },
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      await investmentService.delete(userId, id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(investmentKey, (old: Investment[] = []) => removeItemById(old, id));
      logger.info('Investment deleted successfully', {investmentId: id});
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (data: Omit<InvestmentCategory, 'id'>) => {
      saveCategoryAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const category = createInvestmentCategory(data, Crypto.randomUUID());
      await investmentService.saveCategories(userId, [category]);
      return category;
    },
    onSuccess: (category) => {
      queryClient.setQueryData(categoryKey, (old: InvestmentCategory[] = []) =>
        appendItem(old, category),
      );
      logger.info('Investment category added successfully', {categoryId: category.id});
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<InvestmentCategory>}) => {
      saveCategoryAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      const category = updateExistingCategory(investmentCategories, id, updates);
      await investmentService.saveCategories(userId, [category]);
      return category;
    },
    onSuccess: (category) => {
      queryClient.setQueryData(categoryKey, (old: InvestmentCategory[] = []) =>
        replaceItemById(old, category),
      );
      logger.info('Investment category updated successfully', {categoryId: category.id});
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteCategoryAccess.assertAllowed();
      if (!userId) throw new Error('User not authenticated');
      await investmentService.deleteCategory(userId, id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(categoryKey, (old: InvestmentCategory[] = []) =>
        removeItemById(old, id),
      );
      logger.info('Investment category deleted successfully', {categoryId: id});
    },
  });

  return {
    addCategoryMutation,
    addInvestmentMutation,
    deleteCategoryMutation,
    deleteInvestmentMutation,
    updateCategoryMutation,
    updateInvestmentMutation,
  };
};
