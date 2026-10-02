import {savingsGoalDatabaseService} from '@/services/SavingsGoalDatabaseService';
import type {SavingsGoal} from '@/types';
import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('SavingsService');

const toDate = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

const normalizeOtherIncomeSources = (goal: SavingsGoal) =>
  goal.otherIncomeSources?.map((source) => ({
    ...source,
    startDate: toDate(source.startDate),
    endDate: toDate(source.endDate),
  }));

export const normalizeSavingsGoal = (goal: SavingsGoal): SavingsGoal => ({
  ...goal,
  deadline: toDate(goal.deadline) ?? new Date(),
  createdAt: toDate(goal.createdAt),
  updatedAt: toDate(goal.updatedAt),
  recurrenceEndDate: toDate(goal.recurrenceEndDate),
  nextOccurrenceDate: toDate(goal.nextOccurrenceDate),
  otherIncomeSources: normalizeOtherIncomeSources(goal),
});

export const savingsService = {
  async getAll(userId: string): Promise<SavingsGoal[]> {
    if (!userId) return [];
    const cloudGoals = await savingsGoalDatabaseService.getGoals(userId);
    return cloudGoals.map(normalizeSavingsGoal);
  },

  async saveAll(userId: string, goals: SavingsGoal[]): Promise<SavingsGoal[]> {
    if (!userId) throw new Error('Authentication required');
    const synced = await savingsGoalDatabaseService.syncLocalGoals(userId, goals);
    return synced.map(normalizeSavingsGoal);
  },

  async saveMany(userId: string, goals: SavingsGoal[]): Promise<SavingsGoal[]> {
    return this.saveAll(userId, goals);
  },

  async create(userId: string, goal: SavingsGoal): Promise<SavingsGoal> {
    const nextGoal = normalizeSavingsGoal(goal);
    if (!userId) throw new Error('Authentication required');

    try {
      const created = await savingsGoalDatabaseService.createGoal(userId, nextGoal);
      return normalizeSavingsGoal(created);
    } catch (error) {
      logger.error('Failed to create savings goal in cloud:', error);
      throw error;
    }
  },

  async update(userId: string, goal: SavingsGoal): Promise<SavingsGoal> {
    const nextGoal = normalizeSavingsGoal(goal);
    if (!userId) throw new Error('Authentication required');

    try {
      const updated = await savingsGoalDatabaseService.updateGoal(userId, nextGoal);
      return normalizeSavingsGoal(updated);
    } catch (error) {
      logger.error('Failed to update savings goal in cloud:', error);
      throw error;
    }
  },

  async delete(userId: string, goalId: string): Promise<void> {
    if (!userId) throw new Error('Authentication required');

    try {
      await savingsGoalDatabaseService.deleteGoal(userId, goalId);
    } catch (error) {
      logger.error('Failed to delete savings goal from cloud:', error);
      throw error;
    }
  },

  async deposit(
    userId: string,
    goalId: string,
    amount: number,
    walletId?: string,
    note?: string,
    operationKey?: string,
  ): Promise<{goalId: string; currentAmount: number; isCompleted: boolean; transactionId: string}> {
    return savingsGoalDatabaseService.depositToGoal(
      userId,
      goalId,
      amount,
      walletId,
      note,
      operationKey,
    );
  },
};
