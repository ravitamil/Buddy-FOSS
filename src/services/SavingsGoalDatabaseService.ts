import type {SavingsGoal, Transaction} from '@/types';
import {logger as appLogger} from './LoggerService';
import {readJson, writeJson} from './storage/secureJsonStorage';
import {STORAGE_KEYS} from './storage/storageKeys';
import {transactionDatabaseService} from './TransactionDatabaseService';
import {walletDatabaseService} from './WalletDatabaseService';

const logger = appLogger.contextLogger('SavingsGoalDatabaseService');

interface SavingsGoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline?: string | null;
  category?: string | null;
  color?: string | null;
  icon?: string | null;
  notes?: string | null;
  is_completed?: boolean | null;
  description?: string | null;
  is_recurring?: boolean | null;
  recurrence_frequency?: SavingsGoal['recurrenceFrequency'] | null;
  intended_amount?: number | string | null;
  recurrence_end_date?: string | null;
  next_occurrence_date?: string | null;
  recurring_template_id?: string | null;
  is_retirement_goal?: boolean | null;
  retirement_age?: number | null;
  life_expectancy?: number | null;
  annual_retirement_income?: number | string | null;
  current_annual_expenses?: number | string | null;
  inflation_rate?: number | string | null;
  expected_return_rate?: number | string | null;
  monthly_contribution?: number | string | null;
  employer_contribution?: number | string | null;
  social_security_estimate?: number | string | null;
  pension_estimate?: number | string | null;
  other_income_sources?: SavingsGoal['otherIncomeSources'] | null;
  healthcare_costs_estimate?: number | string | null;
  long_term_care_insurance?: boolean | null;
  risk_tolerance?: SavingsGoal['riskTolerance'] | null;
  retirement_readiness_score?: number | string | null;
  projected_shortfall?: number | string | null;
  recommended_monthly_savings?: number | string | null;
  created_at: string;
  updated_at?: string | null;
}

interface SupabaseSingleResult<T> {
  data: T | null;
  error: Error | null;
}

interface SupabaseListResult<T> {
  data: T[] | null;
  error: Error | null;
}

interface SupabaseRpcResult<T> {
  data: T | null;
  error: Error | null;
}

function toGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount) || 0,
    currentAmount: Number(row.current_amount) || 0,
    deadline: row.deadline ? new Date(row.deadline) : new Date(),
    category: row.category ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    notes: row.notes ?? undefined,
    isCompleted: row.is_completed ?? false,
    description: row.description ?? undefined,
    isRecurring: row.is_recurring ?? false,
    recurrenceFrequency: row.recurrence_frequency ?? undefined,
    intendedAmount: optionalNumber(row.intended_amount),
    recurrenceEndDate: optionalDate(row.recurrence_end_date),
    nextOccurrenceDate: optionalDate(row.next_occurrence_date),
    recurringTemplateId: row.recurring_template_id ?? undefined,
    isRetirementGoal: row.is_retirement_goal ?? false,
    retirementAge: row.retirement_age ?? undefined,
    lifeExpectancy: row.life_expectancy ?? undefined,
    annualRetirementIncome: optionalNumber(row.annual_retirement_income),
    currentAnnualExpenses: optionalNumber(row.current_annual_expenses),
    inflationRate: optionalNumber(row.inflation_rate),
    expectedReturnRate: optionalNumber(row.expected_return_rate),
    monthlyContribution: optionalNumber(row.monthly_contribution),
    employerContribution: optionalNumber(row.employer_contribution),
    socialSecurityEstimate: optionalNumber(row.social_security_estimate),
    pensionEstimate: optionalNumber(row.pension_estimate),
    otherIncomeSources: row.other_income_sources ?? undefined,
    healthcareCostsEstimate: optionalNumber(row.healthcare_costs_estimate),
    longTermCareInsurance: row.long_term_care_insurance ?? undefined,
    riskTolerance: row.risk_tolerance ?? undefined,
    retirementReadinessScore: optionalNumber(row.retirement_readiness_score),
    projectedShortfall: optionalNumber(row.projected_shortfall),
    recommendedMonthlySavings: optionalNumber(row.recommended_monthly_savings),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

