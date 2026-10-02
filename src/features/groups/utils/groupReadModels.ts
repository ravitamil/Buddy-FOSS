import {GroupMember, MemberDebt, SettlementSuggestion} from '../../../types';
import {EnhancedGroup} from '@/features/groups/types';
import {calculateGroupBalance} from '../../../utils/groupBalanceUtils.optimized';
import {prepareTransactionsWithFx} from '../../../utils/prepareFx';

export interface GroupAnalyticsSummary {
  totalExpenses: number;
  totalPayments: number;
  memberBalances: {memberId: string; memberName: string; balance: number}[];
  expensesByCategory: Record<string, number>;
  monthlyTrends: {month: string; expenses: number; payments: number}[];
}

export const getGroupSettlementSuggestions = (
  group: EnhancedGroup,
  groupCurrency: string,
): SettlementSuggestion[] => {
  const txWithFx = prepareTransactionsWithFx(group.transactions, groupCurrency);
  const calc = calculateGroupBalance(txWithFx, group.members as unknown as GroupMember[]);
  return (calc.settlementSuggestions || []).sort((a, b) => b.priority - a.priority);
};

export const getGroupAnalyticsSummary = (
  group: EnhancedGroup,
  groupCurrency: string,
): GroupAnalyticsSummary => {
  const txWithFx = prepareTransactionsWithFx(group.transactions, groupCurrency);
  const analytics = calculateGroupBalance(txWithFx, group.members as unknown as GroupMember[]);

  const expensesByCategory: Record<string, number> = {};
  group.transactions
    .filter((transaction) => transaction.type === 'expense' && !transaction.isSettlement)
    .forEach((transaction) => {
      expensesByCategory[transaction.category] =
        (expensesByCategory[transaction.category] || 0) + Math.abs(transaction.amount);
    });

  return {
    totalExpenses: analytics.totalExpenses,
    totalPayments: analytics.totalPayments,
    memberBalances: analytics.memberBalances.map((balance) => ({
      memberId: balance.memberId,
      memberName: group.members.find((member) => member.id === balance.memberId)?.name || 'Unknown',
      balance: balance.balance,
    })),
    expensesByCategory,
    monthlyTrends: [],
  };
};

export const getGroupMemberDebts = (group: EnhancedGroup, groupCurrency: string): MemberDebt[] => {
  const txWithFx = prepareTransactionsWithFx(group.transactions, groupCurrency);
  const calc = calculateGroupBalance(txWithFx, group.members as unknown as GroupMember[]);
  return calc.memberBalances.flatMap((memberBalance) => memberBalance.outstandingDebts);
};
