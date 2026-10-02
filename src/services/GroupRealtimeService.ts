/**
 * Group Realtime Service
 *
 * Manages Supabase realtime subscriptions for group and group transaction data.
 */

import type {RealtimeChannel, RealtimePostgresChangesPayload} from '@supabase/supabase-js';

import {supabase} from '../lib/supabase';
import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('GroupRealtimeService');

type DatabaseRecord = Record<string, unknown>;
type GroupRealtimePayload = RealtimePostgresChangesPayload<DatabaseRecord>;

export interface GroupRealtimeSubscription {
  key: string;
  channelName: string;
  unsubscribe: () => void;
}

export interface UserGroupRealtimeHandlers {
  onGroupChanged?: (payload: GroupRealtimePayload) => void;
  onMemberChanged?: (payload: GroupRealtimePayload) => void;
  onGroupTransactionChanged?: (payload: GroupRealtimePayload) => void;
}

const subscriptions = new Map<string, RealtimeChannel>();

const createSubscription = (
  key: string,
  channelName: string,
  channel: RealtimeChannel,
): GroupRealtimeSubscription => {
  subscriptions.set(key, channel);

  return {
    key,
    channelName,
    unsubscribe: () => {
      const activeChannel = subscriptions.get(key);
      if (!activeChannel) return;

      void supabase.removeChannel(activeChannel);
      subscriptions.delete(key);
      logger.info('Realtime subscription removed', {key, channelName});
    },
  };
};

const removeExistingSubscription = (key: string): void => {
  const existingChannel = subscriptions.get(key);
  if (!existingChannel) return;

  void supabase.removeChannel(existingChannel);
  subscriptions.delete(key);
};

/**
 * Subscribe to a single group's transactions.
 */
export const subscribeToGroupExpenses = (
  groupId: string,
  onChange: (payload: GroupRealtimePayload) => void,
): GroupRealtimeSubscription => {
  const key = `group-transactions:${groupId}`;
  const channelName = `group-transactions-${groupId}`;

  removeExistingSubscription(key);

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => {
        logger.debug('Group transaction change detected', {
          groupId,
          event: payload.eventType,
        });
        onChange(payload);
      },
    )
    .subscribe((status) => {
      logger.info('Group transaction realtime status changed', {
        groupId,
        status,
      });
    });

  logger.info('Group transaction realtime subscription created', {
    groupId,
    channelName,
  });

  return createSubscription(key, channelName, channel);
};

/**
 * Subscribe to all group-related changes visible to the current user.
 */
export const subscribeToUserGroupChanges = (
  userId: string,
  handlers: UserGroupRealtimeHandlers,
): GroupRealtimeSubscription => {
  const key = `user-groups:${userId}`;
  const channelName = `group-sync-${userId}`;

  removeExistingSubscription(key);

  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', {event: '*', schema: 'public', table: 'groups'}, (payload) => {
      logger.debug('Group change detected', {event: payload.eventType});
      handlers.onGroupChanged?.(payload);
    })
    .on('postgres_changes', {event: '*', schema: 'public', table: 'group_members'}, (payload) => {
      logger.debug('Group member change detected', {event: payload.eventType});
      handlers.onMemberChanged?.(payload);
    })
    .on('postgres_changes', {event: '*', schema: 'public', table: 'transactions'}, (payload) => {
      const row = payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old;

      if (!row || !('group_id' in row) || !row.group_id) return;

      logger.debug('User-visible group transaction change detected', {
        event: payload.eventType,
        groupId: row.group_id,
      });
      handlers.onGroupTransactionChanged?.(payload);
    })
    .subscribe((status) => {
      logger.info('User group realtime status changed', {userId, status});
    });

  logger.info('User group realtime subscription created', {
    userId,
    channelName,
  });

  return createSubscription(key, channelName, channel);
};

export const unsubscribeFromGroupExpenses = (groupId: string): void => {
  const key = `group-transactions:${groupId}`;
  const channel = subscriptions.get(key);
  if (!channel) return;

  void supabase.removeChannel(channel);
  subscriptions.delete(key);
  logger.info('Group transaction realtime subscription removed', {groupId});
};

export const cleanupAllGroupSubscriptions = (): void => {
  subscriptions.forEach((channel) => {
    void supabase.removeChannel(channel);
  });
  subscriptions.clear();
  logger.info('All group realtime subscriptions removed');
};

export const getActiveSubscriptionCount = (): number => subscriptions.size;
