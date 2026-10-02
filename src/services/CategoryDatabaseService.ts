import {Category} from '../types';
import {logger as appLogger} from './LoggerService';
import {StorageService} from './storage';
import {DEFAULT_CATEGORIES} from '@/features/categories/context/categoryDefaults';

const logger = appLogger.contextLogger('CategoryDatabaseService');

type CategoryType = 'income' | 'expense' | 'investment';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  description?: string | null;
  risk_level?: 'low' | 'medium' | 'high' | null;
  expected_return?: number | null;
  is_default: boolean;
}

const isCategoryType = (value: unknown): value is CategoryType =>
  value === 'income' || value === 'expense' || value === 'investment';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCategoryRow = (value: unknown): value is CategoryRow =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.icon === 'string' &&
  typeof value.color === 'string' &&
  isCategoryType(value.type) &&
  typeof value.is_default === 'boolean';

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  type: row.type,
  description: row.description ?? undefined,
  riskLevel: row.risk_level ?? undefined,
  expectedReturn:
    row.expected_return !== undefined && row.expected_return !== null
      ? Number(row.expected_return)
      : undefined,
  isSystem: row.is_default,
});

/**
 * Category Database Service
 * Handles category persistence and synchronization using Supabase PostgreSQL
 */
export const categoryDatabaseService = {
  async saveCategories(_userId: string, categories: Category[]): Promise<void> {
    try {
      if (categories.length === 0) return;

      const existing = await StorageService.getCategories();
      const map = new Map<string, Category>(existing.map((c) => [c.id, c]));

      for (const c of categories) {
        map.set(c.id, c);
      }

      await StorageService.saveCategories(Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving categories:', error);
      throw error;
    }
  },

  async deleteCategory(_userId: string, categoryId: string): Promise<void> {
    try {
      const existing = await StorageService.getCategories();
      await StorageService.saveCategories(existing.filter((c) => c.id !== categoryId));
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  },

  async getCategories(_userId: string): Promise<Category[]> {
    try {
      const stored = await StorageService.getCategories();
      if (stored && stored.length > 0) {
        return stored;
      }
      await StorageService.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      logger.error('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },
};
