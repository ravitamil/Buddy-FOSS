import {useMemo} from 'react';

import {logger as appLogger} from '../services/LoggerService';
import type {Group, GroupMember, Transaction} from '../types';
import {
  calculateGroupBalance,
  type GroupBalanceCalculation,
} from '../utils/groupBalanceUtils.optimized';
import {
  calculateGroupPerformanceMetrics,
  calculateGroupStats,
  calculateMemberActivity,
  createBalanceDependencyHash,
  createGroupStatsDependencyHash,
  createMemberActivityDependencyHash,
  createTransactionFilterDependencyHash,
  filterTransactions,
  summarizeSettlementSuggestions,
} from './groupPerformanceUtils';
import type {TransactionFilters} from './groupPerformanceTypes';

export const useGroupBalance = (
  transactions: Transaction[],
  members: GroupMember[],
): GroupBalanceCalculation => {
  const [transactionHash, memberHash] = createBalanceDependencyHash(transactions, members);

  return useMemo(() => {
    appLogger.debug(
      'useGroupBalance: Calculating balance for',
      transactions.length,
      'transactions and',
      members.length,
      'members',
    );
    const startTime = performance.now();
    const result = calculateGroupBalance(transactions, members);
    const endTime = performance.now();

    appLogger.debug(
      `useGroupBalance: Calculation completed in ${(endTime - startTime).toFixed(2)}ms`,
    );

    return result;
  }, [memberHash, transactionHash]);
};

export const useMemberBalance = (
  memberId: string,
  transactions: Transaction[],
  members: GroupMember[],
) => {
  const groupBalance = useGroupBalance(transactions, members);

  return useMemo(() => {
    appLogger.debug('useMemberBalance: Finding balance for member', memberId);
    return groupBalance.memberBalances.find((balance) => balance.memberId === memberId) || null;
  }, [groupBalance, memberId]);
};

export const useSettlementSuggestions = (transactions: Transaction[], members: GroupMember[]) => {
  const groupBalance = useGroupBalance(transactions, members);

  return useMemo(() => {
    appLogger.debug(
      'useSettlementSuggestions: Processing',
      groupBalance.settlementSuggestions.length,
      'suggestions',
    );

    return summarizeSettlementSuggestions(groupBalance.settlementSuggestions);
  }, [groupBalance.settlementSuggestions]);
};

export const useGroupStats = (group: Group | null) => {
  const transactionHash = createGroupStatsDependencyHash(group);

  return useMemo(() => {
    if (!group) {
      appLogger.debug('useGroupStats: Group is null, returning default stats');
      return calculateGroupStats(group);
    }

    appLogger.debug('useGroupStats: Calculating stats for group', group.name);
    const startTime = performance.now();
    const stats = calculateGroupStats(group);
    const endTime = performance.now();

    appLogger.debug(`useGroupStats: Stats calculated in ${(endTime - startTime).toFixed(2)}ms`);

    return stats;
  }, [group?.id, group?.members?.length, group?.transactions?.length, transactionHash]);
};

export const useTransactionFilters = (
  transactions: Transaction[],
  filters: TransactionFilters = {},
) => {
  const [filterHash, transactionHash] = createTransactionFilterDependencyHash(
    transactions,
    filters,
  );

  return useMemo(() => {
    const startTime = performance.now();
    const result = filterTransactions(transactions, filters);
    const endTime = performance.now();

    appLogger.debug(
      `useTransactionFilters: Filtered to ${result.count} transactions in ${(endTime - startTime).toFixed(2)}ms`,
    );

    return result;
  }, [transactions.length, filterHash, transactionHash]);
};

export const useMemberActivity = (
  memberId: string,
  transactions: Transaction[],
  members: GroupMember[],
) => {
  const transactionHash = createMemberActivityDependencyHash(transactions);

  return useMemo(() => {
    appLogger.debug('useMemberActivity: Analyzing activity for member', memberId);
    return calculateMemberActivity(memberId, transactions, members);
  }, [memberId, transactions.length, members.length, transactionHash]);
};

export const clearGroupCalculationCache = () => {
  appLogger.debug('Performance: Clearing group calculation cache');
};

export const useGroupPerformanceMetrics = (group: Group) => {
  return useMemo(
    () => calculateGroupPerformanceMetrics(group),
    [group.transactions?.length, group.members?.length],
  );
};

export type {TransactionFilters};
