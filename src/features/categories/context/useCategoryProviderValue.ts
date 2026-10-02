import {useCallback, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {categoryService} from '../service';
import {queryKeys} from '@/lib/query-keys';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category} from '@/types';
import {DEFAULT_CATEGORIES} from './categoryDefaults';
import type {CategoryContextType} from './categoryContextTypes';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';

const logger = appLogger.contextLogger('CategoryContext');

export const useCategoryProviderValue = (): CategoryContextType => {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const createAccess = useFeatureActionGuard('categories.create');
  const updateAccess = useFeatureActionGuard('categories.update');
  const deleteAccess = useFeatureActionGuard('categories.delete');
  const feature = useFeatureStatus('categories');

  const {
    data: categories = DEFAULT_CATEGORIES,
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.categories.list(user?.uid ?? ''),
    queryFn: async () => {
      if (!user) return DEFAULT_CATEGORIES;

      logger.info('Fetching categories from Supabase...');
      const remoteCategories = await categoryService.getAll(user.uid);

      if (remoteCategories.length === 0) {
        return DEFAULT_CATEGORIES;
      }

      return remoteCategories;
    },
    enabled: Boolean(user && feature.canRead),
  });

  const addMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      createAccess.assertAllowed();
      if (!user) throw new Error('User not authenticated');
      const newCategory: Category = {
        ...category,
        id: Crypto.randomUUID(),
        isSystem: false,
      };
      await categoryService.create(user.uid, newCategory);
      return newCategory;
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData(
        queryKeys.categories.list(user?.uid ?? ''),
        (old: Category[] = []) => [...old, newCategory],
      );
      logger.info('Category added successfully', {categoryId: newCategory.id});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<Category>}) => {
      updateAccess.assertAllowed();
      if (!user) throw new Error('User not authenticated');
      const current = categories.find((category) => category.id === id);
      if (!current) throw new Error('Category not found');
      const updatedCategory = {...current, ...updates};
      await categoryService.update(user.uid, updatedCategory);
      return updatedCategory;
    },
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(queryKeys.categories.list(user?.uid ?? ''), (old: Category[] = []) =>
        old.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
      );
      logger.info('Category updated successfully', {categoryId: updatedCategory.id});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteAccess.assertAllowed();
      if (!user) throw new Error('User not authenticated');
      await categoryService.delete(user.uid, id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(queryKeys.categories.list(user?.uid ?? ''), (old: Category[] = []) =>
        old.filter((category) => category.id !== deletedId),
      );
      logger.info('Category deleted successfully', {categoryId: deletedId});
    },
  });

  const error = useMemo(() => {
    return (
      queryError?.message ||
      addMutation.error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      null
    );
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  const addCategory = useCallback(
    (category: Omit<Category, 'id'>) => addMutation.mutateAsync(category),
    [addMutation],
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => updateMutation.mutateAsync({id, updates}),
    [updateMutation],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const updateCategoryName = useCallback(
    async (id: string, name: string): Promise<void> => {
      await updateCategory(id, {name});
    },
    [updateCategory],
  );

  const addManyCategories = useCallback(
    async (categoriesData: Omit<Category, 'id'>[]): Promise<Category[]> => {
      createAccess.assertAllowed();
      if (!user) throw new Error('User not authenticated');
      const newCategories = categoriesData.map((category) => ({
        ...category,
        id: Crypto.randomUUID(),
        isSystem: false,
      }));
      await categoryService.saveMany(user.uid, newCategories);
      queryClient.setQueryData(queryKeys.categories.list(user.uid), (old: Category[] = []) => [
        ...old,
        ...newCategories,
      ]);
      return newCategories;
    },
    [createAccess, queryClient, user],
  );

  const deleteManyCategories = useCallback(
    async (ids: string[]): Promise<void> => {
      deleteAccess.assertAllowed();
      if (!user) throw new Error('User not authenticated');
      for (const id of ids) {
        await categoryService.delete(user.uid, id);
      }
      queryClient.setQueryData(queryKeys.categories.list(user.uid), (old: Category[] = []) =>
        old.filter((category) => !ids.includes(category.id)),
      );
    },
    [deleteAccess, queryClient, user],
  );

  const getCategoryById = useCallback(
    (id: string): Category | undefined => categories.find((category) => category.id === id),
    [categories],
  );

  const getCategoryByName = useCallback(
    (name: string): Category | undefined =>
      categories.find((category) => category.name.toLowerCase() === name.toLowerCase()),
    [categories],
  );

  const findCategories = useCallback(
    (predicate: (category: Category) => boolean): Category[] => categories.filter(predicate),
    [categories],
  );

  const validateCategoryDeletion = useCallback(
    (id: string, transactionCount: number = 0): {canDelete: boolean; reason: string} => {
      const category = getCategoryById(id);
      if (!category) return {canDelete: false, reason: 'Category not found'};
      if (transactionCount > 0) {
        return {
          canDelete: false,
          reason: `Category has ${transactionCount} associated transactions`,
        };
      }
      if (category.isSystem)
        return {canDelete: false, reason: 'System categories cannot be deleted'};
      return {canDelete: true, reason: ''};
    },
    [getCategoryById],
  );

  const validateCategoryName = useCallback(
    (name: string, excludeId?: string): {isValid: boolean; reason?: string} => {
      if (!name || name.trim().length === 0) {
        return {isValid: false, reason: 'Category name is required'};
      }
      if (name.trim().length < 2) {
        return {isValid: false, reason: 'Category name must be at least 2 characters long'};
      }

      const existingCategory = categories.find(
        (category) =>
          category.name.toLowerCase() === name.toLowerCase() && category.id !== excludeId,
      );
      if (existingCategory) {
        return {isValid: false, reason: 'A category with this name already exists'};
      }

      return {isValid: true};
    },
    [categories],
  );

  const exportCategories = useCallback(
    () => ({
      categories: [...categories],
      exportDate: new Date(),
      version: '1.0.0',
    }),
    [categories],
  );

  const syncWithRemote = useCallback(async (): Promise<void> => {
    if (!user) return;
    await queryClient.invalidateQueries({queryKey: queryKeys.categories.list(user.uid)});
    setLastSyncTime(new Date());
    logger.info('Categories synced with remote successfully');
  }, [queryClient, user]);

  const syncEntityWithRemote = useCallback(async (_id: string): Promise<void> => {
    // Category CRUD already writes through the remote service.
  }, []);

  const loadFromRemote = useCallback(async (): Promise<void> => {
    if (!user) return;
    await queryClient.refetchQueries({queryKey: queryKeys.categories.list(user.uid)});
    setLastSyncTime(new Date());
    logger.info('Categories loaded from remote successfully');
  }, [queryClient, user]);

  const isLoading =
    isQueryLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return useMemo<CategoryContextType>(
    () => ({
      categories,
      isLoading,
      error,
      lastSyncTime,
      addCategory,
      updateCategory,
      updateCategoryName,
      deleteCategory,
      addManyCategories,
      deleteManyCategories,
      getCategoryById,
      getCategoryByName,
      findCategories,
      validateCategoryDeletion,
      validateCategoryName,
      exportCategories,
      syncWithRemote,
      syncEntityWithRemote,
      loadFromRemote,
    }),
    [
      categories,
      isLoading,
      error,
      lastSyncTime,
      addCategory,
      updateCategory,
      updateCategoryName,
      deleteCategory,
      addManyCategories,
      deleteManyCategories,
      getCategoryById,
      getCategoryByName,
      findCategories,
      validateCategoryDeletion,
      validateCategoryName,
      exportCategories,
      syncWithRemote,
      syncEntityWithRemote,
      loadFromRemote,
    ],
  );
};
