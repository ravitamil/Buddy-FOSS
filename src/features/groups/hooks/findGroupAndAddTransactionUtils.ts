import type {GroupMember, MemberDebt} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import type {GroupSplitType, GroupTransactionType} from '../types/addGroupTransaction';
import type {SettlementPreview, SettlementPreviewDebt} from './findGroupAndAddTransactionTypes';

interface GroupBalanceLike {
  memberBalances: Array<{
    memberId: string;
    outstandingDebts: MemberDebt[];
  }>;
}

export const isDecimalInput = (text: string): boolean => text === '' || /^\d*\.?\d*$/.test(text);

export const getFirstError = (errors: Record<string, unknown>): string => {
  const firstError = Object.values(errors).find(Boolean);
  return typeof firstError === 'string' ? firstError : 'Please check the highlighted fields.';
};

export function getCurrentUserMember(
  group: EnhancedGroup,
  currentUserDisplayName: string,
): GroupMember | undefined {
  return (
    (group.members.find((member) => member.name === currentUserDisplayName) as
      | GroupMember
      | undefined) || (group.members[0] as GroupMember | undefined)
  );
}

export function calculateSplitAmounts({
  amount,
  customAmounts,
  selectedGroup,
  splitType,
}: {
  amount: string;
  customAmounts: Record<string, string>;
  selectedGroup: EnhancedGroup | null;
  splitType: GroupSplitType;
}): Record<string, number> {
  if (!selectedGroup) return {};

  const total = Number.parseFloat(amount) || 0;
  const amounts: Record<string, number> = {};

  if (splitType === 'equal') {
    const equalAmount = total / selectedGroup.members.length;
    selectedGroup.members.forEach((member) => {
      amounts[member.id] = equalAmount;
    });
    return amounts;
  }

  if (splitType === 'percentage') {
    const percentages = selectedGroup.members.map(
      (member) => Number.parseFloat(customAmounts[member.id]) || 0,
    );
    const sumPct = percentages.reduce((sum, percentage) => sum + percentage, 0) || 100;
    selectedGroup.members.forEach((member, index) => {
      amounts[member.id] = (total * (percentages[index] ?? 0)) / sumPct;
    });
    return amounts;
  }

  if (splitType === 'shares') {
    const shares = selectedGroup.members.map(
      (member) => Number.parseFloat(customAmounts[member.id]) || 0,
    );
    const totalShares = shares.reduce((sum, share) => sum + share, 0) || 1;
    selectedGroup.members.forEach((member, index) => {
      amounts[member.id] = (total * (shares[index] ?? 0)) / totalShares;
    });
    return amounts;
  }

  selectedGroup.members.forEach((member) => {
    amounts[member.id] = Number.parseFloat(customAmounts[member.id]) || 0;
  });
  return amounts;
}

export function getSelectedDebtIds({
  groupBalance,
  paidBy,
  selectedDebts,
}: {
  groupBalance: GroupBalanceLike | null;
  paidBy: string;
  selectedDebts: Record<string, boolean>;
}): string[] {
  if (!groupBalance || !paidBy) return [];
  const payingMemberBalance = groupBalance.memberBalances.find(
    (memberBalance) => memberBalance.memberId === paidBy,
  );
  if (!payingMemberBalance) return [];

  return payingMemberBalance.outstandingDebts
    .filter((debt) => selectedDebts[debt.creditorId])
    .flatMap((debt) => debt.transactionIds);
}

export function buildSettlementPreview({
  amount,
  paidBy,
  receivedBy,
  selectedDebtIds,
  selectedGroup,
  transactionType,
}: {
  amount: string;
  paidBy: string;
  receivedBy: string[];
  selectedDebtIds: string[];
  selectedGroup: EnhancedGroup | null;
  transactionType: GroupTransactionType;
}): SettlementPreview | null {
  if (transactionType !== 'payment' || !selectedGroup || !paidBy || receivedBy.length === 0) {
    return null;
  }

  const payingMember = selectedGroup.members.find((member) => member.id === paidBy);
  const recipients = receivedBy
    .map((id) => selectedGroup.members.find((member) => member.id === id))
    .filter(Boolean);

  if (!payingMember || recipients.length === 0) {
    return null;
  }

  const debts = selectedDebtIds
    .map((debtId) => {
      const debt = selectedGroup.transactions.find((transaction) => transaction.id === debtId);
      if (!debt) return null;

      const splitDetail = debt.splitDetails?.find((detail) => detail.memberId === paidBy);
      if (!splitDetail) return null;

      const outstandingAmount = splitDetail.amount - (splitDetail.settledAmount || 0);
      const creditor = selectedGroup.members.find((member) => member.id === debt.paidBy);

      return {
        id: debt.id,
        description: debt.description,
        originalAmount: splitDetail.amount,
        outstandingAmount,
        settledAmount: splitDetail.settledAmount || 0,
        creditor: creditor?.name || 'Unknown',
        date: debt.date,
      };
    })
    .filter((debt): debt is SettlementPreviewDebt => Boolean(debt));

  const totalOutstanding = debts.reduce((sum, debt) => sum + debt.outstandingAmount, 0);
  const settlementAmount = Number.parseFloat(amount) || 0;

  return {
    payingMember: payingMember.name,
    recipients: recipients.map((recipient) => recipient?.name ?? 'Unknown'),
    debts,
    totalOutstanding,
    settlementAmount,
    difference: settlementAmount - totalOutstanding,
  };
}

export function buildSplitDetails({
  selectedGroup,
  splitAmounts,
  totalAmount,
}: {
  selectedGroup: EnhancedGroup;
  splitAmounts: Record<string, number>;
  totalAmount: number;
}) {
  return Object.entries(splitAmounts).map(([memberId, splitAmount]) => {
    const member = selectedGroup.members.find((item) => item.id === memberId);
    return {
      memberId,
      memberName: member?.name || 'Unknown',
      amount: splitAmount,
      percentage: (splitAmount / totalAmount) * 100,
      isPaid: false,
      settledAmount: 0,
    };
  });
}

export function buildSettlementNote({
  description,
  selectedDebtTxIds,
  selectedGroup,
}: {
  description: string;
  selectedDebtTxIds: string[];
  selectedGroup: EnhancedGroup;
}) {
  let settlementNote = description.trim();
  if (selectedDebtTxIds.length === 0) {
    return settlementNote;
  }

  const labels = selectedDebtTxIds
    .map(
      (id) => selectedGroup.transactions.find((transaction) => transaction.id === id)?.description,
    )
    .filter((value): value is string => Boolean(value));

  if (labels.length > 0) {
    settlementNote = `${settlementNote ? `${settlementNote} | ` : ''}Settling: ${labels.join(', ')}`;
  }

  return settlementNote;
}
