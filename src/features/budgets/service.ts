import {budgetDatabaseService} from '@/services/BudgetDatabaseService';
import type {Budget, IncomeSource} from '@/types';

const toDate = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

const normalizeIncomeSources = (
  incomeSources?: Budget['incomeSources'],
): IncomeSource[] | undefined =>
  incomeSources?.map((source) => ({
    ...source,
    nextExpectedDate: toDate(source.nextExpectedDate),
  }));

export const normalizeBudget = (budget: Budget): Budget => ({
  ...budget,
  createdAt: toDate(budget.createdAt) ?? new Date(),
  updatedAt: toDate(budget.updatedAt) ?? new Date(),
  periodConfig: budget.periodConfig
    ? {
        ...budget.periodConfig,
        startDate: toDate(budget.periodConfig.startDate),
        endDate: toDate(budget.periodConfig.endDate),
      }
    : undefined,
  incomeSources: normalizeIncomeSources(budget.incomeSources),
});

export const budgetService = {
  async getAll(userId: string): Promise<Budget[]> {
    const budgets = await budgetDatabaseService.getAll(userId);
    return budgets.map(normalizeBudget);
  },

  async create(userId: string, budget: Budget): Promise<Budget> {
    return normalizeBudget(await budgetDatabaseService.create(userId, normalizeBudget(budget)));
  },

  async update(userId: string, budget: Budget): Promise<Budget> {
    return normalizeBudget(await budgetDatabaseService.update(userId, normalizeBudget(budget)));
  },

  async setActive(userId: string, budgetId: string | null): Promise<void> {
    await budgetDatabaseService.setActive(userId, budgetId);
  },

  async delete(userId: string, budgetId: string): Promise<void> {
    await budgetDatabaseService.delete(userId, budgetId);
  },
};
