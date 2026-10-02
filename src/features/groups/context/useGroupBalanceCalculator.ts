import {useCallback, useRef} from 'react';

import type {Transaction} from '@/types';
import type {EnhancedGroupMember} from '@/features/groups/types';
import {calculateGroupMemberBalances} from '../utils/groupMemberBalances';

type BalanceCache = Record<
  string,
  {
    lastUpdated: number;
    balances: EnhancedGroupMember[];
  }
>;

export const useGroupBalanceCalculator = (groupCurrency: string | undefined) => {
  const balanceCacheRef = useRef<BalanceCache>({});
  const currency = groupCurrency || 'USD';

  return useCallback(
    (
      members: EnhancedGroupMember[],
      transactions: Transaction[],
      groupId: string,
    ): EnhancedGroupMember[] => {
      const lastTransactionTime =
        transactions.length > 0
          ? Math.max(
              ...transactions.map((transaction) =>
                new Date(transaction.lastModified || 0).getTime(),
              ),
            )
          : 0;

      const cachedBalance = balanceCacheRef.current[groupId];
      if (cachedBalance && cachedBalance.lastUpdated >= lastTransactionTime) {
        return cachedBalance.balances;
      }

      const updatedMembers = calculateGroupMemberBalances(members, transactions, currency);
      balanceCacheRef.current[groupId] = {
        lastUpdated: Date.now(),
        balances: updatedMembers,
      };

      return updatedMembers;
    },
    [currency],
  );
};
