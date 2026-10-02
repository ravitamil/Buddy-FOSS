import type {Investment, InvestmentCategory} from '@/types';

type Identifiable = {id: string};

export const getErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return null;
};

export const createInvestment = (
  investmentData: Omit<Investment, 'id' | 'lastUpdated' | 'createdAt'>,
  id: string,
  now: Date,
): Investment => ({
  ...investmentData,
  id,
  lastUpdated: now,
  createdAt: now,
  isActive: true,
});

export const updateExistingInvestment = (
  investments: Investment[],
  id: string,
  updates: Partial<Investment>,
  now: Date,
): Investment => {
  const current = investments.find((investment) => investment.id === id);
  if (!current) throw new Error('Investment not found');
  return {...current, ...updates, lastUpdated: now};
};

export const createInvestmentCategory = (
  category: Omit<InvestmentCategory, 'id'>,
  id: string,
): InvestmentCategory => ({
  ...category,
  id,
  isSystem: false,
});

export const updateExistingCategory = (
  categories: InvestmentCategory[],
  id: string,
  updates: Partial<InvestmentCategory>,
): InvestmentCategory => {
  const current = categories.find((category) => category.id === id);
  if (!current) throw new Error('Category not found');
  return {...current, ...updates};
};

export const appendItem = <T>(items: T[], item: T): T[] => [...items, item];

export const replaceItemById = <T extends Identifiable>(items: T[], replacement: T): T[] =>
  items.map((item) => (item.id === replacement.id ? replacement : item));

export const removeItemById = <T extends Identifiable>(items: T[], id: string): T[] =>
  items.filter((item) => item.id !== id);
