import type {Category, GroupMember, Transaction} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {calculateGroupBalance} from '@/utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '@/utils/prepareFx';
import {
  calculateMonthlyTrends,
  calculateTopExpenseCategories,
  getSplitIncludesMember,
} from '../../utils/groupDetailScreenModels';
import type {
  GroupDetailBalanceViewModel,
  GroupDetailMemberViewModel,
  GroupDetailStats,
  GroupTransactionFilter,
} from '../../types/groupDetailScreen';

export const createGroupDetailStats = ({
  group,
  categories,
  groupCurrency,
  toGroupMember,
  getCurrentUserMember,
}: {
  group: EnhancedGroup;
  categories: Category[];
  groupCurrency: string;
  toGroupMember: (member: EnhancedGroupMember) => GroupMember;
  getCurrentUserMember: (members: EnhancedGroupMember[] | GroupMember[]) => GroupMember | undefined;
}): GroupDetailStats => {
  const safeTransactions = Array.isArray(group.transactions) ? group.transactions : [];
  const safeMembers = Array.isArray(group.members) ? group.members : [];
  const normalizedMembers = safeMembers.map(toGroupMember);
  const transactionsWithFx = prepareTransactionsWithFx(
    safeTransactions,
    group.currency || groupCurrency || 'USD',
  );
  const groupBalance = calculateGroupBalance(transactionsWithFx, normalizedMembers);
  const sortedMemberBalances = [...(groupBalance.memberBalances || [])].sort(
    (a, b) => b.balance - a.balance,
  );
  const currentUserMember = getCurrentUserMember(safeMembers);
  const currentUserBalance = currentUserMember
    ? (sortedMemberBalances.find((member) => member.memberId === currentUserMember.id)?.balance ??
      0)
    : 0;

  return {
    totalExpenses: groupBalance.totalExpenses,
    totalPayments: groupBalance.totalPayments,
    totalAmount: groupBalance.netBalance,
    currentUserBalance,
    totalReceived: sortedMemberBalances
      .filter((member) => member.balance > 0)
      .reduce((sum, member) => sum + member.balance, 0),
    perPersonShare:
      groupBalance.memberCount > 0 ? groupBalance.totalExpenses / groupBalance.memberCount : 0,
    memberCount: groupBalance.memberCount,
    transactionCount: groupBalance.transactionCount,
    memberBalances: sortedMemberBalances,
    topExpenseCategories: calculateTopExpenseCategories(safeTransactions, categories),
    monthlyTrends: calculateMonthlyTrends(safeTransactions),
    settlementSuggestions: [...(groupBalance.settlementSuggestions || [])]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3),
    debtMatrix: groupBalance.debtMatrix || {},
    lastActivityDate:
      safeTransactions.length > 0
        ? new Date(
            Math.max(
              ...safeTransactions.map((transaction) => new Date(transaction.date).getTime()),
            ),
          )
        : new Date(group.createdAt),
  };
};

export const createBalanceViewModel = (
  group: EnhancedGroup | null,
  stats: GroupDetailStats,
  currentUserMember?: GroupMember,
): GroupDetailBalanceViewModel => {
  const memberBalance = stats.memberBalances.find(
    (member) => member.memberId === currentUserMember?.id,
  );
  const oweAmount =
    memberBalance?.outstandingDebts.reduce((sum, debt) => sum + debt.amount, 0) ?? 0;
  const owedAmount =
    memberBalance?.creditedAmounts.reduce((sum, debt) => sum + debt.amount, 0) ?? 0;
  const totalPaidByCurrentUser =
    group?.transactions
      ?.filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.paidBy === currentUserMember?.id,
      )
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) ?? 0;
  const isActuallySettled = oweAmount < 0.01 && owedAmount < 0.01;
  const isPositive = stats.currentUserBalance > 0.01;
  const isBalanced = !isActuallySettled && Math.abs(stats.currentUserBalance) < 0.01;

  return {
    oweAmount,
    owedAmount,
    totalPaidByCurrentUser,
    currentUserShare: totalPaidByCurrentUser - stats.currentUserBalance,
    isActuallySettled,
    isPositive,
    isBalanced,
    shouldShowSettleCta:
      !isActuallySettled && !isPositive && stats.settlementSuggestions.length > 0,
  };
};

export const createMemberItems = ({
  group,
  userId,
  currentUserMemberId,
  profilePictureUri,
  stats,
}: {
  group: EnhancedGroup | null;
  userId?: string;
  currentUserMemberId?: string;
  profilePictureUri?: string;
  stats: GroupDetailStats;
}): GroupDetailMemberViewModel[] => {
  if (!group?.members) return [];

  return group.members.map((member) => {
    const typedMember = member;
    const isCurrentUser =
      typedMember.supabaseUserId === userId ||
      typedMember.id === userId ||
      typedMember.id === currentUserMemberId;
    const memberBalance = stats.memberBalances.find((item) => item.memberId === typedMember.id);
    const balance = memberBalance?.balance ?? 0;

    return {
      member: typedMember,
      avatarUri:
        isCurrentUser && profilePictureUri
          ? profilePictureUri
          : typedMember.avatar || typedMember.avatarUrl,
      isCurrentUser,
      balance,
      statusColor: balance > 0.01 ? '#4ADE80' : balance < -0.01 ? '#F87171' : 'transparent',
      hasStatus: Math.abs(balance) > 0.01,
    };
  });
};

export const filterTopTransactions = (
  transactions: Transaction[] | undefined,
  transactionFilter: GroupTransactionFilter,
  currentUserMemberId?: string,
) => {
  if (!transactions) return [];
  let sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (transactionFilter === 'all') return sorted.slice(0, 5);
  if (!currentUserMemberId) return sorted.slice(0, 5);

  if (transactionFilter === 'paid_by_me') {
    sorted = sorted.filter((transaction) => transaction.paidBy === currentUserMemberId);
  } else {
    sorted = sorted.filter((transaction) => {
      return (
        transaction.paidBy === currentUserMemberId ||
        getSplitIncludesMember(transaction, currentUserMemberId)
      );
    });
  }

  return sorted.slice(0, 5);
};

export const createSubtitle = (
  stats: GroupDetailStats,
  balanceViewModel: GroupDetailBalanceViewModel,
  formatCurrency: (amount: number) => string,
) => {
  if (!stats.memberBalances.length) return `${stats.memberCount} members`;
  if (balanceViewModel.isActuallySettled) return 'All settled';
  if (balanceViewModel.isBalanced) {
    return `Collect ${formatCurrency(balanceViewModel.owedAmount)} - Pay ${formatCurrency(balanceViewModel.oweAmount)}`;
  }
  if (balanceViewModel.isPositive) {
    return `You're owed ${formatCurrency(Math.abs(stats.currentUserBalance))}`;
  }
  return `You owe ${formatCurrency(Math.abs(stats.currentUserBalance))}`;
};
