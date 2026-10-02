import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from '../LoggerService';
import {appendStoredItem, readStoredArray, replaceStoredArray} from './notificationStorage';
import {
  defaultGroupNotificationPreferences,
  type GroupNotificationData,
  type GroupNotificationPreferences,
  parseGroupNotificationData,
  parseGroupNotificationPreferences,
} from './groupNotificationTypes';

const logger = appLogger.serviceLogger('GroupNotificationStore');

const notificationDataKey = '@group_notifications_data';
const preferencesKey = '@group_notification_preferences';

export const getGroupNotificationPreferences = async (): Promise<GroupNotificationPreferences> => {
  try {
    return parseGroupNotificationPreferences(await AsyncStorage.getItem(preferencesKey));
  } catch (error) {
    logger.error('GroupNotificationStore: Error getting preferences:', error);
    return defaultGroupNotificationPreferences;
  }
};

export const updateGroupNotificationPreferences = async (
  updates: Partial<GroupNotificationPreferences>,
): Promise<void> => {
  try {
    const current = await getGroupNotificationPreferences();
    await AsyncStorage.setItem(preferencesKey, JSON.stringify({...current, ...updates}));
    logger.debug('GroupNotificationStore: Preferences updated');
  } catch (error) {
    logger.error('GroupNotificationStore: Error updating preferences:', error);
  }
};

export const saveGroupNotificationData = async (
  notificationData: GroupNotificationData,
): Promise<void> => {
  try {
    await appendStoredItem(notificationDataKey, notificationData, parseGroupNotificationData);
  } catch (error) {
    logger.error('GroupNotificationStore: Error saving notification data:', error);
  }
};

export const getAllGroupNotificationData = async (): Promise<GroupNotificationData[]> => {
  try {
    return await readStoredArray(notificationDataKey, parseGroupNotificationData);
  } catch (error) {
    logger.error('GroupNotificationStore: Error getting notification data:', error);
    return [];
  }
};

export const getGroupNotificationData = async (
  groupId: string,
): Promise<GroupNotificationData[]> => {
  try {
    const allNotifications = await getAllGroupNotificationData();
    return allNotifications
      .filter((notification) => notification.groupId === groupId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  } catch (error) {
    logger.error('GroupNotificationStore: Error getting group notifications:', error);
    return [];
  }
};

export const markGroupNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getAllGroupNotificationData();
    const updated = notifications.map((notification) =>
      notification.id === notificationId ? {...notification, isRead: true} : notification,
    );
    await replaceStoredArray(notificationDataKey, updated);
  } catch (error) {
    logger.error('GroupNotificationStore: Error marking notification as read:', error);
  }
};

export const clearStoredGroupNotifications = async (groupId: string): Promise<void> => {
  try {
    const notifications = await getAllGroupNotificationData();
    const filtered = notifications.filter((notification) => notification.groupId !== groupId);
    await replaceStoredArray(notificationDataKey, filtered);
  } catch (error) {
    logger.error('GroupNotificationStore: Error clearing group notifications:', error);
  }
};

export const getLastGroupNotificationOfType = async (
  groupId: string,
  type: GroupNotificationData['type'],
): Promise<GroupNotificationData | null> => {
  try {
    const notifications = await getGroupNotificationData(groupId);
    const filtered = notifications.filter((notification) => notification.type === type);
    return filtered.length > 0 ? filtered[0] : null;
  } catch (error) {
    logger.error('GroupNotificationStore: Error getting last notification:', error);
    return null;
  }
};
