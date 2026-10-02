import {useCallback, useMemo} from 'react';

import type {Category, GroupMember, Transaction} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {logger as appLogger} from '@/services/LoggerService';
import {findCurrentUserMember} from '@/utils/userUtils';
import {
  createBalanceViewModel,
  createGroupDetailStats,
  createMemberItems,
  createSubtitle,
  filterTopTransactions,
} from './groupDetailModelBuilders';
import {
  createGroupDetailTransactionItem,
  emptyGroupDetailStats,
} from '../../utils/groupDetailScreenModels';
import type {
  GroupDetailBalanceViewModel,
  GroupDetailMemberViewModel,
  GroupDetailStats,
  GroupDetailTransactionItem,
  GroupTransactionFilter,
} from '../../types/groupDetailScreen';

interface UseGroupDetailModelsParams {
  group: EnhancedGroup | null;
  user?: {uid?: string; displayName?: string | null} | null;
  profile?: {
    firstName?: string | null;
    displayName?: string | null;
    profilePictureUri?: string | null;
  } | null;
  categories: Category[];
  groupCurrency: string;
  formatCurrency: (amount: number) => string;
  isDarkMode: boolean;
  transactionFilter: GroupTransactionFilter;
}

export const useGroupDetailModels = ({
  group,
  user,
  profile,
  categories,
  groupCurrency,
  formatCurrency,
  isDarkMode,
  transactionFilter,
}: UseGroupDetailModelsParams) => {
  const userFirstName = profile?.firstName || user?.displayName?.split(' ')[0] || 'User';

  const getUserDisplayName = useCallback(() => {
    return profile?.displayName || profile?.firstName || user?.displayName || 'User';
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const toGroupMember = useCallback(
    (member: EnhancedGroupMember): GroupMember => ({
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
    }),
    [],
  );

  const getCurrentUserMember = useCallback(
    (members: EnhancedGroupMember[] | GroupMember[]) => {
      const normalizedMembers = members.map((member) =>
        'permissions' in member ? toGroupMember(member) : member,
      );
      const displayName = getUserDisplayName().toLowerCase().trim();
      return (
        normalizedMembers.find((member) => member.supabaseUserId === user?.uid) ||
        findCurrentUserMember(
          normalizedMembers,
          userFirstName,
          profile?.displayName ?? undefined,
          getUserDisplayName,
        ) ||
        normalizedMembers.find((member) => member.name.toLowerCase().trim() === displayName)
      );
    },
    [getUserDisplayName, profile?.displayName, toGroupMember, user?.uid, userFirstName],
  );

  const stats = useMemo<GroupDetailStats>(() => {
    if (!group) return emptyGroupDetailStats(null);

    try {
      return createGroupDetailStats({
        group,
        categories,
        groupCurrency,
        toGroupMember,
        getCurrentUserMember,
      });
    } catch (error) {
      appLogger.error('GroupDetailScreen: failed to calculate group stats', error, {
        groupId: group.id,
      });
      return emptyGroupDetailStats(group);
    }
  }, [categories, getCurrentUserMember, group, groupCurrency, toGroupMember]);

  const currentUserMember = useMemo(() => {
    return group ? getCurrentUserMember(group.members) : undefined;
  }, [getCurrentUserMember, group]);

  const balanceViewModel = useMemo<GroupDetailBalanceViewModel>(() => {
    return createBalanceViewModel(group, stats, currentUserMember);
  }, [currentUserMember, group, stats]);

  const memberItems = useMemo<GroupDetailMemberViewModel[]>(() => {
    return createMemberItems({
      group,
      userId: user?.uid,
      currentUserMemberId: currentUserMember?.id,
      profilePictureUri: profile?.profilePictureUri ?? undefined,
      stats,
    });
  }, [currentUserMember?.id, group, profile?.profilePictureUri, stats, user?.uid]);

  const filteredTopTransactions = useMemo(() => {
    return filterTopTransactions(group?.transactions, transactionFilter, currentUserMember?.id);
  }, [currentUserMember?.id, group?.transactions, transactionFilter]);

  const subtitle = useMemo(() => {
    return createSubtitle(stats, balanceViewModel, formatCurrency);
  }, [balanceViewModel, formatCurrency, stats]);

  const getTransactionItem = useCallback(
    (transaction: Transaction): GroupDetailTransactionItem | null => {
      if (!group) return null;

      return createGroupDetailTransactionItem({
        transaction,
        group,
        currentUserMember,
        categories,
        isDarkMode,
      });
    },
    [categories, currentUserMember, group, isDarkMode],
  );

  return {
    userFirstName,
    getUserDisplayName,
    currentUserMember,
    stats,
    balanceViewModel,
    memberItems,
    filteredTopTransactions,
    subtitle,
    getTransactionItem,
  };
};
