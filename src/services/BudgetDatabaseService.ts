import {readJson, writeJson} from './storage/secureJsonStorage';
import type {
  Budget,
  BudgetPeriod,
  BudgetSplit,
  CategoryBudgetAllocation,
  IncomeSource,
  RecurringBudgetItem,
} from '@/types';

import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('BudgetDatabaseService');
const BUDGETS_STORAGE_KEY = 'buddy_budgets';

type SavingsGoalAllocation = NonNullable<Budget['savingsGoalsAllocation']>[number];

interface BudgetDatabaseRow {
  id: string;
  name: string;
  currency_code: string;
  monthly_income: number | string;
  planned_expenses: number | string;
  planned_savings: number | string;
  period: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  rollover_enabled: boolean;
  rollover_amount: number | string;
  custom_splits: unknown;
  category_allocations: unknown;
  enable_category_alerts: boolean;
  income_sources: unknown;
  track_income_sources: boolean;
  linked_recurring_items: unknown;
  auto_populate_from_recurring: boolean;
  savings_goal_allocations: unknown;
  created_at: string;
  updated_at: string;
}

interface BudgetUpsertRow {
  id: string;
  user_id: string;
  name: string;
  currency_code: string;
  monthly_income: number;
  planned_expenses: number;
  planned_savings: number;
  period: BudgetPeriod;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  rollover_enabled: boolean;
  rollover_amount: number;
  custom_splits: BudgetSplit[];
  category_allocations: CategoryBudgetAllocation[];
  enable_category_alerts: boolean;
  income_sources: IncomeSource[];
  track_income_sources: boolean;
  linked_recurring_items: RecurringBudgetItem[];
  auto_populate_from_recurring: boolean;
  savings_goal_allocations: SavingsGoalAllocation[];
  created_at: string;
  updated_at: string;
}

const numberValue = (value: number | string): number =>
  typeof value === 'number' ? value : Number(value);

const arrayValue = <Value>(value: unknown): Value[] =>
  Array.isArray(value) ? (value as Value[]) : [];

const dateValue = (value: string | null): Date | undefined => (value ? new Date(value) : undefined);

const periodValue = (value: string): BudgetPeriod => {
  if (value === 'weekly' || value === 'monthly' || value === 'yearly' || value === 'custom') {
    return value;
  }
  throw new Error(`Unsupported budget period: ${value}`);
};

const serializeDate = (value?: Date): string | null => value?.toISOString() ?? null;

const toRow = (userId: string, budget: Budget): BudgetUpsertRow => ({
  id: budget.id,
  user_id: userId,
  name: budget.name,
  currency_code: budget.currencyCode,
  monthly_income: budget.monthlyIncome,
  planned_expenses: budget.plannedExpenses,
  planned_savings: budget.plannedSavings,
  period: budget.period,
  start_date: serializeDate(budget.periodConfig?.startDate),
  end_date: serializeDate(budget.periodConfig?.endDate),
  is_active: budget.isActive,
  rollover_enabled: budget.periodConfig?.rolloverEnabled ?? false,
  rollover_amount: budget.periodConfig?.rolloverAmount ?? 0,
  custom_splits: budget.customSplits,
  category_allocations: budget.categoryAllocations ?? [],
  enable_category_alerts: budget.enableCategoryAlerts ?? false,
  income_sources: budget.incomeSources ?? [],
  track_income_sources: budget.trackIncomeSources ?? false,
  linked_recurring_items: budget.linkedRecurringItems ?? [],
  auto_populate_from_recurring: budget.autoPopulateFromRecurring ?? false,
  savings_goal_allocations: budget.savingsGoalsAllocation ?? [],
  created_at: budget.createdAt.toISOString(),
  updated_at: budget.updatedAt.toISOString(),
});

const fromRow = (row: BudgetDatabaseRow): Budget => {
  const period = periodValue(row.period);
  const incomeSources = arrayValue<IncomeSource>(row.income_sources).map((source) => ({
    ...source,
    nextExpectedDate: source.nextExpectedDate ? new Date(source.nextExpectedDate) : undefined,
  }));

  return {
    id: row.id,
    name: row.name,
    currencyCode: row.currency_code,
    monthlyIncome: numberValue(row.monthly_income),
    plannedExpenses: numberValue(row.planned_expenses),
    plannedSavings: numberValue(row.planned_savings),
    customSplits: arrayValue<BudgetSplit>(row.custom_splits),
    period,
    periodConfig: {
      type: period,
      startDate: dateValue(row.start_date),
      endDate: dateValue(row.end_date),
      rolloverEnabled: row.rollover_enabled,
      rolloverAmount: numberValue(row.rollover_amount),
    },
    isActive: row.is_active,
    categoryAllocations: arrayValue<CategoryBudgetAllocation>(row.category_allocations),
    enableCategoryAlerts: row.enable_category_alerts,
    incomeSources,
    trackIncomeSources: row.track_income_sources,
    linkedRecurringItems: arrayValue<RecurringBudgetItem>(row.linked_recurring_items),
    autoPopulateFromRecurring: row.auto_populate_from_recurring,
    savingsGoalsAllocation: arrayValue<SavingsGoalAllocation>(row.savings_goal_allocations),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

export const budgetDatabaseService = {
  async getAll(_userId: string): Promise<Budget[]> {
    try {
      const budgets = await readJson<Budget[]>(BUDGETS_STORAGE_KEY, []);
      return budgets
        .map((b) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      logger.error('Failed to load budgets', error);
      return [];
    }
  },

  async create(_userId: string, budget: Budget): Promise<Budget> {
    try {
      const existing = await readJson<Budget[]>(BUDGETS_STORAGE_KEY, []);
      const newBudget: Budget = {
        ...budget,
        id: budget.id || `budget_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: budget.createdAt ? new Date(budget.createdAt) : new Date(),
        updatedAt: new Date(),
      };

      existing.push(newBudget);
      await writeJson(BUDGETS_STORAGE_KEY, existing);
      return newBudget;
    } catch (error) {
      logger.error('Failed to create budget', error);
      throw error;
    }
  },

  async update(_userId: string, budget: Budget): Promise<Budget> {
    try {
      const existing = await readJson<Budget[]>(BUDGETS_STORAGE_KEY, []);
      const index = existing.findIndex((b) => b.id === budget.id);

      const updatedBudget: Budget = {
        ...budget,
        updatedAt: new Date(),
      };

      if (index >= 0) {
        existing[index] = updatedBudget;
      } else {
        existing.push(updatedBudget);
      }

      await writeJson(BUDGETS_STORAGE_KEY, existing);
      return updatedBudget;
    } catch (error) {
      logger.error('Failed to update budget', error);
      throw error;
    }
  },

  async setActive(_userId: string, budgetId: string | null): Promise<void> {
    try {
      const existing = await readJson<Budget[]>(BUDGETS_STORAGE_KEY, []);
      const updated = existing.map((b) => ({
        ...b,
        isActive: b.id === budgetId,
        updatedAt: new Date(),
      }));
      await writeJson(BUDGETS_STORAGE_KEY, updated);
    } catch (error) {
      logger.error('Failed to set active budget', error);
      throw error;
    }
  },

  async delete(_userId: string, budgetId: string): Promise<void> {
    try {
      const existing = await readJson<Budget[]>(BUDGETS_STORAGE_KEY, []);
      const remaining = existing.filter((b) => b.id !== budgetId);
      await writeJson(BUDGETS_STORAGE_KEY, remaining);
    } catch (error) {
      logger.error('Failed to delete budget', error);
      throw error;
    }
  },
};
