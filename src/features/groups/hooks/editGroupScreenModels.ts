import * as Crypto from 'expo-crypto';

import type {EnhancedGroup, EnhancedGroupMember} from '../types';
import type {GroupMemberDraft} from './useGroupMemberEditor';

export type EditGroupMemberEntry = GroupMemberDraft;

export const toEditableMember = (
  member: EnhancedGroupMember,
  isCurrentUser: (memberName: string) => boolean,
): EditGroupMemberEntry => ({
  id: member.id || Crypto.randomUUID(),
  name: member.name || '',
  role:
    member.role === 'creator' || member.role === 'owner' || isCurrentUser(member.name)
      ? 'owner'
      : 'member',
  supabaseUserId: member.supabaseUserId,
  inviteEmail: member.inviteEmail,
  phone: member.phone,
  inviteStatus:
    member.inviteStatus === 'accepted' || member.inviteStatus === 'pending'
      ? member.inviteStatus
      : member.supabaseUserId
        ? 'accepted'
        : 'pending',
  avatarUrl: member.avatarUrl || member.avatar,
});

export const toEnhancedGroupMember = (member: EditGroupMemberEntry): EnhancedGroupMember => {
  const email = member.inviteEmail || (member.supabaseUserId ? member.inviteEmail : undefined);
  const now = new Date();
  return {
    id: member.id,
    name: member.name || member.inviteEmail || 'Guest',
    email: email || '',
    phone: member.phone || '',
    avatar: member.avatarUrl || '',
    balance: 0,
    totalPaid: 0,
    totalOwed: 0,
    joinedAt: now,
    isActive: true,
    role: member.role,
    supabaseUserId: member.supabaseUserId,
    inviteEmail: email,
    inviteStatus: member.inviteStatus || 'pending',
    avatarUrl: member.avatarUrl,
    createdAt: now,
    updatedAt: now,
    permissions: {
      canAddExpenses: true,
      canEditExpenses: false,
      canInviteMembers: member.role === 'owner',
      canRemoveMembers: member.role === 'owner',
      canEditGroup: member.role === 'owner',
    },
  };
};

export interface EditGroupValidationError {
  title: 'Validation Error' | 'Duplicate Name';
  message: string;
}

export const getEditGroupValidationError = (
  groupName: string,
  members: EditGroupMemberEntry[],
  group: EnhancedGroup,
  groups: EnhancedGroup[],
): EditGroupValidationError | null => {
  const trimmedName = groupName.trim();
  if (!trimmedName) {
    return {title: 'Validation Error', message: 'Please enter a group name'};
  }
  if (groups.some((item) => item.name === trimmedName && item.id !== group.id)) {
    return {
      title: 'Duplicate Name',
      message: 'A group with this name already exists. Please choose a different name.',
    };
  }
  if (!members.some((member) => member.name.trim().length > 0 || Boolean(member.inviteEmail))) {
    return {title: 'Validation Error', message: 'Please add at least one member'};
  }
  return null;
};

export const getValidEditGroupMembers = (members: EditGroupMemberEntry[]): EditGroupMemberEntry[] =>
  members.filter((member) => member.name.trim().length > 0 || Boolean(member.inviteEmail));
