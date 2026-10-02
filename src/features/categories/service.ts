import {categoryDatabaseService} from '@/services/CategoryDatabaseService';
import type {Category} from './types';

export const categoryService = {
  getAll: (userId: string) => categoryDatabaseService.getCategories(userId),
  saveMany: (userId: string, categories: Category[]) =>
    categoryDatabaseService.saveCategories(userId, categories),
  create: (userId: string, category: Category) =>
    categoryDatabaseService.saveCategories(userId, [category]),
  update: (userId: string, category: Category) =>
    categoryDatabaseService.saveCategories(userId, [category]),
  delete: (userId: string, id: string) => categoryDatabaseService.deleteCategory(userId, id),
};
