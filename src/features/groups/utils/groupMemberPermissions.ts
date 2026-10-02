import {generateEntityId} from '../../../types/context-foundation';
import {EnhancedGroupMember, MemberRole} from '@/features/groups/types';

type MemberPermissions = EnhancedGroupMember['permissions'];

export type NewGroupMemberInput = Omit<
  EnhancedGroupMember,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
>;

export const getDefaultMemberPermissions = (role: MemberRole): MemberPermissions => ({
  canAddExpenses: true,
  canEditExpenses: role === 'owner' || role === 'admin',
  canInviteMembers: role === 'owner' || role === 'admin',
  canRemoveMembers: role === 'owner',
  canEditGroup: role === 'owner',
});

export const buildGroupMember = (member: NewGroupMemberInput): EnhancedGroupMember => ({
  ...member,
  id: generateEntityId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  balance: 0,
  totalPaid: 0,
  totalOwed: 0,
  isActive: true,
  permissions: member.permissions ?? getDefaultMemberPermissions(member.role),
});

export const canGroupMemberPerformAction = (
  member: EnhancedGroupMember | undefined,
  action: string,
): boolean => {
  if (!member) return false;
  if (member.role === 'admin' || member.role === 'creator') return true;

  switch (action) {
    case 'addExpense':
      return member.permissions.canAddExpenses;
    case 'editExpense':
      return member.permissions.canEditExpenses;
    case 'inviteMember':
      return member.permissions.canInviteMembers;
    case 'removeMember':
      return member.permissions.canRemoveMembers;
    case 'editGroup':
      return member.permissions.canEditGroup;
    default:
      return false;
  }
};
