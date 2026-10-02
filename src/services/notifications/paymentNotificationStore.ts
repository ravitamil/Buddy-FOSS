import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from '../LoggerService';
import {appendStoredItem, readStoredArray, replaceStoredArray} from './notificationStorage';
import {
  defaultReminderPreferences,
  parseReminderPreferences,
  parseStoredNotificationData,
  type NotificationData,
  type ReminderPreferences,
} from './paymentNotificationTypes';

const logger = appLogger.serviceLogger('PaymentNotificationStore');

const notificationDataKey = '@BuddyApp:notificationData';
const reminderPreferencesKey = '@BuddyApp:reminderPreferences';

export const getReminderPreferences = async (): Promise<ReminderPreferences> => {
  try {
    return parseReminderPreferences(await AsyncStorage.getItem(reminderPreferencesKey));
  } catch (error) {
    logger.error('PaymentNotificationStore: Error getting preferences:', error);
    return defaultReminderPreferences;
  }
};

export const updateReminderPreferences = async (
  preferences: Partial<ReminderPreferences>,
): Promise<ReminderPreferences> => {
  const current = await getReminderPreferences();
  const updated = {...current, ...preferences};
  await AsyncStorage.setItem(reminderPreferencesKey, JSON.stringify(updated));
  logger.debug('PaymentNotificationStore: Preferences updated', updated);
  return updated;
};

export const clearPaymentNotificationData = async (): Promise<void> => {
  await AsyncStorage.removeItem(notificationDataKey);
};

export const savePaymentNotificationData = async (
  notificationData: NotificationData,
): Promise<void> => {
  try {
    await appendStoredItem(notificationDataKey, notificationData, parseStoredNotificationData);
  } catch (error) {
    logger.error('PaymentNotificationStore: Error saving notification data:', error);
  }
};

export const getAllPaymentNotificationData = async (): Promise<NotificationData[]> => {
  try {
    return await readStoredArray(notificationDataKey, parseStoredNotificationData);
  } catch (error) {
    logger.error('PaymentNotificationStore: Error getting notification data:', error);
    return [];
  }
};

export const removePaymentNotificationsForItem = async (
  itemId: string,
  type: NotificationData['sourceType'],
): Promise<NotificationData[]> => {
  const notificationData = await getAllPaymentNotificationData();
  const updatedData = notificationData.filter(
    (notification) => !(notification.sourceId === itemId && notification.sourceType === type),
  );
  await replaceStoredArray(notificationDataKey, updatedData);
  return notificationData.filter(
    (notification) => notification.sourceId === itemId && notification.sourceType === type,
  );
};
