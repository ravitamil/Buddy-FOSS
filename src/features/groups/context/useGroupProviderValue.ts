import {useCallback, useMemo} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@/lib/query-keys';
import {GroupActivityService} from '@/services/GroupActivityService';
import {logger as appLogger} from '@/services/LoggerService';
import {useFeatureActionGuard} from '@/features/featureControls/hooks';
import {useAuth} from '@/context/AuthContext';
import {useSettings} from '@/context/SettingsContext';
import type {EnhancedGroupMember} from '@/features/groups/types';
import {normalizeGroupSplitDetails} from '../utils/groupSplitDetails';
import {canGroupMemberPerformAction} from '../utils/groupMemberPermissions';
import {createGroupMemberActions} from '../actions/groupMemberActions';
import {createGroupExpenseActions} from '../actions/groupExpenseActions';
import type {GroupContextType} from './groupContextTypes';
import {useGroupBalanceCalculator} from './useGroupBalanceCalculator';
import {useGroupMemberPersistence} from './useGroupMemberPersistence';
import {useGroupRealtimeSubscription} from './useGroupRealtimeSubscription';
import {useGroupSettlementOperations} from './useGroupSettlementOperations';
import {useGroupsCrud} from './useGroupsCrud';

const logger = appLogger.contextLogger('GroupContext');

export const useGroupProviderValue = (): GroupContextType => {
  const {user} = useAuth();
  const {currency, groupCurrency} = useSettings();
  const effectiveGroupCurrency = groupCurrency || currency || 'USD';
  const queryClient = useQueryClient();
  const addMemberAccess = useFeatureActionGuard('groups.addMember');
  const removeMemberAccess = useFeatureActionGuard('groups.removeMember');
  const updateGroupAccess = useFeatureActionGuard('groups.update');
  const addExpenseAccess = useFeatureActionGuard('groups.addExpense');
  const updateExpenseAccess = useFeatureActionGuard('groups.updateExpense');
  const deleteExpenseAccess = useFeatureActionGuard('groups.deleteExpense');

  const {groupsData, groupsCRUD} = useGroupsCrud({
    user,
    groupCurrency: effectiveGroupCurrency,
    queryClient,
    logger,
  });

  useGroupRealtimeSubscription({
    userId: user?.uid,
    queryClient,
    logger,
  });

  const recalculateMemberBalances = useGroupBalanceCalculator(effectiveGroupCurrency);
  const normalizeSplitDetails = useCallback(normalizeGroupSplitDetails, []);
  const {createMemberInvite} = useGroupMemberPersistence(user?.uid);

  const settlementOperations = useGroupSettlementOperations({
    groupsData,
    userId: user?.uid,
    groupCurrency: effectiveGroupCurrency,
    queryClient,
    logger,
    recalculateMemberBalances,
  });

  const isGroupNameUnique = useCallback(
    (name: string, excludeId?: string) => {
      return !groupsData.some(
        (group) =>
          group.id !== excludeId && group.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
    },
    [groupsData],
  );

  const validateMemberPermissions = useCallback(
    (groupId: string, memberId: string, action: string) => {
      const group = groupsData.find((candidate) => candidate.id === groupId);
      if (!group) return false;
      return canGroupMemberPerformAction(
        group.members.find((member) => member.id === memberId),
        action,
      );
    },
    [groupsData],
  );

  return useMemo<GroupContextType>(() => {
    const actor = {uid: user?.uid, displayName: user?.displayName};
    const logActivity = (
      groupId: string,
      actorUserId: string | undefined,
      actorName: string,
      action: Parameters<typeof GroupActivityService.logActivity>[3],
      metadata: Record<string, unknown>,
    ): void => {
      void GroupActivityService.logActivity(groupId, actorUserId, actorName, action, metadata);
    };

    const memberActions = createGroupMemberActions({
      groups: groupsData,
      groupsCRUD,
      actor,
      createInvite: createMemberInvite,
      logActivity,
    });
    const expenseActions = createGroupExpenseActions({
      groups: groupsData,
      groupsCRUD,
      actor,
      normalizeSplitDetails,
      recalculateMemberBalances,
      logActivity,
    });

    return {
      groups: groupsCRUD,
      addGroupMember: async (...args) => {
        addMemberAccess.assertAllowed();
        return memberActions.addGroupMember(...args);
      },
      removeGroupMember: async (...args) => {
        removeMemberAccess.assertAllowed();
        return memberActions.removeGroupMember(...args);
      },
      updateMemberRole: async (...args) => {
        updateGroupAccess.assertAllowed();
        return memberActions.updateMemberRole(...args);
      },
      updateMemberPermissions: async (...args) => {
        updateGroupAccess.assertAllowed();
        return memberActions.updateMemberPermissions(...args);
      },
      addGroupExpense: async (...args) => {
        addExpenseAccess.assertAllowed();
        return expenseActions.addGroupExpense(...args);
      },
      editGroupExpense: async (...args) => {
        updateExpenseAccess.assertAllowed();
        return expenseActions.editGroupExpense(...args);
      },
      deleteGroupExpense: async (...args) => {
        deleteExpenseAccess.assertAllowed();
        return expenseActions.deleteGroupExpense(...args);
      },
      ...settlementOperations,
      isGroupNameUnique,
      validateMemberPermissions,
      syncWithRemote: async () => {
        await queryClient.invalidateQueries({queryKey: queryKeys.groups.list(user?.uid ?? '')});
      },
      isLoading: groupsCRUD.isLoading,
      error: groupsCRUD.error,
    };
  }, [
    groupsCRUD,
    groupsData,
    createMemberInvite,
    settlementOperations,
    isGroupNameUnique,
    validateMemberPermissions,
    user?.uid,
    user?.displayName,
    queryClient,
    recalculateMemberBalances,
    normalizeSplitDetails,
    addMemberAccess,
    removeMemberAccess,
    updateGroupAccess,
    addExpenseAccess,
    updateExpenseAccess,
    deleteExpenseAccess,
  ]);
};
