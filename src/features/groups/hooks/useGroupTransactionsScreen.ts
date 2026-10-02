import {useCallback, useMemo, useState} from 'react';
import {useRouter} from 'expo-router';

import {useAuth, useCategory, useGroups, useSettings, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {GroupMember, Transaction} from '@/types';
import {findCurrentUserMember} from '@/utils/userUtils';
import type {EnhancedGroup, EnhancedGroupMember} from '../types';
import type {GroupDetailTransactionItem} from '../types/groupDetailScreen';
import {createGroupDetailTransactionItem} from '../utils/groupDetailScreenModels';

export type GroupAllTransactionsFilter = 'all' | 'expense' | 'payment' | 'paid_by_me' | 'my_share';

export interface UseGroupTransactionsScreenOptions {
  groupId: string;
}

export interface GroupTransactionsSummary {
  totalExpenses: number;
  totalPayments: number;
  userPaid: number;
  userShare: number;
  netBalance: number;
  totalCount: number;
  filteredCount: number;
}

export interface UseGroupTransactionsScreenResult {
  group: EnhancedGroup | null;
  isLoading: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  activeFilter: GroupAllTransactionsFilter;
  filteredTransactions: Transaction[];
  summary: GroupTransactionsSummary;
  isDarkMode: boolean;
  currencySymbol: string;
  currencyCode: string;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isScrollingDown: ReturnType<typeof useProgressiveBlurHeader>['isScrollingDown'];
  formatCurrency: (amount: number) => string;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  setActiveFilter: (filter: GroupAllTransactionsFilter) => void;
  getTransactionItem: (transaction: Transaction) => GroupDetailTransactionItem | null;
  onBack: () => void;
  onAddTransaction: () => void;
  onTransactionPress: (transactionId: string) => void;
}

export const useGroupTransactionsScreen = ({
  groupId,
}: UseGroupTransactionsScreenOptions): UseGroupTransactionsScreenResult => {
  const router = useRouter();
  const {groups, isLoading} = useGroups();
  const {user} = useAuth();
  const {profile} = useUser();
  const {categories} = useCategory();
  const {formatCurrency, currency, groupCurrency} = useSettings();
  const {isDarkMode} = useTamaguiTheme();
  const {headerProps, onScroll, isScrollingDown} = useProgressiveBlurHeader();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<GroupAllTransactionsFilter>('all');

  const group = useMemo(() => {
    return (groups.items.find((g) => g.id === groupId) as unknown as EnhancedGroup) || null;
  }, [groupId, groups.items]);

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

  const currentUserMember = useMemo(() => {
    if (!group?.members) return undefined;
    const normalizedMembers = group.members.map((m) => ('permissions' in m ? toGroupMember(m) : m));
    const displayName = getUserDisplayName().toLowerCase().trim();
    return (
      normalizedMembers.find((m) => m.supabaseUserId === user?.uid) ||
      findCurrentUserMember(
        normalizedMembers,
        userFirstName,
        profile?.displayName ?? undefined,
        getUserDisplayName,
      ) ||
      normalizedMembers.find((m) => m.name.toLowerCase().trim() === displayName)
    );
  }, [
    getUserDisplayName,
    group?.members,
    profile?.displayName,
    toGroupMember,
    user?.uid,
    userFirstName,
  ]);

  const rawTransactions = useMemo(() => {
    if (!group?.transactions) return [];
    return [...group.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [group?.transactions]);

  const summary = useMemo<GroupTransactionsSummary>(() => {
    let totalExpenses = 0;
    let totalPayments = 0;
    let userPaid = 0;
    let userShare = 0;

    const currentMemberId = currentUserMember?.id;

    for (const transaction of rawTransactions) {
      const amount = Math.abs(transaction.amount);
      const isExpense = transaction.type === 'expense' && !transaction.isSettlement;
      const isPayment = transaction.isSettlement || transaction.type === 'income';

      if (isExpense) {
        totalExpenses += amount;

        if (currentMemberId && transaction.paidBy === currentMemberId) {
          userPaid += amount;
        }

        if (currentMemberId) {
          if (transaction.splitDetails && transaction.splitDetails.length > 0) {
            const userSplit = transaction.splitDetails.find(
              (split) => split.memberId === currentMemberId,
            );
            if (userSplit) {
              userShare += userSplit.amount || 0;
            }
          } else if (transaction.splitAmong && transaction.splitAmong.length > 0) {
            if (transaction.splitAmong.includes(currentMemberId)) {
              userShare += amount / transaction.splitAmong.length;
            }
          } else if (group?.members && group.members.length > 0) {
            userShare += amount / group.members.length;
          }
        }
      } else if (isPayment) {
        totalPayments += amount;
      }
    }

    return {
      totalExpenses,
      totalPayments,
      userPaid,
      userShare,
      netBalance: userPaid - userShare,
      totalCount: rawTransactions.length,
      filteredCount: 0,
    };
  }, [currentUserMember?.id, group?.members, rawTransactions]);

  const filteredTransactions = useMemo(() => {
    const currentMemberId = currentUserMember?.id;
    const query = searchQuery.trim().toLowerCase();

    return rawTransactions.filter((transaction) => {
      // 1. Filter by Active Filter Tab
      if (activeFilter === 'expense') {
        if (transaction.type !== 'expense' || transaction.isSettlement) return false;
      } else if (activeFilter === 'payment') {
        if (!transaction.isSettlement && transaction.type !== 'income') return false;
      } else if (activeFilter === 'paid_by_me') {
        if (!currentMemberId || transaction.paidBy !== currentMemberId) return false;
      } else if (activeFilter === 'my_share') {
        if (transaction.type !== 'expense' || transaction.isSettlement) return false;
        if (!currentMemberId) return false;

        const isIncluded =
          transaction.splitAmong?.includes(currentMemberId) ||
          transaction.splitDetails?.some((detail) => detail.memberId === currentMemberId);
        if (!isIncluded) return false;
      }

      // 2. Filter by Search Query
      if (query.length > 0) {
        const descMatch = transaction.description?.toLowerCase().includes(query);
        const categoryMatch =
          typeof transaction.category === 'string' &&
          transaction.category.toLowerCase().includes(query);
        const paidByMember = group?.members.find((m) => m.id === transaction.paidBy);
        const payerMatch = paidByMember?.name.toLowerCase().includes(query);

        if (!descMatch && !categoryMatch && !payerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilter, currentUserMember?.id, group?.members, rawTransactions, searchQuery]);

  const summaryWithFiltered = useMemo(
    () => ({
      ...summary,
      filteredCount: filteredTransactions.length,
    }),
    [filteredTransactions.length, summary],
  );

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

  const effectiveCurrencyCode = groupCurrency || currency || 'USD';
  const currencySymbol =
    groupCurrency === 'INR'
      ? '₹'
      : groupCurrency === 'EUR'
        ? '€'
        : groupCurrency === 'GBP'
          ? '£'
          : '$';

  return {
    group,
    isLoading,
    searchQuery,
    isSearchOpen,
    activeFilter,
    filteredTransactions,
    summary: summaryWithFiltered,
    isDarkMode,
    currencySymbol,
    currencyCode: effectiveCurrencyCode,
    headerProps,
    onScroll,
    isScrollingDown,
    formatCurrency,
    setSearchQuery,
    setIsSearchOpen,
    setActiveFilter,
    getTransactionItem,
    onBack: () => router.back(),
    onAddTransaction: () => router.push(`/groups/${groupId}/add-transaction`),
    onTransactionPress: (transactionId: string) =>
      router.push(`/groups/${groupId}/transactions/${transactionId}`),
  };
};
