import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {EnhancedGroup} from '@/features/groups/types';
import type {Category, Group, GroupMember, Transaction} from '@/types';

import type {
  CategoryLike,
  GroupDetailCategory,
  GroupDetailStats,
  GroupDetailTransactionItem,
  GroupTransactionImpactType,
  GroupDetailMemberWithAvatarUrl,
  SplitDetailWithUserId,
  TransactionWithCategoryObject,
} from '../types/groupDetailScreen';

export const emptyGroupDetailStats = (group?: EnhancedGroup | Group | null): GroupDetailStats => ({
  totalExpenses: 0,
  totalPayments: 0,
  totalAmount: 0,
  totalReceived: 0,
  perPersonShare: 0,
  memberCount: Array.isArray(group?.members) ? group.members.length : 0,
  transactionCount: Array.isArray(group?.transactions) ? group.transactions.length : 0,
  memberBalances: [],
  topExpenseCategories: [],
  monthlyTrends: [],
  settlementSuggestions: [],
  currentUserBalance: 0,
  debtMatrix: {},
  lastActivityDate: new Date(group?.createdAt || Date.now()),
});

export const calculateTopExpenseCategories = (
  transactions: Transaction[],
  categories: GroupDetailCategory[],
) => {
  const expenseTransactions = transactions.filter((transaction) => transaction.type === 'expense');
  if (expenseTransactions.length === 0) return [];

  const categoryMap = new Map<string, {totalAmount: number; transactionCount: number}>();
  let totalExpenseAmount = 0;

  expenseTransactions.forEach((transaction) => {
    const category = transaction.categoryId
      ? categories.find((item) => item.id === transaction.categoryId)
      : null;
    const categoryName = category?.name || transaction.category || 'Uncategorized';
    const amount = Math.abs(transaction.amount);
    const existing = categoryMap.get(categoryName);

    totalExpenseAmount += amount;
    categoryMap.set(categoryName, {
      totalAmount: (existing?.totalAmount ?? 0) + amount,
      transactionCount: (existing?.transactionCount ?? 0) + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      totalAmount: data.totalAmount,
      transactionCount: data.transactionCount,
      percentage: totalExpenseAmount > 0 ? (data.totalAmount / totalExpenseAmount) * 100 : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);
};

export const calculateMonthlyTrends = (transactions: Transaction[]) => {
  const monthlyMap = new Map<
    string,
    {
      totalExpenses: number;
      totalIncome: number;
      transactionCount: number;
      year: number;
      month: string;
    }
  >();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', {month: 'short'});
    const monthKey = `${year}-${date.getMonth()}`;
    const amount = Math.abs(transaction.amount);
    const existing = monthlyMap.get(monthKey);

    monthlyMap.set(monthKey, {
      totalExpenses: (existing?.totalExpenses ?? 0) + (transaction.type === 'expense' ? amount : 0),
      totalIncome: (existing?.totalIncome ?? 0) + (transaction.type === 'income' ? amount : 0),
      transactionCount: (existing?.transactionCount ?? 0) + 1,
      year,
      month,
    });
  });

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return Array.from(monthlyMap.values())
    .map((data) => ({
      ...data,
      netAmount: data.totalIncome - data.totalExpenses,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
    })
    .slice(0, 6);
};

export const getCategoryObject = (transaction: Transaction): CategoryLike | null => {
  const category = (transaction as TransactionWithCategoryObject).category;
  return typeof category === 'object' && category !== null ? category : null;
};

export const getSplitIncludesMember = (transaction: Transaction, memberId: string) => {
  if (transaction.splitAmong?.includes(memberId)) return true;
  return (
    transaction.splitDetails?.some((detail: SplitDetailWithUserId) => {
      return detail.memberId === memberId || detail.userId === memberId;
    }) ?? false
  );
};

export const createGroupDetailTransactionItem = ({
  transaction,
  group,
  currentUserMember,
  categories,
  isDarkMode,
}: {
  transaction: Transaction;
  group: EnhancedGroup;
  currentUserMember?: GroupMember;
  categories: Category[];
  isDarkMode: boolean;
}): GroupDetailTransactionItem => {
  const isSettlement =
    transaction.isSettlement === true ||
    transaction.category === 'Settlement' ||
    transaction.category === 'settlement' ||
    (typeof transaction.description === 'string' &&
      (transaction.description.startsWith('Repayment from') ||
        transaction.description.startsWith('Settlement from')));

  const totalAmount = Math.abs(transaction.amount);
  const paidByMember = transaction.paidBy
    ? group.members.find((member) => member.id === transaction.paidBy)
    : null;
  const isPaidByCurrentUser = paidByMember?.id === currentUserMember?.id;
  const dateFormatted = new Date(transaction.date).toLocaleDateString();

  if (isSettlement) {
    const receiverId =
      transaction.receivedBy?.[0] ||
      transaction.splitAmong?.find((id) => id !== transaction.paidBy);
    const receiverMember = receiverId
      ? group.members.find((member) => member.id === receiverId)
      : null;
    const isReceiver = receiverMember?.id === currentUserMember?.id;

    let title = transaction.description;
    if (
      !title ||
      title.startsWith('Repayment from') ||
      title.startsWith('Settlement from') ||
      title === 'Payment'
    ) {
      if (isReceiver && paidByMember) {
        title = `Payment from ${paidByMember.name}`;
      } else if (isPaidByCurrentUser && receiverMember) {
        title = `Payment to ${receiverMember.name}`;
      } else if (paidByMember && receiverMember) {
        title = `${paidByMember.name} → ${receiverMember.name}`;
      } else {
        title = 'Debt Settlement';
      }
    }

    let netAmount = totalAmount;
    let impactType: GroupTransactionImpactType = 'neutral';
    let impactLabel = 'settled';

    if (isReceiver) {
      netAmount = totalAmount;
      impactType = 'received';
      impactLabel = 'you received';
    } else if (isPaidByCurrentUser) {
      netAmount = -totalAmount;
      impactType = 'paid';
      impactLabel = 'you paid';
    } else {
      netAmount = totalAmount;
      impactType = 'neutral';
      impactLabel = 'settled';
    }

    return {
      id: transaction.id,
      description: title,
      amount: netAmount,
      totalAmount,
      netAmount,
      impactType,
      impactLabel,
      date: dateFormatted,
      type: 'income',
      category: {
        name: 'Settlement',
        icon: 'swap-horizontal',
        color: isDarkMode ? '#34D399' : '#059669',
      },
      subtitle: `Settlement • ${dateFormatted}`,
      payerName: paidByMember?.name,
      isSettlement: true,
      settlementStatus: 'settled',
    };
  }

  // Regular Expense
  const currentMemberId = currentUserMember?.id;
  let userShare = 0;
  let isIncludedInSplit = false;

  if (currentMemberId) {
    if (transaction.splitDetails && transaction.splitDetails.length > 0) {
      const userSplit = transaction.splitDetails.find(
        (split) => split.memberId === currentMemberId,
      );
      if (userSplit) {
        userShare = userSplit.amount || 0;
        isIncludedInSplit = true;
      }
    } else if (
      transaction.splitAmounts &&
      transaction.splitAmounts[currentMemberId] !== undefined
    ) {
      userShare = transaction.splitAmounts[currentMemberId];
      isIncludedInSplit = true;
    } else if (transaction.splitAmong && transaction.splitAmong.length > 0) {
      if (transaction.splitAmong.includes(currentMemberId)) {
        userShare = totalAmount / transaction.splitAmong.length;
        isIncludedInSplit = true;
      }
    } else if (group.members && group.members.length > 0) {
      userShare = totalAmount / group.members.length;
      isIncludedInSplit = true;
    }
  }

  let netAmount = 0;
  let impactType: GroupTransactionImpactType = 'neutral';
  let impactLabel = 'not involved';

  if (isPaidByCurrentUser) {
    const lent = totalAmount - userShare;
    netAmount = lent;
    if (lent > 0.005) {
      impactType = 'lent';
      impactLabel = 'you lent';
    } else {
      impactType = 'neutral';
      impactLabel = 'you paid';
    }
  } else if (isIncludedInSplit && userShare > 0.005) {
    netAmount = -userShare;
    impactType = 'borrowed';
    impactLabel = 'you owe';
  } else {
    netAmount = 0;
    impactType = 'neutral';
    impactLabel = 'not involved';
  }

  let settlementStatus: GroupDetailTransactionItem['settlementStatus'];
  if (transaction.splitDetails && currentUserMember && !isPaidByCurrentUser) {
    const userSplit = transaction.splitDetails.find(
      (split) => split.memberId === currentUserMember.id,
    );
    if (userSplit) {
      settlementStatus = userSplit.isPaid
        ? 'settled'
        : (userSplit.settledAmount || 0) > 0.01
          ? 'partial'
          : 'unsettled';
    }
  } else if (transaction.splitDetails && isPaidByCurrentUser) {
    const otherSplits = transaction.splitDetails.filter(
      (split) => split.memberId !== currentUserMember?.id,
    );
    if (otherSplits.length > 0) {
      const allPaid = otherSplits.every((split) => split.isPaid);
      const anyPaid = otherSplits.some((split) => (split.settledAmount || 0) > 0.01);
      settlementStatus = allPaid ? 'settled' : anyPaid ? 'partial' : undefined;
    }
  }

  const categoryObj = transaction.categoryId
    ? categories.find((category) => category.id === transaction.categoryId)
    : null;
  const categoryObject = getCategoryObject(transaction);
  const categoryNameFromTransaction =
    typeof transaction.category === 'string' ? transaction.category : categoryObject?.name;
  const resolvedCategoryName = categoryObj?.name || categoryNameFromTransaction || 'General';

  const defaultCategoryColor = isDarkMode ? '#38BDF8' : '#0284C7';
  const categoryIcon: keyof typeof Ionicons.glyphMap =
    (categoryObj?.icon as keyof typeof Ionicons.glyphMap | undefined) ||
    categoryObject?.icon ||
    'receipt-outline';
  const categoryColor = categoryObj?.color || categoryObject?.color || defaultCategoryColor;

  const payerDisplayName = isPaidByCurrentUser ? 'You' : paidByMember?.name || 'Someone';
  const subtitle = `${resolvedCategoryName} • ${payerDisplayName} paid • ${dateFormatted}`;

  return {
    id: transaction.id,
    description: transaction.description || resolvedCategoryName,
    amount: netAmount,
    totalAmount,
    netAmount,
    impactType,
    impactLabel,
    date: dateFormatted,
    type: transaction.type,
    category: {
      name: resolvedCategoryName,
      icon: categoryIcon,
      color: categoryColor,
    },
    subtitle,
    payerName: paidByMember?.name,
    groupName: paidByMember ? `by ${paidByMember.name}` : undefined,
    isSettlement: false,
    isRecurring: transaction.isRecurring,
    settlementStatus,
  };
};

export type {GroupDetailMemberWithAvatarUrl};
