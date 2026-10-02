import {useCallback, useMemo} from 'react';
import {useRouter} from 'expo-router';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useAuth, useCategory, useGroups, useSettings, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useToast} from '@/context/ToastContext';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import type {EnhancedGroupMember} from '@/features/groups/types';
import type {Category, GroupMember} from '@/types';
import {findCurrentUserMember, formatUserDisplayName} from '@/utils/userUtils';

interface UseGroupTransactionDetailScreenOptions {
  transactionId: string;
  groupId: string;
}

export interface GroupTransactionMemberSplit {
  member?: GroupMember | EnhancedGroupMember;
  amount: number;
  isCurrentUser: boolean;
}

export interface GroupTransactionSplitDetails {
  paidByMember?: GroupMember | EnhancedGroupMember;
  isPaidByCurrentUser: boolean;
  memberSplits: GroupTransactionMemberSplit[];
  totalAmount: number;
}

export interface GroupTransactionIcon {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const useGroupTransactionDetailScreen = ({
  transactionId,
  groupId,
}: UseGroupTransactionDetailScreenOptions) => {
  const router = useRouter();
  const {groups, deleteGroupExpense} = useGroups();
  const {showToast} = useToast();
  const {formatCurrency} = useSettings();
  const {user} = useAuth();
  const {profile} = useUser();
  const {categories} = useCategory();
  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, headerProps, largeTitleStyle} = useProgressiveBlurHeader();

  const getUserDisplayName = useCallback(() => {
    return profile?.displayName || profile?.firstName || user?.displayName || 'User';
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const currentTransactionId = transactionId;
  const currentGroupId = groupId;

  const group = groups.items.find((item) => item.id === currentGroupId);
  const transaction = group?.transactions?.find((item) => item.id === currentTransactionId);

  appLogger.debug('GroupTransactionDetailScreen: Debug info:', {
    transactionId: currentTransactionId,
    groupId: currentGroupId,
    groupFound: !!group,
    transactionFound: !!transaction,
    groupName: group?.name,
  });

  const currentUserMember = useMemo(() => {
    if (!group) return undefined;
    return findCurrentUserMember(group.members, profile?.firstName, undefined, getUserDisplayName);
  }, [getUserDisplayName, group, profile?.firstName]);

  const formatMemberName = useCallback(
    (name: string) =>
      formatUserDisplayName(name, profile?.firstName, undefined, getUserDisplayName),
    [getUserDisplayName, profile?.firstName],
  );

  const splitDetails = useMemo<GroupTransactionSplitDetails | null>(() => {
    if (!transaction || !group) return null;

    const paidByMember = group.members.find((member) => member.id === transaction.paidBy);
    const isPaidByCurrentUser = paidByMember?.id === currentUserMember?.id;
    const memberSplits =
      transaction.type === 'expense' && transaction.splitAmounts
        ? Object.entries(transaction.splitAmounts).map(([memberId, amount]) => {
            const member = group.members.find((item) => item.id === memberId);
            return {
              member,
              amount,
              isCurrentUser: member?.id === currentUserMember?.id,
            };
          })
        : [];

    return {
      paidByMember,
      isPaidByCurrentUser,
      memberSplits,
      totalAmount: Math.abs(transaction.amount),
    };
  }, [currentUserMember?.id, group, transaction]);

  const transactionIcon = useMemo<GroupTransactionIcon>(() => {
    if (transaction?.type === 'expense') {
      return splitDetails?.isPaidByCurrentUser
        ? {name: 'arrow-up', color: '#4CAF50'}
        : {name: 'arrow-down', color: '#F44336'};
    }

    return splitDetails?.isPaidByCurrentUser
      ? {name: 'arrow-up', color: '#2196F3'}
      : {name: 'arrow-down', color: '#4CAF50'};
  }, [splitDetails?.isPaidByCurrentUser, transaction?.type]);

  const dynamicDescription = useMemo(() => {
    if (!transaction || !group) return '';
    if (!transaction.isSettlement) return transaction.description;

    const paidByMember = group.members.find((member) => member.id === transaction.paidBy);
    const receivedByMember = transaction.receivedBy?.length
      ? group.members.find((member) => member.id === transaction.receivedBy?.[0])
      : null;
    const payerName = paidByMember ? formatMemberName(paidByMember.name) : 'Unknown';
    const receiverName = receivedByMember ? formatMemberName(receivedByMember.name) : 'Unknown';

    return `Payment from ${payerName} to ${receiverName}`;
  }, [formatMemberName, group, transaction]);

  const getCategory = useCallback(
    (categoryId?: string): Category | undefined =>
      categories.find((category) => category.id === categoryId),
    [categories],
  );

  const handleBack = useCallback(() => router.back(), [router]);
  const handleEdit = useCallback(() => {
    if (!group || !transaction) return;
    router.push(appRoutes.groupEditTransaction(group.id, transaction.id));
  }, [group, router, transaction]);
  const handleViewGroup = useCallback(() => {
    if (group) router.push(appRoutes.groupDetail(group.id));
  }, [group, router]);
  const handleViewAllTransactions = useCallback(() => {
    if (group) router.push(appRoutes.groupAllTransactions(group.id));
  }, [group, router]);
  const handleDelete = useCallback(() => {
    if (!group || !transaction) return;

    appLogger.debug('Delete transaction requested:', transaction.id);
    void (async () => {
      try {
        await deleteGroupExpense(group.id, transaction.id);
        showToast({title: 'Transaction deleted successfully', type: 'success'});
        router.back();
      } catch (error) {
        appLogger.error('Failed to delete transaction:', error);
        showToast({
          title: error instanceof Error ? error.message : 'Failed to delete transaction',
          type: 'error',
        });
      }
    })();
  }, [deleteGroupExpense, group, router, showToast, transaction]);

  return {
    group,
    transaction,
    splitDetails,
    transactionIcon,
    dynamicDescription,
    categories,
    isDarkMode,
    headerProps,
    largeTitleStyle,
    onScroll,
    currentUserMember,
    formatCurrency,
    formatMemberName,
    getCategory,
    handleBack,
    handleEdit,
    handleDelete,
    handleViewGroup,
    handleViewAllTransactions,
  };
};

export type UseGroupTransactionDetailScreenResult = ReturnType<
  typeof useGroupTransactionDetailScreen
>;
