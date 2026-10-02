import type {MemberDebt} from '@/types';
import type {
  AddGroupTransactionCategory,
  GroupBalanceViewModel,
  GroupSplitType,
  GroupTransactionType,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';

const avatarColors = [
  '#FF5252',
  '#FF4081',
  '#E040FB',
  '#7C4DFF',
  '#536DFE',
  '#448AFF',
  '#40C4FF',
  '#18FFFF',
  '#64FFDA',
  '#69F0AE',
  '#B2FF59',
  '#EEFF41',
  '#FFFF00',
  '#FFD740',
  '#FFAB40',
  '#FF6E40',
];

export const getDefaultCategoryId = (categories: AddGroupTransactionCategory[]): string =>
  (categories.find((category) => category.name === 'Other') ?? categories[0])?.id ?? '';

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + (hash << 5) - hash;
  }
  return avatarColors[Math.abs(hash) % avatarColors.length] ?? '#6B7280';
};

export const buildGroupBalanceViewModel = (
  group: GroupWithAvatarMembers | null,
  memberDebts: MemberDebt[],
): GroupBalanceViewModel | null => {
  if (!group) return null;
  return {
    memberBalances: group.members.map((member) => {
      const outstandingDebts = memberDebts.filter((debt) => debt.debtorId === member.id);
      const creditedAmounts = memberDebts.filter((debt) => debt.creditorId === member.id);
      const totalOwed = outstandingDebts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalCredit = creditedAmounts.reduce((sum, debt) => sum + debt.amount, 0);
      return {
        memberId: member.id,
        memberName: member.name,
        balance: totalCredit - totalOwed,
        totalPaid: member.totalPaid || 0,
        totalOwed,
        percentageOfTotalExpenses: 0,
        outstandingDebts,
        creditedAmounts,
      };
    }),
    totalExpenses:
      group.transactions
        ?.filter((transaction) => transaction.type === 'expense' && !transaction.isSettlement)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0,
    totalPayments:
      group.transactions
        ?.filter((transaction) => transaction.isSettlement)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0,
  };
};

interface FormValidityInput {
  amount: string;
  description: string;
  paidBy: string;
  receivedBy: string[];
  transactionType: GroupTransactionType;
  splitType?: GroupSplitType;
  customAmounts?: Record<string, string>;
  percentageAmounts?: Record<string, string>;
  sharesAmounts?: Record<string, string>;
}

export const isGroupTransactionFormValid = ({
  amount,
  description,
  paidBy,
  receivedBy,
  transactionType,
  splitType = 'equal',
  customAmounts = {},
  percentageAmounts = {},
  sharesAmounts = {},
}: FormValidityInput): boolean => {
  const numericAmount = Number.parseFloat(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0 || !paidBy) return false;

  if (transactionType === 'payment') {
    return receivedBy.length === 1 && receivedBy[0] !== paidBy;
  }

  if (!description.trim()) return false;

  if (splitType === 'custom') {
    const totalCustom = Object.values(customAmounts).reduce(
      (sum, val) => sum + (Number.parseFloat(val) || 0),
      0,
    );
    if (Math.abs(totalCustom - numericAmount) > 0.01) return false;
  } else if (splitType === 'percentage') {
    const totalPercentage = Object.values(percentageAmounts).reduce(
      (sum, val) => sum + (Number.parseFloat(val) || 0),
      0,
    );
    if (Math.abs(totalPercentage - 100) > 0.1) return false;
  } else if (splitType === 'shares') {
    const totalShares = Object.values(sharesAmounts).reduce(
      (sum, val) => sum + (Number.parseFloat(val) || 0),
      0,
    );
    if (totalShares <= 0) return false;
  }

  return true;
};
