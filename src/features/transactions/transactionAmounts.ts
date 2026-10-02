import type {Transaction} from '@/types';

/**
 * Returns the signed-in user's economic share of a transaction.
 * Settlements are excluded from income and spending totals so the original
 * group expense is not counted a second time when participants settle it.
 */
export function getUserTransactionAmount(transaction: Transaction, userId?: string): number {
  if (transaction.isSettlement) return 0;
  if (!transaction.groupId || !userId) return Math.abs(transaction.amount);

  const explicitAmount = transaction.splitAmounts?.[userId];
  if (typeof explicitAmount === 'number') return Math.abs(explicitAmount);

  const splitDetail = transaction.splitDetails?.find((detail) => detail.memberId === userId);
  if (splitDetail) return Math.abs(splitDetail.amount);

  const hasExplicitSplit =
    Object.keys(transaction.splitAmounts ?? {}).length > 0 ||
    (transaction.splitDetails?.length ?? 0) > 0;

  return hasExplicitSplit ? 0 : Math.abs(transaction.amount);
}

export function getUserTransactionAmountForType(
  transaction: Transaction,
  type: Transaction['type'],
  userId?: string,
): number {
  return transaction.type === type ? getUserTransactionAmount(transaction, userId) : 0;
}
