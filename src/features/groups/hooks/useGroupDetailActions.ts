import {Dispatch, SetStateAction, useCallback} from 'react';
import {Share} from 'react-native';

import type {SettlementSuggestion} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import type {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import {GroupMemberService} from '@/services/GroupMemberService';
import {GroupNudgeService} from '@/services/GroupNudgeService';

interface UseGroupDetailActionsParams {
  group: EnhancedGroup | null;
  showAlert: ReturnType<typeof useAlert>['showAlert'];
  groups: {delete: (id: string) => Promise<unknown>};
  isDeleting: boolean;
  userId?: string;
  getUserDisplayName: () => string;
  setActionSheetOpen: Dispatch<SetStateAction<boolean>>;
  setIsDeleting: Dispatch<SetStateAction<boolean>>;
  setNudging: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export const useGroupDetailActions = ({
  group,
  showAlert,
  groups,
  isDeleting,
  userId,
  getUserDisplayName,
  setActionSheetOpen,
  setIsDeleting,
  setNudging,
}: UseGroupDetailActionsParams) => {
  const handleDeleteGroup = useCallback(() => {
    if (isDeleting || !group) return;
    setActionSheetOpen(false);
    showAlert({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? This action cannot be undone and all data will be lost.`,
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          variant: 'destructive',
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await groups.delete(group.id);
                appLogger.debug('GroupDetailScreen: group deleted successfully');
              } catch (error) {
                appLogger.error('GroupDetailScreen: error deleting group', error);
                setIsDeleting(false);
                showAlert({title: 'Error', message: 'Failed to delete group. Please try again.'});
              }
            })();
          },
        },
      ],
    });
  }, [group, groups, isDeleting, setActionSheetOpen, setIsDeleting, showAlert]);

  const handleNudgeSuggestion = useCallback(
    (suggestion: SettlementSuggestion) => {
      if (!group) return;
      const fromMember = group.members.find((member) => member.id === suggestion.fromMemberId);
      const debtorSupabaseUserId = fromMember?.supabaseUserId;
      if (!debtorSupabaseUserId) return;

      setNudging((previous) => ({...previous, [suggestion.id]: true}));
      void (async () => {
        try {
          const result = await GroupNudgeService.nudgeMember({
            groupId: group.id,
            debtorSupabaseUserId,
            amount: suggestion.amount,
            groupName: group.name,
          });

          const memberFirstName =
            suggestion.fromMemberName.split(' ')[0] || suggestion.fromMemberName;

          if (result.alreadyNudged) {
            showAlert({
              title: 'Already Nudged',
              message: `You already nudged ${memberFirstName} recently. Please wait 24 hours before sending another reminder.`,
            });
          } else if (result.sent) {
            showAlert({
              title: 'Reminder Sent',
              message: `A payment reminder has been sent to ${memberFirstName}.`,
            });
          } else {
            showAlert({
              title: 'Reminder Failed',
              message: `Could not send payment reminder to ${memberFirstName}. Please try again later.`,
            });
          }
        } finally {
          setNudging((previous) => ({...previous, [suggestion.id]: false}));
        }
      })();
    },
    [group, setNudging, showAlert],
  );

  const handleInviteSuggestion = useCallback(
    (suggestion: SettlementSuggestion) => {
      if (!group || !userId) return;
      const fromMember = group.members.find((member) => member.id === suggestion.fromMemberId);

      void (async () => {
        try {
          const invite = await GroupMemberService.createInvite(
            group.id,
            fromMember?.email || null,
            userId,
            fromMember?.id || null,
          );
          const message = GroupNudgeService.getShareInviteMessage({
            groupId: group.id,
            inviteToken: invite?.token || '',
            groupName: group.name,
            creditorName: getUserDisplayName(),
            amount: suggestion.amount,
          });
          await Share.share({message});
        } catch (error) {
          appLogger.error('GroupDetailScreen: share invite failed', error);
        }
      })();
    },
    [getUserDisplayName, group, userId],
  );

  return {
    handleDeleteGroup,
    handleNudgeSuggestion,
    handleInviteSuggestion,
  };
};
