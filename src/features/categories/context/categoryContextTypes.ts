import type {Category} from '@/types';

export interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;

  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  updateCategoryName: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addManyCategories: (categories: Omit<Category, 'id'>[]) => Promise<Category[]>;
  deleteManyCategories: (ids: string[]) => Promise<void>;

  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  findCategories: (predicate: (category: Category) => boolean) => Category[];

  validateCategoryDeletion: (
    id: string,
    transactionCount?: number,
  ) => {canDelete: boolean; reason: string};
  validateCategoryName: (name: string, excludeId?: string) => {isValid: boolean; reason?: string};

  exportCategories: () => {categories: Category[]; exportDate: Date; version: string};
  syncWithRemote: () => Promise<void>;
  syncEntityWithRemote: (id: string) => Promise<void>;
  loadFromRemote: () => Promise<void>;
}
