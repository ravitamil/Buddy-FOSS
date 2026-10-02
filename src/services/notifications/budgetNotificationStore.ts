import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from '../LoggerService';
import {
  appendStoredItem,
  parseJson,
  readStoredArray,
  replaceStoredArray,
} from './notificationStorage';
import {
  defaultBudgetAlertSettings,
  parseBudgetAlertSettings,
  parseBudgetNotificationData,
  type BudgetAlertSettings,
  type BudgetNotificationData,
} from './budgetNotificationTypes';

const logger = appLogger.serviceLogger('BudgetNotificationStore');

const budgetNotificationsKey = '@BuddyApp:budgetNotifications';
const budgetAlertSettingsKey = '@BuddyApp:budgetAlertSettings';

export const getBudgetAlertSettings = async (): Promise<BudgetAlertSettings> => {
  try {
    const data = await AsyncStorage.getItem(budgetAlertSettingsKey);
    if (data) {
      return {...defaultBudgetAlertSettings, ...parseBudgetAlertSettings(parseJson(data))};
    }
    return defaultBudgetAlertSettings;
  } catch (error) {
    logger.error('Error getting alert settings', error);
    return defaultBudgetAlertSettings;
  }
};

export const updateBudgetAlertSettings = async (
  settings: Partial<BudgetAlertSettings>,
): Promise<BudgetAlertSettings> => {
  const current = await getBudgetAlertSettings();
  const updated = {...current, ...settings};
  await AsyncStorage.setItem(budgetAlertSettingsKey, JSON.stringify(updated));
  return updated;
};

export const saveBudgetNotificationData = async (data: BudgetNotificationData): Promise<void> => {
  try {
    await appendStoredItem(budgetNotificationsKey, data, parseBudgetNotificationData);
  } catch (error) {
    logger.error('Error saving notification data', error);
  }
};

export const getAllBudgetNotificationData = async (): Promise<BudgetNotificationData[]> => {
  try {
    return await readStoredArray(budgetNotificationsKey, parseBudgetNotificationData);
  } catch (error) {
    logger.error('Error getting notification data', error);
    return [];
  }
};

export const getUnreadBudgetNotificationCount = async (): Promise<number> => {
  try {
    const notifications = await getAllBudgetNotificationData();
    return notifications.filter((notification) => !notification.isRead).length;
  } catch (error) {
    logger.error('Error getting unread count', error);
    return 0;
  }
};

export const markBudgetNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getAllBudgetNotificationData();
    const updated = notifications.map((notification) =>
      notification.id === notificationId ? {...notification, isRead: true} : notification,
    );
    await replaceStoredArray(budgetNotificationsKey, updated);
  } catch (error) {
    logger.error('Error marking notification as read', error);
  }
};

export const clearBudgetNotificationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(budgetNotificationsKey);
    logger.info('Notification history cleared');
  } catch (error) {
    logger.error('Error clearing notification history', error);
  }
};