function toDbRow(userId: string, goal: SavingsGoal) {
  return {
    id: goal.id,
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    category: goal.category || null,
    color: goal.color || null,
    icon: goal.icon || null,
    notes: goal.notes || null,
    is_completed: goal.isCompleted ?? false,
    description: goal.description || null,
    is_recurring: goal.isRecurring ?? false,
    recurrence_frequency: goal.recurrenceFrequency || null,
    intended_amount: goal.intendedAmount ?? null,
    recurrence_end_date: goal.recurrenceEndDate?.toISOString() ?? null,
    next_occurrence_date: goal.nextOccurrenceDate?.toISOString() ?? null,
    recurring_template_id: goal.recurringTemplateId || null,
    is_retirement_goal: goal.isRetirementGoal ?? false,
    retirement_age: goal.retirementAge ?? null,
    life_expectancy: goal.lifeExpectancy ?? null,
    annual_retirement_income: goal.annualRetirementIncome ?? null,
    current_annual_expenses: goal.currentAnnualExpenses ?? null,
    inflation_rate: goal.inflationRate ?? null,
    expected_return_rate: goal.expectedReturnRate ?? null,
    monthly_contribution: goal.monthlyContribution ?? null,
    employer_contribution: goal.employerContribution ?? null,
    social_security_estimate: goal.socialSecurityEstimate ?? null,
    pension_estimate: goal.pensionEstimate ?? null,
    other_income_sources: goal.otherIncomeSources ?? [],
    healthcare_costs_estimate: goal.healthcareCostsEstimate ?? null,
    long_term_care_insurance: goal.longTermCareInsurance ?? false,
    risk_tolerance: goal.riskTolerance ?? null,
    retirement_readiness_score: goal.retirementReadinessScore ?? null,
    projected_shortfall: goal.projectedShortfall ?? null,
    recommended_monthly_savings: goal.recommendedMonthlySavings ?? null,
    updated_at: new Date().toISOString(),
  };
}

export const savingsGoalDatabaseService = {
  async getGoals(_userId: string): Promise<SavingsGoal[]> {
    try {
      const goals = await readJson<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
      return goals.map((g) => ({
        ...g,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        deadline: g.deadline ? new Date(g.deadline) : new Date(),
      }));
    } catch (error) {
      logger.error('Failed to get savings goals:', error);
      return [];
    }
  },

  async createGoal(_userId: string, goal: SavingsGoal): Promise<SavingsGoal> {
    try {
      const existing = await readJson<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
      const newGoal: SavingsGoal = {
        ...goal,
        id: goal.id || `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
      };

      existing.push(newGoal);
      await writeJson(STORAGE_KEYS.SAVINGS_GOALS, existing);
      return newGoal;
    } catch (error) {
      logger.error('Failed to create savings goal:', error);
      throw error;
    }
  },

  async updateGoal(_userId: string, goal: SavingsGoal): Promise<SavingsGoal> {
    try {
      const existing = await readJson<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
      const index = existing.findIndex((g) => g.id === goal.id);

      if (index >= 0) {
        existing[index] = goal;
      } else {
        existing.push(goal);
      }

      await writeJson(STORAGE_KEYS.SAVINGS_GOALS, existing);
      return goal;
    } catch (error) {
      logger.error('Failed to update savings goal:', error);
      throw error;
    }
  },

  async deleteGoal(_userId: string, id: string): Promise<void> {
    try {
      const existing = await readJson<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
      const remaining = existing.filter((g) => g.id !== id);
      await writeJson(STORAGE_KEYS.SAVINGS_GOALS, remaining);
    } catch (error) {
      logger.error('Failed to delete savings goal:', error);
      throw error;
    }
  },

  async syncLocalGoals(_userId: string, localGoals: SavingsGoal[]): Promise<SavingsGoal[]> {
    try {
      if (localGoals.length === 0) return [];
      await writeJson(STORAGE_KEYS.SAVINGS_GOALS, localGoals);
      return localGoals;
    } catch (error) {
      logger.error('Failed to sync local savings goals:', error);
      return [];
    }
  },

  async depositToGoal(
    userId: string,
    goalId: string,
    amount: number,
    walletId?: string,
    note?: string,
    _operationKey?: string,
  ): Promise<{
    goalId: string;
    currentAmount: number;
    isCompleted: boolean;
    transactionId: string;
  }> {
    try {
      const goals = await this.getGoals(userId);
      const goalIndex = goals.findIndex((g) => g.id === goalId);
      if (goalIndex === -1) {
        throw new Error('Savings goal not found');
      }

      const goal = goals[goalIndex];
      const newCurrentAmount = (Number(goal.currentAmount) || 0) + amount;
      const isCompleted = newCurrentAmount >= (Number(goal.targetAmount) || 0);
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      goals[goalIndex] = {
        ...goal,
        currentAmount: newCurrentAmount,
        isCompleted,
      };
      await writeJson(STORAGE_KEYS.SAVINGS_GOALS, goals);

      // Create transaction record
      const newTx: Transaction = {
        id: transactionId,
        amount,
        description: `Savings Deposit: ${goal.name}`,
        date: new Date().toISOString(),
        type: 'expense',
        category: 'Savings',
        savingsGoalId: goal.id,
        walletId,
        notes: note,
        lastModified: new Date(),
      };
      await transactionDatabaseService.saveTransactions(userId, [newTx]);

      // Deduct from wallet if walletId provided
      if (walletId) {
        const wallets = await walletDatabaseService.getWallets(userId);
        const targetWallet = wallets.find((w) => w.id === walletId);
        if (targetWallet) {
          await walletDatabaseService.updateWallet(userId, targetWallet.id, {
            balance: Number(targetWallet.balance) - amount,
          });
        }
      }

      return {
        goalId: goal.id,
        currentAmount: newCurrentAmount,
        isCompleted,
        transactionId,
      };
    } catch (error) {
      logger.error('Failed to deposit to savings goal:', error);
      throw error;
    }
  },
};

function optionalNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function optionalDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}
