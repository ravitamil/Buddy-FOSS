import {useCallback, useMemo} from 'react';
import {useRouter} from 'expo-router';

import {useCategory} from '@/context/CategoryContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category} from '@/types';

export interface UseCategoriesScreenResult {
  categoryGroups: {
    expense: Category[];
    income: Category[];
  };
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  isDarkMode: boolean;
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  handleAddCategory: () => void;
  handleBack: () => void;
  handleDeleteCategory: (categoryId: string) => void;
  handleEditCategory: (category: Category) => void;
  isMandatoryCategory: (category: Category) => boolean;
}

export const useCategoriesScreen = (): UseCategoriesScreenResult => {
  appLogger.debug('CategoriesScreen: component rendering started');

  const router = useRouter();
  const {isDarkMode} = useTamaguiTheme();
  const {categories, deleteCategory} = useCategory();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();

  const categoryGroups = useMemo(
    () => ({
      expense: categories.filter((category) => category.type === 'expense'),
      income: categories.filter((category) => category.type === 'income'),
    }),
    [categories],
  );

  const handleBack = useCallback(() => {
    appLogger.debug('CategoriesScreen: back button pressed via CustomNavigationHeader');
    router.back();
  }, [router]);

  const handleAddCategory = useCallback(() => {
    appLogger.debug('CategoriesScreen: navigating to manage categories for adding');
    router.push('/manage-categories');
  }, [router]);

  const handleEditCategory = useCallback(
    (category: Category) => {
      appLogger.debug(
        'CategoriesScreen: navigating to manage categories for editing:',
        category.name,
      );
      router.push('/manage-categories');
    },
    [router],
  );

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      showAlert({
        title: 'Delete Category',
        message: 'Are you sure you want to delete this category?',
        actions: [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  await deleteCategory(categoryId);
                } catch (error) {
                  appLogger.error('Error deleting category:', error);
                }
              })();
            },
          },
        ],
      });
    },
    [deleteCategory, showAlert],
  );

  const isMandatoryCategory = useCallback((category: Category) => Boolean(category.isSystem), []);

  return {
    categoryGroups,
    headerProps,
    isDarkMode,
    onScroll,
    handleAddCategory,
    handleBack,
    handleDeleteCategory,
    handleEditCategory,
    isMandatoryCategory,
  };
};
