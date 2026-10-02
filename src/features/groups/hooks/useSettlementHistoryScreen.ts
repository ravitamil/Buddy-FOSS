import {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from 'expo-router';

import {useAuth, useGroups, useSettings, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import type {GroupMember, SettlementSuggestion, Transaction} from '@/types';
import type {EnhancedGroupMember} from '@/features/groups/types';
import {
  calculateGroupBalance,
  type GroupBalanceCalculation,
} from '@/utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '@/utils/prepareFx';

interface SettlementHistoryScreenOptions {
  groupId: string;
}

const toGroupMember = (member: EnhancedGroupMember): GroupMember => ({
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

const getSettlementTransactions = (transactions?: Transaction[]): Transaction[] => {
  if (!transactions) return [];
  return transactions
    .filter((transaction) => transaction.isSettlement)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const useSettlementHistoryScreen = ({groupId}: SettlementHistoryScreenOptions) => {
  const router = useRouter();
  const {formatCurrency, settlementStrategy, currency, groupCurrency} = useSettings();
  const {groups} = useGroups();
  const {user} = useAuth();
  const {profile} = useUser();
  const {isDarkMode} = useTamaguiTheme();
  const {headerProps, onScroll} = useProgressiveBlurHeader();

  const group = groups.items.find((item) => item.id === groupId);

  const getUserDisplayName = useCallback(() => {
    return profile?.displayName || profile?.firstName || user?.displayName || 'User';
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const groupMembers = useMemo<GroupMember[]>(
    () => group?.members.map(toGroupMember) ?? [],
    [group?.members],
  );

  const effectiveCurrency = group?.currency || groupCurrency || currency || 'USD';

  const transactionsWithFx = useMemo(
    () => prepareTransactionsWithFx(group?.transactions || [], effectiveCurrency),
    [effectiveCurrency, group?.transactions],
  );

  const groupBalance = useMemo<GroupBalanceCalculation | null>(() => {
    if (!group) return null;
    return calculateGroupBalance(transactionsWithFx, groupMembers);
  }, [group, groupMembers, transactionsWithFx]);

  const [suggestions, setSuggestions] = useState<SettlementSuggestion[]>([]);

  useEffect(() => {
    if (!group) {
      setSuggestions([]);
      return;
    }

    try {
      const calc = calculateGroupBalance(transactionsWithFx, groupMembers);
      setSuggestions(calc.settlementSuggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, [group, groupMembers, settlementStrategy, transactionsWithFx]);

  const settlementTransactions = useMemo(
    () => getSettlementTransactions(group?.transactions),
    [group?.transactions],
  );

  const totalSettled = useMemo(
    () =>
      settlementTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [settlementTransactions],
  );

  const outstandingAmount = useMemo(
    () =>
      groupBalance?.memberBalances.reduce((sum, memberBalance) => {
        return sum + Math.max(0, memberBalance.balance);
      }, 0) || 0,
    [groupBalance?.memberBalances],
  );

  const suggestionsA11y = useMemo(() => {
    if (!suggestions.length) return 'No suggested payments available.';
    const total = suggestions.reduce((sum, suggestion) => sum + (suggestion.amount || 0), 0);
    return `Suggested payments: ${suggestions.length} payments totaling ${formatCurrency(total)}.`;
  }, [formatCurrency, suggestions]);

  const paymentHistoryA11y = useMemo(() => {
    const count = settlementTransactions.length;
    const latest = settlementTransactions[0];
    const latestText = latest
      ? ` Latest payment on ${new Date(latest.date).toLocaleDateString()}.`
      : '';
    return `Payment history: ${count} payments totaling ${formatCurrency(totalSettled)}.${latestText}`;
  }, [formatCurrency, settlementTransactions, totalSettled]);

  const navigateBack = useCallback(() => router.back(), [router]);

  const navigateRecordPayment = useCallback(() => {
    if (group) router.push(appRoutes.groupAddTransaction(group.id));
  }, [group, router]);

  const navigateSettleSuggestion = useCallback(
    (suggestion: SettlementSuggestion) => {
      if (!group) return;

      router.push(
        appRoutes.groupAddTransaction(group.id, {
          initialType: 'payment',
          initialPaidBy: suggestion.fromMemberId,
          initialReceivedBy: suggestion.toMemberId,
          initialAmount: String(suggestion.amount),
        }),
      );
    },
    [group, router],
  );

  return {
    group,
    groupBalance,
    suggestions,
    settlementTransactions,
    totalSettled,
    outstandingAmount,
    suggestionsA11y,
    paymentHistoryA11y,
    isDarkMode,
    profile,
    formatCurrency,
    getUserDisplayName,
    headerProps,
    onScroll,
    navigateBack,
    navigateRecordPayment,
    navigateSettleSuggestion,
  };
};
