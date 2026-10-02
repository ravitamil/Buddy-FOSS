import type {GroupMember, Transaction} from '../types';
import type {MemberBalance} from './groupBalanceTypes';

export const roundToTwoDecimals = (num: number): number =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateSplitAmountsOptimized = (
  transaction: Transaction,
  members: GroupMember[],
  expenseAmount: number,
  useUnsettledOnly: boolean = false,
  memberBalances?: Record<string, MemberBalance>,
): Record<string, number> => {
  const splitAmounts = new Map<string, number>();

  if (transaction.splitDetails && transaction.splitDetails.length > 0) {
    for (const split of transaction.splitDetails) {
      if (useUnsettledOnly && memberBalances) {
        const originalAmount = split.amount || 0;
        const settledAmount = split.settledAmount || 0;
        const netUnsettled = Math.max(0, originalAmount - settledAmount);
        splitAmounts.set(split.memberId, (splitAmounts.get(split.memberId) || 0) + netUnsettled);
      } else if (useUnsettledOnly) {
        const unsettled = Math.max(0, (split.amount || 0) - (split.settledAmount || 0));
        splitAmounts.set(split.memberId, (splitAmounts.get(split.memberId) || 0) + unsettled);
      } else {
        const originalAmount = split.amount || 0;
        splitAmounts.set(split.memberId, (splitAmounts.get(split.memberId) || 0) + originalAmount);
      }
    }
  } else if (transaction.splitAmounts && Object.keys(transaction.splitAmounts).length > 0) {
    for (const [memberId, amount] of Object.entries(transaction.splitAmounts)) {
      splitAmounts.set(memberId, amount);
    }
  } else if (transaction.splitAmong && transaction.splitAmong.length > 0) {
    const amountPerMember = expenseAmount / transaction.splitAmong.length;
    for (const memberId of transaction.splitAmong) {
      splitAmounts.set(memberId, amountPerMember);
    }
  } else {
    const amountPerMember = expenseAmount / members.length;
    for (const member of members) {
      splitAmounts.set(member.id, amountPerMember);
    }
  }

  const result: Record<string, number> = {};
  splitAmounts.forEach((amount, memberId) => {
    result[memberId] = amount;
  });

  return result;
};
