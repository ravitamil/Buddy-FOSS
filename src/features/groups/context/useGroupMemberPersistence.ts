import {useCallback} from 'react';

import {GroupMemberService} from '@/services/GroupMemberService';

export const useGroupMemberPersistence = (userId?: string | null) => {
  const createMemberInvite = useCallback(
    async (groupId: string, inviteEmail: string): Promise<void> => {
      if (!userId) return;
      await GroupMemberService.createInvite(groupId, inviteEmail, userId);
    },
    [userId],
  );

  return {
    createMemberInvite,
  };
};
