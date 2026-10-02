import React, {createContext, useContext} from 'react';

import type {CategoryContextType} from '@/features/categories/context/categoryContextTypes';
import {useCategoryProviderValue} from '@/features/categories/context/useCategoryProviderValue';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: React.ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({children}) => {
  const contextValue = useCategoryProviderValue();

  return <CategoryContext.Provider value={contextValue}>{children}</CategoryContext.Provider>;
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

export type {CategoryContextType} from '@/features/categories/context/categoryContextTypes';

export default CategoryContext;
