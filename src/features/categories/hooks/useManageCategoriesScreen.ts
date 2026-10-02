import {useCallback, useMemo, useState} from 'react';
import {router} from 'expo-router';

import {useCategory} from '@/context/CategoryContext';
import {useInvestment} from '@/context/InvestmentContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category, InvestmentCategory} from '@/types';

export type ManageCategoryFilter = 'all' | 'expense' | 'income' | 'investment';

export interface CategoryTypeCounts {
  expense: number;
  income: number;
  investment: number;
  total: number;
}

export interface UseManageCategoriesScreenResult {
  categoryFilter: ManageCategoryFilter;
  categoryGroups: {
    expense: Category[];
    income: Category[];
  };
  investmentCategories: InvestmentCategory[];
  totalCounts: CategoryTypeCounts;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isScrollingDown: ReturnType<typeof useProgressiveBlurHeader>['isScrollingDown'];
  setCategoryFilter: (filter: ManageCategoryFilter) => void;
  clearErrorMessage: () => void;
  handleAddCategory: () => void;
  handleBack: () => void;
  handleEditCategory: (category: Category) => void;
  handleEditInvestmentCategory: (category: InvestmentCategory) => void;
  handleDeleteCategory: (categoryId: string) => void;
  handleDeleteInvestmentCategory: (categoryId: string) => void;
  isMandatoryCategory: (category: Category) => boolean;
  isMandatoryInvestmentCategory: (category: InvestmentCategory) => boolean;
}

export const useManageCategoriesScreen = (): UseManageCategoriesScreenResult => {
  appLogger.debug('ManageCategoriesScreen: component rendering started');

  const {categories, deleteCategory} = useCategory();
  const {investmentCategories, deleteInvestmentCategory} = useInvestment();
  const {showAlert} = useAlert();
  const {onScroll, isScrollingDown, headerProps} = useProgressiveBlurHeader({
    headerHeight: 75,
    largeTitleFadeDistance: 40,
    showBackButtonInNonBlur: true,
  });

  const [categoryFilter, setCategoryFilter] = useState<ManageCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rawExpenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories],
  );

  const rawIncomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'income'),
    [categories],
  );

  const rawInvestmentCategories = useMemo(() => investmentCategories || [], [investmentCategories]);

  const totalCounts = useMemo<CategoryTypeCounts>(
    () => ({
      expense: rawExpenseCategories.length,
      income: rawIncomeCategories.length,
      investment: rawInvestmentCategories.length,
      total:
        rawExpenseCategories.length + rawIncomeCategories.length + rawInvestmentCategories.length,
    }),
    [rawExpenseCategories.length, rawIncomeCategories.length, rawInvestmentCategories.length],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryGroups = useMemo(() => {
    if (!normalizedQuery) {
      return {
        expense: rawExpenseCategories,
        income: rawIncomeCategories,
      };
    }

    return {
      expense: rawExpenseCategories.filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      ),
      income: rawIncomeCategories.filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      ),
    };
  }, [normalizedQuery, rawExpenseCategories, rawIncomeCategories]);

  const visibleInvestmentCategories = useMemo(() => {
    if (!normalizedQuery) {
      return rawInvestmentCategories;
    }

    return rawInvestmentCategories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, rawInvestmentCategories]);

  const handleBack = useCallback(() => router.back(), []);
  const handleAddCategory = useCallback(() => router.push('/add-category'), []);
  const clearErrorMessage = useCallback(() => setErrorMessage(null), []);
  const isMandatoryCategory = useCallback((category: Category) => Boolean(category.isSystem), []);
  const isMandatoryInvestmentCategory = useCallback(
    (category: InvestmentCategory) => Boolean(category.isSystem),
    [],
  );

  const handleEditCategory = useCallback((category: Category) => {
    if (category.isSystem) return;

    router.push(appRoutes.editCategory(category.id));
  }, []);

  const handleEditInvestmentCategory = useCallback((category: InvestmentCategory) => {
    if (category.isSystem) return;

    router.push(appRoutes.editCategory(category.id, 'investment'));
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      showAlert({
        title: 'Delete Category',
        message: 'Are you sure you want to delete this category? This action cannot be undone.',
        actions: [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                  await deleteCategory(categoryId);
                  appLogger.debug('ManageCategoriesScreen: category deleted successfully');
                  showSuccess('Category deleted.');
                } catch (error) {
                  appLogger.error('ManageCategoriesScreen: error deleting category', error);
                  setErrorMessage(
                    error instanceof Error
                      ? error.message
                      : 'Failed to delete category. Please try again.',
                  );
                } finally {
                  setIsLoading(false);
                }
              })();
            },
          },
        ],
      });
    },
    [deleteCategory, showAlert, showSuccess],
  );

  const handleDeleteInvestmentCategory = useCallback(
    (categoryId: string) => {
      showAlert({
        title: 'Delete Investment Category',
        message:
          'Are you sure you want to delete this investment category? This action cannot be undone.',
        actions: [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                  await deleteInvestmentCategory(categoryId);
                  appLogger.debug(
                    'ManageCategoriesScreen: investment category deleted successfully',
                  );
                  showSuccess('Investment category deleted.');
                } catch (error) {
                  appLogger.error(
                    'ManageCategoriesScreen: error deleting investment category',
                    error,
                  );
                  setErrorMessage(
                    error instanceof Error
                      ? error.message
                      : 'Failed to delete investment category. Please try again.',
                  );
                } finally {
                  setIsLoading(false);
                }
              })();
            },
          },
        ],
      });
    },
    [deleteInvestmentCategory, showAlert, showSuccess],
  );

  return {
    categoryFilter,
    categoryGroups,
    investmentCategories: visibleInvestmentCategories,
    totalCounts,
    searchQuery,
    setSearchQuery,
    isLoading,
    errorMessage,
    successMessage,
    headerProps,
    onScroll,
    isScrollingDown,
    setCategoryFilter,
    clearErrorMessage,
    handleAddCategory,
    handleBack,
    handleEditCategory,
    handleEditInvestmentCategory,
    handleDeleteCategory,
    handleDeleteInvestmentCategory,
    isMandatoryCategory,
    isMandatoryInvestmentCategory,
  };
};
