import type {DebtPayoffPlan} from '../../types/debt.types';

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface DebtPayoffPlanWithSync extends DebtPayoffPlan {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  generatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt?: Date;
  localVersion?: number;
  cloudVersion?: number;
}

export function createDebtPayoffPlanWithSync(
  plan: DebtPayoffPlan,
  userId: string,
  customId?: string,
): DebtPayoffPlanWithSync {
  const timestamp = new Date();

  return {
    ...plan,
    id: customId || `debt_payoff_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
    generatedAt: timestamp,
    syncStatus: 'pending',
    localVersion: 1,
  };
}

export function updateDebtPayoffSyncStatus(
  plan: DebtPayoffPlanWithSync,
  status: SyncStatus,
  cloudVersion?: number,
): DebtPayoffPlanWithSync {
  return {
    ...plan,
    syncStatus: status,
    lastSyncedAt: status === 'synced' ? new Date() : plan.lastSyncedAt,
    localVersion: (plan.localVersion || 0) + 1,
    cloudVersion: cloudVersion !== undefined ? cloudVersion : plan.cloudVersion,
    updatedAt: new Date(),
  };
}

export function resolveDebtPayoffSyncConflict(
  localPlan: DebtPayoffPlanWithSync,
  cloudPlan: DebtPayoffPlanWithSync,
): DebtPayoffPlanWithSync {
  const isLocalNewer = localPlan.updatedAt > cloudPlan.updatedAt;

  return {
    ...(isLocalNewer ? localPlan : cloudPlan),
    syncStatus: 'synced',
    lastSyncedAt: new Date(),
    localVersion: Math.max(localPlan.localVersion || 0, cloudPlan.localVersion || 0) + 1,
    cloudVersion: Math.max(localPlan.cloudVersion || 0, cloudPlan.cloudVersion || 0) + 1,
  };
}
