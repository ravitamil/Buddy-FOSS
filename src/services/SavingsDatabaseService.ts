import {supabase} from '../lib/supabase';
import {SavingsGoal} from '../types';
import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('SavingsDatabaseService');

interface SavingsGoalUpsertRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon?: string;
  color?: string;
  updated_at: string;
}

interface SavingsGoalRow {
  id: string;
  name: string | null;
  target_amount: number | string | null;
  current_amount: number | string | null;
  deadline: string | null;
  icon: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const parseAmount = (amount: number | string | null): number => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return Number(amount);
  return 0;
};

const parseDate = (value: string | null): Date => (value ? new Date(value) : new Date());

const serializeDate = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : value;

const toSavingsGoalUpsertRow = (userId: string, goal: SavingsGoal): SavingsGoalUpsertRow => {
  const row: SavingsGoalUpsertRow = {
    id: goal.id,
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: serializeDate(goal.deadline),
    updated_at: new Date().toISOString(),
  };

  if (goal.icon) {
    row.icon = goal.icon;
  }

  if (goal.color) {
    row.color = goal.color;
  }

  return row;
};

const toSavingsGoal = (row: SavingsGoalRow): SavingsGoal => {
  const createdAt = parseDate(row.created_at);

  return {
    id: row.id,
    name: row.name ?? '',
    targetAmount: parseAmount(row.target_amount),
    currentAmount: parseAmount(row.current_amount),
    deadline: parseDate(row.deadline),
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    createdAt,
    updatedAt: row.updated_at ? new Date(row.updated_at) : createdAt,
  };
};

/**
 * Savings Database Service
 * Handles savings goal persistence and synchronization using Supabase PostgreSQL
 */
export const savingsDatabaseService = {
  async saveSavingsGoals(userId: string, goals: SavingsGoal[]): Promise<void> {
    try {
      if (goals.length === 0) return;

      const {error} = await supabase
        .from('savings_goals')
        .upsert(goals.map((goal) => toSavingsGoalUpsertRow(userId, goal)));

      if (error) throw error;
    } catch (error) {
      logger.error('Error saving savings goals:', error);
      throw error;
    }
  },

  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const {data, error} = await supabase.from('savings_goals').select('*').eq('user_id', userId);

      if (error) throw error;

      const rows = (data ?? []) as SavingsGoalRow[];

      return rows.map(toSavingsGoal);
    } catch (error) {
      logger.error('Error getting savings goals:', error);
      throw error;
    }
  },
};
