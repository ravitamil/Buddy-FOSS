import type {GroupMember, MemberBalance, Transaction} from '../../types';
import {roundToTwoDecimals} from './debtCalculationMetrics';

export function calculateSplitAmountsInWorker(
  transaction: Transaction,
  members: GroupMember[],
  expenseAmount: number,
  memberBalances?: Record<string, MemberBalance>,
): Record<string, number> {
  const splitAmounts: Record<string, number> = {};

  if (transaction.splitDetails && transaction.splitDetails.length > 0) {
    assignDetailedSplitAmounts(transaction, expenseAmount, splitAmounts, memberBalances);
  } else if (transaction.splitAmounts && Object.keys(transaction.splitAmounts).length > 0) {
    assignExplicitSplitAmounts(transaction, splitAmounts);
    applyCreditAdjustments(splitAmounts, transaction, memberBalances);
  } else if (transaction.splitAmong && transaction.splitAmong.length > 0) {
    assignEqualSplitAmounts(transaction.splitAmong, expenseAmount, splitAmounts);
    applyCreditAdjustments(splitAmounts, transaction, memberBalances);
  } else {
    assignEqualSplitAmounts(
      members.map((member) => member.id),
      expenseAmount,
      splitAmounts,
    );
    applyCreditAdjustments(splitAmounts, transaction, memberBalances);
  }

  return splitAmounts;
}

function assignDetailedSplitAmounts(
  transaction: Transaction,
  expenseAmount: number,
  splitAmounts: Record<string, number>,
  memberBalances?: Record<string, MemberBalance>,
) {
  let computed = transaction.splitDetails || [];
  const needCompute = computed.some(
    (split) => (split.amount ?? 0) === 0 && (split.percentage || split.shares),
  );

  if (needCompute) {
    computed = computeMissingDetailedSplitAmounts(computed, expenseAmount);
  }

  for (const split of computed) {
    if (memberBalances) {
      const originalAmount = split.amount || 0;
      const settledAmount = split.settledAmount || 0;
      const memberBalance = memberBalances[split.memberId];
      let netAmount = Math.max(0, originalAmount - settledAmount);

      if (memberBalance && transaction.paidBy && memberBalance.advancePayments) {
        const advancePayment = getAdvancePayment(memberBalance, transaction.paidBy);
        netAmount = Math.max(0, netAmount - advancePayment);
      }

      splitAmounts[split.memberId] = (splitAmounts[split.memberId] || 0) + netAmount;
    } else {
      splitAmounts[split.memberId] = (splitAmounts[split.memberId] || 0) + (split.amount || 0);
    }
  }
}

function computeMissingDetailedSplitAmounts(
  splitDetails: NonNullable<Transaction['splitDetails']>,
  expenseAmount: number,
) {
  const percentages = splitDetails.map((split) => Math.max(0, split.percentage || 0));
  const shares = splitDetails.map((split) => Math.max(0, split.shares || 0));
  let raw: number[] = [];

  if (percentages.some((percentage) => percentage > 0)) {
    const sumPct = percentages.reduce((sum, percentage) => sum + percentage, 0) || 100;
    raw = percentages.map((percentage) => (expenseAmount * percentage) / sumPct);
  } else if (shares.some((share) => share > 0)) {
    const totalShares = shares.reduce((sum, share) => sum + share, 0) || 1;
    raw = shares.map((share) => (expenseAmount * share) / totalShares);
  }

  const adjusted = distributeRoundingRemainder(raw, expenseAmount);
  return splitDetails.map((split, index) => ({
    ...split,
    amount: split.amount && split.amount > 0 ? split.amount : adjusted[index],
  }));
}

function distributeRoundingRemainder(raw: number[], expenseAmount: number) {
  const floored = raw.map((value) => roundToTwoDecimals(value));
  let remainder = roundToTwoDecimals(
    expenseAmount - floored.reduce((sum, value) => sum + value, 0),
  );
  const sortedIndexes = raw
    .map((value, index) => ({index, frac: value * 100 - Math.floor(value * 100)}))
    .sort((a, b) => b.frac - a.frac)
    .map((entry) => entry.index);
  const adjusted = [...floored];
  let currentIndex = 0;

  while (remainder > 0.0001 && sortedIndexes.length > 0) {
    const index = sortedIndexes[currentIndex % sortedIndexes.length];
    adjusted[index] = roundToTwoDecimals(adjusted[index] + 0.01);
    remainder = roundToTwoDecimals(remainder - 0.01);
    currentIndex += 1;
  }

  return adjusted;
}

function assignExplicitSplitAmounts(
  transaction: Transaction,
  splitAmounts: Record<string, number>,
) {
  for (const [memberId, amount] of Object.entries(transaction.splitAmounts || {})) {
    splitAmounts[memberId] = amount;
  }
}

function assignEqualSplitAmounts(
  memberIds: string[],
  expenseAmount: number,
  splitAmounts: Record<string, number>,
) {
  const amountPerMember = expenseAmount / memberIds.length;
  for (const memberId of memberIds) {
    splitAmounts[memberId] = amountPerMember;
  }
}

function applyCreditAdjustments(
  splitAmounts: Record<string, number>,
  transaction: Transaction,
  memberBalances?: Record<string, MemberBalance>,
) {
  if (!memberBalances || !transaction.paidBy) return;

  Object.keys(splitAmounts).forEach((memberId) => {
    const memberBalance = memberBalances[memberId];
    if (memberBalance && memberBalance.advancePayments) {
      const advancePayment = getAdvancePayment(memberBalance, transaction.paidBy);
      splitAmounts[memberId] = Math.max(0, splitAmounts[memberId] - advancePayment);
    }
  });
}

function getAdvancePayment(memberBalance: MemberBalance | undefined, paidBy: string | undefined) {
  if (!memberBalance || !paidBy) {
    return 0;
  }

  return memberBalance.advancePayments[paidBy] || 0;
}
