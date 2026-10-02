import {Transaction} from '../../../types';
import {EnhancedGroupMember} from '@/features/groups/types';

export interface GroupSettlementInput {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  description?: string;
}

export interface PairwiseSettlementResult {
  settled: number;
  newTransactions: Transaction[];
  modifiedIds: string[];
  settledAmounts: Record<string, number>;
}

export interface AppliedSettlementResult {
  updatedTransactions: Transaction[];
  settledExpenseIds: string[];
  settledDebtAmounts: Record<string, number>;
  settledAmount: number;
  remainingAmount: number;
}

export const settlePairwiseDebt = (
  debtorId: string,
  creditorId: string,
  amountToSettle: number,
  transactions: Transaction[],
): PairwiseSettlementResult => {
  let remaining = amountToSettle;
  let settledTotal = 0;
  const modifiedIds: string[] = [];
  const settledAmounts: Record<string, number> = {};

  const newTransactions = transactions.map((transaction) => {
    if (
      transaction.type === 'expense' &&
      !transaction.isSettlement &&
      transaction.splitDetails &&
      transaction.paidBy === creditorId &&
      remaining > 0.001
    ) {
      const split = transaction.splitDetails.find((detail) => detail.memberId === debtorId);
      if (split && !split.isPaid) {
        const unsettled = (split.amount || 0) - (split.settledAmount || 0);
        if (unsettled > 0.001) {
          const settleAmount = Math.min(unsettled, remaining);
          remaining -= settleAmount;
          settledTotal += settleAmount;
          settledAmounts[transaction.id] = settleAmount;

          const newSettledAmount = (split.settledAmount || 0) + settleAmount;
          const isPaid = newSettledAmount >= (split.amount || 0) - 0.001;

          if (!modifiedIds.includes(transaction.id)) {
            modifiedIds.push(transaction.id);
          }

          return {
            ...transaction,
            splitDetails: transaction.splitDetails.map((detail) =>
              detail.memberId === debtorId
                ? {
                    ...detail,
                    settledAmount: newSettledAmount,
                    isPaid,
                    settledDate: isPaid ? new Date() : detail.settledDate,
                  }
                : detail,
            ),
          };
        }
      }
    }

    return transaction;
  });

  return {settled: settledTotal, newTransactions, modifiedIds, settledAmounts};
};

export const applyDirectSettlement = (
  settlement: GroupSettlementInput,
  transactions: Transaction[],
): AppliedSettlementResult => {
  const directResult = settlePairwiseDebt(
    settlement.fromMemberId,
    settlement.toMemberId,
    settlement.amount,
    transactions,
  );

  return {
    updatedTransactions: directResult.newTransactions,
    settledExpenseIds: directResult.modifiedIds,
    settledDebtAmounts: {...directResult.settledAmounts},
    settledAmount: directResult.settled,
    remainingAmount: settlement.amount - directResult.settled,
  };
};

export const buildSettlementTransaction = ({
  id,
  groupId,
  settlement,
  fromMember,
  toMember,
  settledExpenseIds,
  settledDebtAmounts,
  now = new Date(),
}: {
  id: string;
  groupId: string;
  settlement: GroupSettlementInput;
  fromMember: EnhancedGroupMember;
  toMember: EnhancedGroupMember;
  settledExpenseIds: string[];
  settledDebtAmounts: Record<string, number>;
  now?: Date;
}): Transaction => ({
  id,
  amount: settlement.amount,
  category: 'Settlement',
  description: settlement.description || `Settlement from ${fromMember.name} to ${toMember.name}`,
  date: now.toISOString(),
  type: 'income',
  groupId,
  paidBy: settlement.fromMemberId,
  receivedBy: [settlement.toMemberId],
  isSettlement: true,
  splitAmong: [settlement.fromMemberId, settlement.toMemberId],
  splitDetails: [
    {
      memberId: settlement.fromMemberId,
      memberName: fromMember.name,
      amount: -settlement.amount,
      isPaid: true,
      settledAmount: settlement.amount,
      settledDate: now,
    },
    {
      memberId: settlement.toMemberId,
      memberName: toMember.name,
      amount: settlement.amount,
      isPaid: true,
      settledAmount: settlement.amount,
      settledDate: now,
    },
  ],
  createdBy: settlement.fromMemberId,
  lastModified: now,
  settledDebts: [...new Set(settledExpenseIds)],
  settledDebtAmounts: {...settledDebtAmounts},
});

export const getSettledDebtAmountTotal = (settledDebtAmounts: Record<string, number>): number =>
  Object.values(settledDebtAmounts).reduce((sum, amount) => sum + amount, 0);
