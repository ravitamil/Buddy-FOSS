import type {GroupMember, Transaction} from '../../types';

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function estimateMemoryUsage(transactions: Transaction[], members: GroupMember[]): number {
  const transactionMemory = transactions.length * 100;
  const memberMemory = members.length * 50;
  const debtMemory = members.length * members.length * 8;

  return transactionMemory + memberMemory + debtMemory;
}

export function estimateTimeRemaining(
  startTime: number,
  currentStage: number,
  totalStages: number,
): number {
  const elapsed = performance.now() - startTime;
  const progressRate = elapsed / currentStage;
  const remainingStages = totalStages - currentStage;
  return progressRate * remainingStages;
}
