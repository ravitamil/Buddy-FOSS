import {DebtPayoffStrategy} from '../types/debt.types';
import {logger as appLogger} from './LoggerService';
import {readJson, writeJson} from './storage/secureJsonStorage';
import {STORAGE_KEYS} from './storage/storageKeys';

const logger = appLogger.contextLogger('DebtPayoffDatabaseService');

type DebtPayoffPersistenceStatus =
  | 'pending'
  | 'synced'
  | 'conflict'
  | 'error'
  | 'active'
  | 'completed'
  | 'archived';
type DateValue = string | Date;

export interface DebtPayoffPlanForPersistence {
  id: string;
  name: string;
  strategy: DebtPayoffStrategy;
  totalDebt: number;
  monthlyBudget: number;
  projectedPayoffDate: DateValue;
  startDate: DateValue;
  status: DebtPayoffPersistenceStatus;
  generatedAt: DateValue;
  createdAt: DateValue;
}

export interface PersistedDebtPayoffPlan {
  id: string;
  name: string;
  strategy: DebtPayoffStrategy;
  totalDebt: number;
  monthlyBudget: number;
  projectedPayoffDate: string;
  startDate: string;
  status: DebtPayoffPersistenceStatus;
  generatedAt: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

function toDatabaseTimestamp(value: DateValue): string {
  return value instanceof Date ? value.toISOString() : value;
}

export const debtPayoffDatabaseService = {
  async saveDebtPayoffPlans(_userId: string, plans: DebtPayoffPlanForPersistence[]): Promise<void> {
    try {
      if (plans.length === 0) return;

      const existing = await readJson<PersistedDebtPayoffPlan[]>(
        STORAGE_KEYS.DEBT_PAYOFF_PLANS,
        [],
      );
      const map = new Map<string, PersistedDebtPayoffPlan>(existing.map((p) => [p.id, p]));

      for (const plan of plans) {
        map.set(plan.id, {
          id: plan.id,
          name: plan.name,
          strategy: plan.strategy,
          totalDebt: plan.totalDebt,
          monthlyBudget: plan.monthlyBudget,
          projectedPayoffDate: toDatabaseTimestamp(plan.projectedPayoffDate),
          startDate: toDatabaseTimestamp(plan.startDate),
          status: plan.status,
          generatedAt: toDatabaseTimestamp(plan.generatedAt),
          lastSyncedAt: new Date().toISOString(),
          createdAt: toDatabaseTimestamp(plan.createdAt),
        });
      }

      await writeJson(STORAGE_KEYS.DEBT_PAYOFF_PLANS, Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving debt payoff plans:', error);
      throw error;
    }
  },

  async getDebtPayoffPlans(_userId: string): Promise<PersistedDebtPayoffPlan[]> {
    try {
      const plans = await readJson<PersistedDebtPayoffPlan[]>(STORAGE_KEYS.DEBT_PAYOFF_PLANS, []);
      return plans.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      logger.error('Error getting debt payoff plans:', error);
      return [];
    }
  },
};
