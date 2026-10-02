import type {BaseEntity} from '@/types/context-foundation';
import type {Transaction} from '@/types/transaction.types';

export interface EnhancedGroupSettings {
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  defaultSplitMethod: 'equal' | 'custom' | 'percentage' | 'shares';
}

export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type MemberRole = 'owner' | 'admin' | 'member' | 'creator';

export interface EnhancedGroupMember extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  supabaseUserId?: string;
  inviteStatus?: InviteStatus;
  inviteEmail?: string;
  avatarUrl?: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  joinedAt: Date;
  isActive: boolean;
  role: MemberRole;
  lastActivity?: Date;
  permissions: {
    canAddExpenses: boolean;
    canEditExpenses: boolean;
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canEditGroup: boolean;
  };
}

export interface EnhancedGroup extends BaseEntity {
  name: string;
  description?: string;
  emoji?: string;
  members: EnhancedGroupMember[];
  transactions: Transaction[];
  createdBy: string;
  currency?: string;
  isActive: boolean;
  settings?: EnhancedGroupSettings;
}

export interface GroupActivityEvent {
  id: string;
  groupId: string;
  actorUserId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  eventType:
    | 'expense_added'
    | 'expense_edited'
    | 'expense_deleted'
    | 'settlement_recorded'
    | 'member_added'
    | 'member_removed'
    | 'member_invited'
    | 'group_created'
    | 'group_updated';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy?: string;
  email?: string | null;
  memberId?: string | null;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
}

export interface ProfileSearchResult {
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  cinId?: string;
  avatarUrl?: string;
}
