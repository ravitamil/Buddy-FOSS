/**
 * GroupMemberService
 *
 * Handles real user member management:
 * - Search users by email or phone
 * - Create/accept invites
 */

import {supabase} from '../lib/supabase';
import {logger as appLogger} from './LoggerService';
import {ProfileSearchResult, GroupInvite} from '@/features/groups/types';

const logger = appLogger.contextLogger('GroupMemberService');

type InviteStatus = GroupInvite['status'];

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  cin_id: string | null;
}

interface GroupInviteRow {
  id: string;
  group_id: string;
  invited_by: string | null;
  email: string | null;
  member_id?: string | null;
  token: string;
  expires_at: string;
  status: InviteStatus;
  created_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isInviteStatus(value: unknown): value is InviteStatus {
  return value === 'pending' || value === 'accepted' || value === 'declined' || value === 'expired';
}

function isProfileRow(value: unknown): value is ProfileRow {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isNullableString(value.full_name) &&
    isNullableString(value.email) &&
    isNullableString(value.avatar_url) &&
    isNullableString(value.phone_number) &&
    isNullableString(value.cin_id)
  );
}

function isGroupInviteRow(value: unknown): value is GroupInviteRow {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.group_id) &&
    isNullableString(value.invited_by) &&
    isNullableString(value.email) &&
    (value.member_id === undefined || isNullableString(value.member_id)) &&
    isString(value.token) &&
    isString(value.expires_at) &&
    isInviteStatus(value.status) &&
    isString(value.created_at)
  );
}

function toProfileSearchResult(row: ProfileRow, fallbackDisplayName: string): ProfileSearchResult {
  return {
    userId: row.id,
    displayName: row.full_name || row.email || row.cin_id || fallbackDisplayName,
    email: row.email || undefined,
    phone: row.phone_number || undefined,
    cinId: row.cin_id || undefined,
    avatarUrl: row.avatar_url || undefined,
  };
}

function toGroupInvite(row: GroupInviteRow): GroupInvite {
  return {
    id: row.id,
    groupId: row.group_id,
    invitedBy: row.invited_by || undefined,
    email: row.email || undefined,
    memberId: row.member_id || undefined,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

export class GroupMemberService {
  /**
   * Search for a Supabase-registered user by email
   */
  static async searchUserByEmail(email: string): Promise<ProfileSearchResult | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone_number, cin_id')
        .eq('email', email.toLowerCase().trim())
        .single()
        .returns<unknown>();

      if (error || !isProfileRow(data)) return null;

      return toProfileSearchResult(data, email);
    } catch (err) {
      logger.error('searchUserByEmail failed', err);
      return null;
    }
  }

  /**
   * Search for a Supabase-registered user by phone number
   */
  static async searchUserByPhone(phone: string): Promise<ProfileSearchResult | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone_number, cin_id')
        .eq('phone_number', phone.trim())
        .single()
        .returns<unknown>();

      if (error || !isProfileRow(data)) return null;

      return toProfileSearchResult(data, phone);
    } catch (err) {
      logger.error('searchUserByPhone failed', err);
      return null;
    }
  }

  /**
   * Get profile for a known Supabase user ID
   */
  static async getProfileById(userId: string): Promise<ProfileSearchResult | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone_number, cin_id')
        .eq('id', userId)
        .single()
        .returns<unknown>();

      if (error || !isProfileRow(data)) return null;

      return toProfileSearchResult(data, 'Unknown');
    } catch (err) {
      logger.error('getProfileById failed', err);
      return null;
    }
  }

  /**
   * Search for a Supabase-registered user by CIN ID
   */
  static async searchUserByCinId(cinId: string): Promise<ProfileSearchResult | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone_number, cin_id')
        .eq('cin_id', cinId.toUpperCase().trim())
        .single()
        .returns<unknown>();

      if (error || !isProfileRow(data)) return null;

      return toProfileSearchResult(data, cinId);
    } catch (err) {
      logger.error('searchUserByCinId failed', err);
      return null;
    }
  }

  /**
   * Unified search prioritizing email, then CIN ID, then phone
   */
  static async searchUser(query: string): Promise<ProfileSearchResult | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    if (trimmed.includes('@')) {
      return this.searchUserByEmail(trimmed);
    }

    // CIN IDs are expected to be 6 alphanumeric characters without special symbols
    const isCinId = /^[A-Z0-9]{6}$/i.test(trimmed);
    if (isCinId) {
      const result = await this.searchUserByCinId(trimmed);
      if (result) return result;
    }

    // Fallback or exact match check for phone number
    return this.searchUserByPhone(trimmed);
  }

  /**
   * Create an invite record for a non-member (via share link or email).
   * Returns the invite token so it can be shared via deep link.
   */
  static async createInvite(
    groupId: string,
    email: string | null | undefined,
    invitedByUserId: string,
    memberId?: string | null,
  ): Promise<GroupInvite | null> {
    try {
      const normalizedEmail = email?.trim() ? email.toLowerCase().trim() : null;
      const {data, error} = await supabase
        .from('group_invites')
        .insert({
          group_id: groupId,
          invited_by: invitedByUserId,
          email: normalizedEmail,
          member_id: memberId || null,
        })
        .select()
        .single()
        .returns<unknown>();

      if (error || !isGroupInviteRow(data)) {
        logger.error('createInvite failed', error);
        return null;
      }

      return toGroupInvite(data);
    } catch (err) {
      logger.error('createInvite error', err);
      return null;
    }
  }

  /**
   * Accept a group invite by token. Adds the current auth user as a real member.
   */
  static async acceptInvite(token: string): Promise<{groupId: string} | null> {
    try {
      const {data, error} = (await supabase.rpc('accept_group_invite', {p_token: token})) as {
        data: unknown;
        error: unknown;
      };
      if (error || typeof data !== 'string') {
        logger.error('acceptInvite: atomic invite acceptance failed', error);
        return null;
      }

      logger.info('acceptInvite: success for group', data);
      return {groupId: data};
    } catch (err) {
      logger.error('acceptInvite error', err);
      return null;
    }
  }
}
