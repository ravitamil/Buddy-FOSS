import {useCallback} from 'react';
import {useMutation} from '@tanstack/react-query';
import type {QueryClient} from '@tanstack/react-query';

import {useFeatureActionGuard} from '@/features/featureControls/hooks';
import {groupService} from '@/features/groups/service';
import {queryKeys} from '@/lib/query-keys';
import {GroupActivityService} from '@/services/GroupActivityService';
import type {MemberDebt, SettlementSuggestion, Transaction} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {
  getGroupAnalyticsSummary,
  getGroupMemberDebts,
  getGroupSettlementSuggestions,
} from '../utils/groupReadModels';
import {createGroupSettlementActions} from '../actions/groupSettlementActions';
import type {GroupSettlementInput} from '../utils/groupSettlement';

interface GroupSettlementLogger {
  debug: (message: string, data?: unknown) => void;
}

interface UseGroupSettlementOperationsParams {
  groupsData: EnhancedGroup[];
  userId?: string | null;
  groupCurrency: string | undefined;
  queryClient: QueryClient;
  logger: GroupSettlementLogger;
  recalculateMemberBalances: (
    members: EnhancedGroupMember[],
    transactions: Transaction[],
    groupId: string,
  ) => EnhancedGroupMember[];
}

export const useGroupSettlementOperations = ({
  groupsData,
  userId,
  groupCurrency,
  queryClient,
  logger,
  recalculateMemberBalances,
}: UseGroupSettlementOperationsParams) => {
  const currency = groupCurrency || 'USD';
  const settleAccess = useFeatureActionGuard('groups.settle');
  const recalculateDebtAccess = useFeatureActionGuard('groups.recalculateDebt');

  const recordSettlementMutation = useMutation({
    mutationFn: async ({
      groupId,
      settlement: settlementData,
    }: {
      groupId: string;
      settlement: GroupSettlementInput;
    }) => {
      settleAccess.assertAllowed();
      const settlementActions = createGroupSettlementActions({
        groups: groupsData,
        userId: userId ?? undefined,
        groupCurrency: currency,
        logger,
        recalculateMemberBalances,
        updateGroup: groupService.update,
        logActivity: (settlementGroupId, actorUserId, actorName, action, metadata) => {
          void GroupActivityService.logActivity(
            settlementGroupId,
            actorUserId,
            actorName,
            action,
            metadata,
          );
        },
      });

      return settlementActions.recordGroupSettlement(groupId, settlementData);
    },
    onSuccess: ({updatedGroup}) => {
      const listKey = queryKeys.groups.list(userId ?? '');
      queryClient.setQueryData(listKey, (old: EnhancedGroup[] = []) =>
        old.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
      );
      void queryClient.invalidateQueries({queryKey: listKey});
    },
  });

  const recordSettlement = useCallback(
    async (groupId: string, settlement: GroupSettlementInput) => {
      const {settlementTx} = await recordSettlementMutation.mutateAsync({groupId, settlement});
      return settlementTx;
    },
    [recordSettlementMutation],
  );

  const recordBatchSettlements = useCallback(
    async (groupId: string, settlements: GroupSettlementInput[]) => {
      const results: Transaction[] = [];
      for (const settlement of settlements) {
        results.push(await recordSettlement(groupId, settlement));
      }
      return results;
    },
    [recordSettlement],
  );

  const calculateSettlements = useCallback(
    (groupId: string): SettlementSuggestion[] => {
      if (!recalculateDebtAccess.isAllowed) return [];
      const group = groupsData.find((candidate) => candidate.id === groupId);
      if (!group) return [];
      return getGroupSettlementSuggestions(group, currency);
    },
    [currency, groupsData, recalculateDebtAccess.isAllowed],
  );

  const getGroupAnalytics = useCallback(
    (groupId: string) => {
      const group = groupsData.find((candidate) => candidate.id === groupId);
      if (!group) return null;
      return getGroupAnalyticsSummary(group, currency);
    },
    [groupsData, currency],
  );

  const getMemberDebts = useCallback(
    (groupId: string): MemberDebt[] => {
      const group = groupsData.find((candidate) => candidate.id === groupId);
      if (!group) return [];
      return getGroupMemberDebts(group, currency);
    },
    [groupsData, currency],
  );

  return {
    recordSettlement,
    recordBatchSettlements,
    calculateSettlements,
    getGroupAnalytics,
    getMemberDebts,
  };
};
