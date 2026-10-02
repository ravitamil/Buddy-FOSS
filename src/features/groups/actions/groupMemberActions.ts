import {CRUDOperations} from '../../../types/context-foundation';
import {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {buildGroupMember, NewGroupMemberInput} from '../utils/groupMemberPermissions';

interface GroupActor {
  uid?: string | null;
  displayName?: string | null;
}

interface GroupMemberActionDeps {
  groups: EnhancedGroup[];
  groupsCRUD: Pick<CRUDOperations<EnhancedGroup>, 'update'>;
  actor: GroupActor;
  createInvite: (groupId: string, inviteEmail: string) => Promise<void>;
  logActivity: (
    groupId: string,
    actorUserId: string | undefined,
    actorName: string,
    action: 'member_added' | 'member_removed',
    metadata: Record<string, unknown>,
  ) => void;
}

const findGroupOrThrow = (groups: EnhancedGroup[], groupId: string): EnhancedGroup => {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (!group) throw new Error('Group not found');
  return group;
};

export const createGroupMemberActions = ({
  groups,
  groupsCRUD,
  actor,
  createInvite,
  logActivity,
}: GroupMemberActionDeps) => ({
  addGroupMember: async (
    groupId: string,
    member: NewGroupMemberInput,
  ): Promise<EnhancedGroupMember> => {
    const group = findGroupOrThrow(groups, groupId);
    const newMember = buildGroupMember(member);
    await groupsCRUD.update(groupId, {members: [...group.members, newMember]});

    if (!newMember.supabaseUserId && newMember.inviteEmail && actor.uid) {
      await createInvite(groupId, newMember.inviteEmail);
    }

    logActivity(groupId, actor.uid ?? undefined, actor.displayName || 'Unknown', 'member_added', {
      memberName: newMember.name,
      memberId: newMember.id,
    });

    return newMember;
  },

  removeGroupMember: async (groupId: string, memberId: string): Promise<void> => {
    const group = findGroupOrThrow(groups, groupId);
    const removedMember = group.members.find((member) => member.id === memberId);
    const updatedMembers = group.members.map((member) =>
      member.id === memberId ? {...member, isActive: false, updatedAt: new Date()} : member,
    );

    await groupsCRUD.update(groupId, {members: updatedMembers});

    logActivity(groupId, actor.uid ?? undefined, actor.displayName || 'Unknown', 'member_removed', {
      memberName: removedMember?.name,
      memberId,
    });
  },

  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: EnhancedGroupMember['role'],
  ): Promise<void> => {
    const group = findGroupOrThrow(groups, groupId);
    const updatedMembers = group.members.map((member) =>
      member.id === memberId ? {...member, role, updatedAt: new Date()} : member,
    );
    await groupsCRUD.update(groupId, {members: updatedMembers});
  },

  updateMemberPermissions: async (
    groupId: string,
    memberId: string,
    permissions: Partial<EnhancedGroupMember['permissions']>,
  ): Promise<void> => {
    const group = findGroupOrThrow(groups, groupId);
    const updatedMembers = group.members.map((member) =>
      member.id === memberId
        ? {
            ...member,
            permissions: {...member.permissions, ...permissions},
            updatedAt: new Date(),
          }
        : member,
    );
    await groupsCRUD.update(groupId, {members: updatedMembers});
  },
});
