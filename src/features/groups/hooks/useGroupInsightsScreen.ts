import {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from 'expo-router';

import {useAuth, useGroups, useSettings, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import type {GroupMember} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {
  calculateGroupBalance,
  type GroupBalanceCalculation,
  type MemberBalance,
} from '@/utils/groupBalanceUtils.optimized';
import {useListPerformance, usePerformanceMemo} from '@/utils/performanceUtils';
import {formatUserDisplayName} from '@/utils/userUtils';

export type GroupInsightsViewMode = 'debts' | 'members' | 'analytics';

export interface GroupInsightsDebt {
  fromMember: MemberBalance;
  toMember: MemberBalance;
  fromAvatar?: string;
  toAvatar?: string;
  amount: number;
}

interface MemberWithAvatar extends EnhancedGroupMember {
  avatar?: string;
}

interface GroupInsightsScreenOptions {
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

export const useGroupInsightsScreen = ({groupId}: GroupInsightsScreenOptions) => {
  const router = useRouter();
  const {isDarkMode} = useTamaguiTheme();
  const {groups} = useGroups();
  const {user} = useAuth();
  const {profile} = useUser();
  const {formatCurrency} = useSettings();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();

  const [group, setGroup] = useState<EnhancedGroup | null>(null);
  const [viewMode, setViewMode] = useState<GroupInsightsViewMode>('debts');
  const [isLoading, setIsLoading] = useState(true);

  const getUserDisplayName = useCallback(() => {
    return profile?.displayName || profile?.firstName || user?.displayName || 'User';
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const userFirstName = profile?.firstName || user?.displayName?.split(' ')[0] || 'User';

  const getDisplayName = useCallback(
    (name: string): string => {
      try {
        return formatUserDisplayName(name, userFirstName, undefined, getUserDisplayName);
      } catch {
        return name;
      }
    },
    [getUserDisplayName, userFirstName],
  );

  const groupBalance = usePerformanceMemo<GroupBalanceCalculation | null>(
    () => {
      if (!group) return null;
      const transactions = Array.isArray(group.transactions) ? group.transactions : [];
      const members = Array.isArray(group.members) ? group.members.map(toGroupMember) : [];
      return calculateGroupBalance(transactions, members);
    },
    [group],
    'group_balance_calculation',
  );

  useEffect(() => {
    if (groupId && groups.items.length > 0) {
      const foundGroup = groups.items.find((item) => item.id === groupId) ?? null;
      if (foundGroup) {
        appLogger.debug('GroupInsightsScreen: using optimized hooks for group', foundGroup.name);
        setGroup(foundGroup);
      }
      setIsLoading(false);
    }
  }, [groups.items, groupId]);

  const memberAvatars = usePerformanceMemo<Record<string, string>>(
    () => {
      const avatarMap: Record<string, string> = {};
      group?.members.forEach((member: MemberWithAvatar) => {
        if (member.avatar) avatarMap[member.id] = member.avatar;
      });
      return avatarMap;
    },
    [group?.members],
    'member_avatars_lookup',
  );

  const debtList = usePerformanceMemo<GroupInsightsDebt[]>(
    () => {
      if (!groupBalance?.settlementSuggestions) return [];
      return groupBalance.settlementSuggestions.flatMap((suggestion): GroupInsightsDebt[] => {
        const fromMember = groupBalance.memberBalances.find(
          (member) => member.memberId === suggestion.fromMemberId,
        );
        const toMember = groupBalance.memberBalances.find(
          (member) => member.memberId === suggestion.toMemberId,
        );

        if (!fromMember || !toMember) return [];
        return [
          {
            fromMember,
            toMember,
            ...(memberAvatars[suggestion.fromMemberId]
              ? {fromAvatar: memberAvatars[suggestion.fromMemberId]}
              : {}),
            ...(memberAvatars[suggestion.toMemberId]
              ? {toAvatar: memberAvatars[suggestion.toMemberId]}
              : {}),
            amount: suggestion.amount,
          },
        ];
      });
    },
    [groupBalance, memberAvatars],
    'debt_list_calculation',
  );

  useListPerformance('group_insights_debts', debtList.length);
  useListPerformance('group_insights_members', groupBalance?.memberBalances?.length || 0);

  const summaryStatsA11yLabel = useMemo(() => {
    const total = groupBalance?.totalExpenses || 0;
    const pending = groupBalance?.settlementSuggestions?.length || 0;
    const avg = groupBalance?.averageExpensePerMember || 0;
    return `Total expenses ${formatCurrency(total)}. Pending settlements ${pending}. Average per member ${formatCurrency(avg)}.`;
  }, [formatCurrency, groupBalance]);

  const expenseDistributionA11y = useMemo(() => {
    const balances = groupBalance?.memberBalances || [];
    if (!balances.length) return 'No expense distribution data available.';
    const top = balances.reduce((max, balance) =>
      balance.percentageOfTotalExpenses > max.percentageOfTotalExpenses ? balance : max,
    );
    return `Expense distribution: ${getDisplayName(top.memberName)} accounts for about ${Math.round(top.percentageOfTotalExpenses)} percent of total expenses.`;
  }, [getDisplayName, groupBalance]);

  const spendingTrendsA11y = useMemo(() => {
    const total = groupBalance?.totalExpenses || 0;
    const count = group?.transactions?.length || 0;
    return `Spending trends: ${count} transactions with total ${formatCurrency(total)}.`;
  }, [formatCurrency, group, groupBalance]);

  const categorySpendingA11y = useMemo(() => {
    const total = groupBalance?.totalExpenses || 0;
    return `Category spending overview for total ${formatCurrency(total)}.`;
  }, [formatCurrency, groupBalance]);

  const settlementTimelineA11y = useMemo(() => {
    const count =
      group?.transactions?.filter((transaction) => transaction.isSettlement).length || 0;
    return `Settlement timeline: ${count} recorded settlements.`;
  }, [group]);

  const handleSettleDebt = useCallback(
    (debt: GroupInsightsDebt) => {
      router.push(
        appRoutes.groupAddTransaction(groupId, {
          initialType: 'payment',
          initialPaidBy: debt.fromMember.memberId,
          initialReceivedBy: debt.toMember.memberId,
          initialAmount: String(debt.amount),
        }),
      );
    },
    [groupId, router],
  );

  const handleViewMemberDetails = useCallback(
    (member: MemberBalance) => {
      const debtDetails = member.outstandingDebts
        .map(
          (debt) => `• Owes ${formatCurrency(debt.amount)} to ${getDisplayName(debt.creditorName)}`,
        )
        .join('\n');

      const creditDetails = member.creditedAmounts
        .map(
          (credit) =>
            `• ${getDisplayName(credit.debtorName)} owes ${formatCurrency(credit.amount)}`,
        )
        .join('\n');

      let message = `Total Paid: ${formatCurrency(member.totalPaid)}
Total Owed: ${formatCurrency(member.totalOwed)}
Net Balance: ${formatCurrency(member.balance)}

`;

      if (debtDetails) message += `Debts:\n${debtDetails}\n\n`;
      if (creditDetails) message += `Credits:\n${creditDetails}`;

      showAlert({
        title: getDisplayName(member.memberName),
        message,
        actions: [
          {text: 'OK', onPress: () => {}},
          {
            text: 'Settle Debts',
            onPress: () => {
              router.push(
                appRoutes.groupAddTransaction(groupId, {
                  initialType: 'payment',
                  initialPaidBy: member.memberId,
                }),
              );
            },
          },
        ],
      });
    },
    [formatCurrency, getDisplayName, groupId, router, showAlert],
  );

  const navigateBack = useCallback(() => router.back(), [router]);

  return {
    id: groupId,
    group,
    groupBalance,
    debtList,
    memberAvatars,
    viewMode,
    isLoading,
    isDarkMode,
    userFirstName,
    getUserDisplayName,
    formatCurrency,
    headerProps,
    onScroll,
    summaryStatsA11yLabel,
    expenseDistributionA11y,
    spendingTrendsA11y,
    categorySpendingA11y,
    settlementTimelineA11y,
    setViewMode,
    handleSettleDebt,
    handleViewMemberDetails,
    navigateBack,
  };
};
