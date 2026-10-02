import * as Notifications from 'expo-notifications';

import {Group, GroupMember, Transaction} from '../types';
import {logger as appLogger} from './LoggerService';
import {
  forceRefreshSettlementSuggestions,
  notifyDebtSettled,
  notifyExpenseAdded,
  notifyGroupInvite,
  notifySettlementSuggestions,
  schedulePaymentReminders,
  schedulePeriodicReminders,
} from './notifications/groupNotificationActions';
import {
  clearStoredGroupNotifications,
  getAllGroupNotificationData,
  getGroupNotificationData,
  getGroupNotificationPreferences,
  markGroupNotificationAsRead,
  updateGroupNotificationPreferences,
} from './notifications/groupNotificationStore';
import type {
  GroupNotificationData,
  GroupNotificationPreferences,
} from './notifications/groupNotificationTypes';

export type {GroupNotificationData, GroupNotificationPreferences};

const logger = appLogger.serviceLogger('GroupNotificationService');

/**
 * Public facade for group notification orchestration and notification history.
 */
export class GroupNotificationService {
  static initialize(): void {
    try {
      Notifications.setNotificationHandler({
        handleNotification: () =>
          Promise.resolve({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
      });

      logger.debug('GroupNotificationService: Initialized successfully');
    } catch (error) {
      logger.error('GroupNotificationService: Initialization failed:', error);
    }
  }

  static async getPreferences(): Promise<GroupNotificationPreferences> {
    return getGroupNotificationPreferences();
  }

  static async updatePreferences(updates: Partial<GroupNotificationPreferences>): Promise<void> {
    await updateGroupNotificationPreferences(updates);
  }

  static async notifyExpenseAdded(
    group: Group,
    transaction: Transaction,
    addedBy: string,
  ): Promise<void> {
    await notifyExpenseAdded(group, transaction, addedBy);
  }

  static async schedulePaymentReminders(group: Group): Promise<void> {
    await schedulePaymentReminders(group);
  }

  static async forceRefreshSettlementSuggestions(group: Group): Promise<void> {
    await forceRefreshSettlementSuggestions(group);
  }

  static async notifySettlementSuggestions(group: Group): Promise<void> {
    await notifySettlementSuggestions(group);
  }

  static async notifyGroupInvite(
    group: Group,
    invitedMemberName: string,
    invitedBy: string,
  ): Promise<void> {
    await notifyGroupInvite(group, invitedMemberName, invitedBy);
  }

  static async notifyDebtSettled(
    group: Group,
    fromMember: GroupMember,
    toMember: GroupMember,
    amount: number,
  ): Promise<void> {
    await notifyDebtSettled(group, fromMember, toMember, amount);
  }

  static async getAllNotificationData(): Promise<GroupNotificationData[]> {
    return getAllGroupNotificationData();
  }

  static async getGroupNotifications(groupId: string): Promise<GroupNotificationData[]> {
    return getGroupNotificationData(groupId);
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await markGroupNotificationAsRead(notificationId);
  }

  static async clearGroupNotifications(groupId: string): Promise<void> {
    await clearStoredGroupNotifications(groupId);
  }

  static async schedulePeriodicReminders(groups: Group[]): Promise<void> {
    await schedulePeriodicReminders(groups);
  }
}
