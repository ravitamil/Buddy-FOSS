/**
 * GroupActivityService
 *
 * Logs and retrieves group activity events for the activity feed.
 * Events: expense_added, expense_edited, expense_deleted,
 *         settlement_recorded, member_added, member_removed,
 *         member_invited, group_created, group_updated
 */

import {supabase} from '../lib/supabase';
import {logger as appLogger} from './LoggerService';
import {GroupActivityEvent} from '@/features/groups/types';

const logger = appLogger.contextLogger('GroupActivityService');

type EventType = GroupActivityEvent['eventType'];

interface GroupActivityRow {
  id: string;
  group_id: string;
  actor_user_id: string | null;
  actor_name: string | null;
  event_type: EventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ProfileAvatarRow {
  id: string;
  avatar_url: string | null;
}

export class GroupActivityService {
  /**
   * Log an activity event for a group.
   * Silently fails — activity logging should never block core operations.
   */
  static async logActivity(
    groupId: string,
    actorUserId: string | undefined,
    actorName: string,
    eventType: EventType,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      await supabase.from('group_activity').insert({
        group_id: groupId,
        actor_user_id: actorUserId || null,
        actor_name: actorName,
        event_type: eventType,
        metadata,
      });
    } catch (err) {
      // Non-fatal: log but don't throw
      logger.error('logActivity failed (non-fatal)', err);
    }
  }

  /**
   * Fetch activity events for a group, newest first.
   */
  static async getGroupActivity(groupId: string, limit = 50): Promise<GroupActivityEvent[]> {
    try {
      const {data, error} = await supabase
        .from('group_activity')
        .select('id, group_id, actor_user_id, actor_name, event_type, metadata, created_at')
        .eq('group_id', groupId)
        .order('created_at', {ascending: false})
        .limit(limit);

      if (error || !data) {
        logger.error('getGroupActivity failed', error);
        return [];
      }

      // Enrich with actor avatar URLs in a single batch query
      const rows = data as GroupActivityRow[];
      const actorIds = rows
        .map((event) => event.actor_user_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      let avatarMap: Record<string, string> = {};

      if (actorIds.length > 0) {
        const {data: profiles} = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .in('id', actorIds);
        if (profiles) {
          avatarMap = Object.fromEntries<string>(
            (profiles as ProfileAvatarRow[]).flatMap((profile) =>
              typeof profile.avatar_url === 'string' ? [[profile.id, profile.avatar_url]] : [],
            ),
          );
        }
      }

      return rows.map((row) => ({
        id: row.id,
        groupId: row.group_id,
        actorUserId: row.actor_user_id || undefined,
        actorName: row.actor_name || 'Unknown',
        actorAvatarUrl: row.actor_user_id ? avatarMap[row.actor_user_id] : undefined,
        eventType: row.event_type,
        metadata: row.metadata || {},
        createdAt: new Date(row.created_at),
      }));
    } catch (err) {
      logger.error('getGroupActivity error', err);
      return [];
    }
  }
}
