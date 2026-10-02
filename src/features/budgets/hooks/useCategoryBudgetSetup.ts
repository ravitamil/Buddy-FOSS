import {useCallback, useMemo, useState} from 'react';
import type {Category, CategoryBudgetAllocation} from '@/types';

interface UseCategoryBudgetSetupParams {
  allocations: CategoryBudgetAllocation[];
  categories: Category[];
  currencySymbol: string;
  onAllocationsChange: (allocations: CategoryBudgetAllocation[]) => void;
  totalBudget: number;
}

export function useCategoryBudgetSetup({
  allocations,
  categories,
  currencySymbol,
  onAllocationsChange,
  totalBudget,
}: UseCategoryBudgetSetupParams) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, allocation) => sum + allocation.amount, 0),
    [allocations],
  );
  const remainingBudget = totalBudget - totalAllocated;
  const allocationPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;
  const unallocatedCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          (category.type === 'expense' || !category.type) &&
          !allocations.some((allocation) => allocation.categoryId === category.id),
      ),
    [allocations, categories],
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      if (amount >= 100000) {
        return `${currencySymbol}${(amount / 100000).toFixed(1)}L`;
      }
      if (amount >= 1000) {
        return `${currencySymbol}${(amount / 1000).toFixed(1)}K`;
      }
      return `${currencySymbol}${amount.toFixed(0)}`;
    },
    [currencySymbol],
  );

  const handleSetAllocation = useCallback(
    (categoryId: string, amount: number) => {
      const category = categories.find((item) => item.id === categoryId);
      if (!category) return;

      const existingIndex = allocations.findIndex(
        (allocation) => allocation.categoryId === categoryId,
      );
      const newAllocations =
        existingIndex >= 0
          ? allocations.map((allocation, index) =>
              index === existingIndex ? {...allocation, amount} : allocation,
            )
          : [
              ...allocations,
              {
                categoryId,
                categoryName: category.name,
                amount,
                color: category.color,
                icon: category.icon,
                alertThreshold: 80,
              },
            ];

      onAllocationsChange(newAllocations);
      setSelectedCategory(null);
      setInputValue('');
    },
    [allocations, categories, onAllocationsChange],
  );

  const handleRemoveAllocation = useCallback(
    (categoryId: string) => {
      onAllocationsChange(allocations.filter((allocation) => allocation.categoryId !== categoryId));
    },
    [allocations, onAllocationsChange],
  );

  const handleQuickAllocate = useCallback(
    (percentage: number) => {
      const amount = (totalBudget * percentage) / 100;
      if (unallocatedCategories.length === 0) return;

      const amountPerCategory = amount / unallocatedCategories.length;
      const newAllocations = unallocatedCategories.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        amount: Math.floor(amountPerCategory),
        color: category.color,
        icon: category.icon,
        alertThreshold: 80,
      }));

      onAllocationsChange([...allocations, ...newAllocations]);
    },
    [allocations, onAllocationsChange, totalBudget, unallocatedCategories],
  );

  const selectAllocationForEdit = useCallback((categoryId: string, amount: number) => {
    setSelectedCategory(categoryId);
    setInputValue(amount.toString());
  }, []);

  const selectCategoryForAllocation = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setInputValue('');
  }, []);

  const clearSelectedCategory = useCallback(() => {
    setSelectedCategory(null);
    setInputValue('');
  }, []);

  return {
    allocationPercentage,
    clearSelectedCategory,
    formatCurrency,
    handleQuickAllocate,
    handleRemoveAllocation,
    handleSetAllocation,
    inputValue,
    remainingBudget,
    selectAllocationForEdit,
    selectCategoryForAllocation,
    selectedCategory,
    setInputValue,
    totalAllocated,
    unallocatedCategories,
  };
}
