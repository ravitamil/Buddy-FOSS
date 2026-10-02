import {getCurrencySymbol} from '@/constants/currencies';
import type {GroupMember} from '@/types';
import {calculateGroupBalance} from '@/utils/groupBalanceUtils.optimized';
import type {EnhancedGroup, EnhancedGroupMember} from '../types';
import type {GroupsScreenCardModel, GroupsScreenOverallStats} from './useGroupsScreen';

const groupCardColors = ['#4ECDC4', '#FF6B6B', '#FFE66D', '#1A535C', '#FF9F1C'];

export const toGroupMember = (member: EnhancedGroupMember): GroupMember => ({
  id: member.id,
  name: member.name,
  email: member.email,
  phone: member.phone,
  avatar: member.avatar,
  balance: member.balance,
  totalPaid: member.totalPaid,
  totalOwed: member.totalOwed,
  joinedAt: member.joinedAt,
  isActive: member.isActive,
  role: member.role === 'creator' ? 'creator' : 'member',
  lastActivity: member.lastActivity,
  supabaseUserId: member.supabaseUserId,
});

export const getGroupLatestActivityTimestamp = (group: EnhancedGroup): number => {
  let latest = 0;
  if (group.updatedAt) {
    const time = new Date(group.updatedAt).getTime();
    if (!Number.isNaN(time)) latest = Math.max(latest, time);
  }
  if (group.createdAt) {
    const time = new Date(group.createdAt).getTime();
    if (!Number.isNaN(time)) latest = Math.max(latest, time);
  }
  if (group.transactions && group.transactions.length > 0) {
    for (const transaction of group.transactions) {
      if (transaction.date) {
        const time = new Date(transaction.date).getTime();
        if (!Number.isNaN(time)) latest = Math.max(latest, time);
      }
      if (transaction.lastModified) {
        const time = new Date(transaction.lastModified).getTime();
        if (!Number.isNaN(time)) latest = Math.max(latest, time);
      }
    }
  }
  if (group.members && group.members.length > 0) {
    for (const member of group.members) {
      if (member.lastActivity) {
        const time = new Date(member.lastActivity).getTime();
        if (!Number.isNaN(time)) latest = Math.max(latest, time);
      }
    }
  }
  return latest;
};

export const filterGroups = (groups: EnhancedGroup[], searchQuery: string): EnhancedGroup[] => {
  const sorted = [...groups].sort(
    (a, b) => getGroupLatestActivityTimestamp(b) - getGroupLatestActivityTimestamp(a),
  );
  if (!searchQuery.trim()) return sorted;
  const query = searchQuery.toLowerCase().trim();
  return sorted.filter(
    (group) =>
      group.name.toLowerCase().includes(query) ||
      Boolean(group.description?.toLowerCase().includes(query)),
  );
};

export const getTotalExpenseAmount = (group: EnhancedGroup): number =>
  group.transactions?.reduce(
    (sum, transaction) =>
      transaction.type === 'expense' ? sum + Math.abs(transaction.amount) : sum,
    0,
  ) || 0;

export const getGroupCardColor = (groupId: string): string => {
  const colorIndex =
    groupId.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) %
    groupCardColors.length;
  return groupCardColors[colorIndex] ?? groupCardColors[0];
};

export const getOverallGroupStats = (
  groups: EnhancedGroup[],
  getBalance: (group: EnhancedGroup) => number,
): GroupsScreenOverallStats =>
  groups.reduce(
    (stats, group) => {
      const balance = getBalance(group);
      if (balance > 0) stats.owedToYou += balance;
      if (balance < 0) stats.youOwe += Math.abs(balance);
      return stats;
    },
    {youOwe: 0, owedToYou: 0},
  );

export const getGroupBalance = (
  group: EnhancedGroup,
  currentMember: GroupMember | undefined,
): number => {
  if (!currentMember) return 0;
  return (
    calculateGroupBalance(
      group.transactions || [],
      (group.members || []).map(toGroupMember),
    ).memberBalances.find((member) => member.memberId === currentMember.id)?.balance ?? 0
  );
};

export const buildGroupCardModel = (
  group: EnhancedGroup,
  yourShare: number,
): GroupsScreenCardModel => {
  const currency = group.currency || 'USD';
  const latestTimestamp = getGroupLatestActivityTimestamp(group);
  return {
    id: group.id,
    name: group.name,
    members: group.members?.length || 0,
    yourShare,
    totalAmount: getTotalExpenseAmount(group),
    color: getGroupCardColor(group.id),
    emoji: group.emoji,
    lastActivityDate:
      latestTimestamp > 0
        ? new Date(latestTimestamp)
        : group.updatedAt
          ? new Date(group.updatedAt)
          : new Date(group.createdAt || Date.now()),
    currency,
    currencySymbol: getCurrencySymbol(currency),
  };
};
