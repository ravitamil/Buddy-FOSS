import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {PermissionStatus} from 'expo-notifications';
import type {SubscriptionData} from '@/types/finance.types';
import type {LoanData} from '@/types/loan.types';

import {supabase} from '../lib/supabase';
import {
  getNotificationPermissions,
  requestNotificationPermissions,
  showPermissionDeniedAlert,
} from '../utils/permissions';
import {logger as appLogger} from './LoggerService';
import {isCachedFeatureActionAllowed} from '@/features/featureControls/runtime';
import {
  scheduleAllPaymentReminders,
  sendPaymentSuccessNotification,
  setPaymentReminderSources,
  updateNotificationsForItem,
} from './notifications/paymentNotificationActions';
import {
  getAllPaymentNotificationData,
  getReminderPreferences,
  updateReminderPreferences,
} from './notifications/paymentNotificationStore';
import {
  parseNotificationPayload,
  type NotificationData,
  type NotificationType,
  type ReminderPreferences,
} from './notifications/paymentNotificationTypes';

export type {NotificationData, NotificationType, ReminderPreferences};

const logger = appLogger.serviceLogger('NotificationService');

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

export class NotificationService {
  static setPaymentSources(subscriptions: SubscriptionData[], loans: LoanData[]): void {
    setPaymentReminderSources(subscriptions, loans);
  }
  static async getPushToken(): Promise<string | null> {
    try {
      const {status} = await Notifications.getPermissionsAsync();
      if (status !== PermissionStatus.GRANTED) {
        logger.warn('Failed to get push token for push notification!');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: 'c5df49ec-f32a-41c9-87c5-e6ce9333068a',
        })
      ).data;

      logger.info('Expo Push Token:', token);
      await AsyncStorage.setItem('@BuddyApp:pushToken', token);
      await savePushTokenToProfile(token);

      return token;
    } catch (error) {
      logger.error('Error getting push token', error);
      return null;
    }
  }

  static async initialize(): Promise<void> {
    logger.info('Initializing...');

    try {
      if (!(await isCachedFeatureActionAllowed('notifications.initialize'))) {
        logger.info('Notification initialization skipped by feature controls');
        return;
      }

      const permissionStatus = await getNotificationPermissions();
      if (!permissionStatus.granted) {
        logger.info('Notification initialization deferred until the user grants permission');
        return;
      }

      logger.info('Permissions granted, scheduling notifications...');
      await this.getPushToken();
      await scheduleAllPaymentReminders();
      logger.info('Initialization complete');
    } catch (error) {
      logger.error('Error during initialization', error);
    }
  }

  static async getReminderPreferences(): Promise<ReminderPreferences> {
    return getReminderPreferences();
  }

  static async updateReminderPreferences(preferences: Partial<ReminderPreferences>): Promise<void> {
    try {
      if (!(await isCachedFeatureActionAllowed('notifications.updatePreferences'))) {
        logger.info('Notification preference update skipped by feature controls');
        return;
      }

      await updateReminderPreferences(preferences);
      await scheduleAllPaymentReminders();
    } catch (error) {
      logger.error('NotificationService: Error updating preferences:', error);
    }
  }

  static async scheduleAllPaymentReminders(): Promise<void> {
    if (!(await isCachedFeatureActionAllowed('notifications.schedulePaymentReminders'))) {
      logger.info('Payment reminder scheduling skipped by feature controls');
      return;
    }

    await scheduleAllPaymentReminders();
  }

  static async sendPaymentSuccessNotification(
    itemName: string,
    amount: number,
    type: 'subscription' | 'loan',
  ): Promise<void> {
    if (!(await isCachedFeatureActionAllowed('notifications.sendPaymentSuccess'))) {
      logger.info('Payment success notification skipped by feature controls');
      return;
    }

    await sendPaymentSuccessNotification(itemName, amount, type);
  }

  static async getAllNotificationData(): Promise<NotificationData[]> {
    return getAllPaymentNotificationData();
  }

  static async getScheduledNotificationsCount(): Promise<number> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      logger.error('NotificationService: Error getting scheduled notifications count:', error);
      return 0;
    }
  }

  static handleNotificationReceived(notification: Notifications.Notification): void {
    try {
      const data = parseNotificationPayload(notification.request.content.data ?? {});
      logger.debug('NotificationService: Notification received:', data);

      switch (data.type) {
        case 'subscription_due':
        case 'loan_emi_due':
        case 'payment_overdue':
          logger.debug(`Payment reminder notification for ${data.sourceType}: ${data.sourceId}`);
          break;
        case 'payment_success':
          logger.debug('Payment success notification');
          break;
        default:
          logger.debug('Unknown notification type:', data.type);
      }
    } catch (error) {
      logger.error('NotificationService: Error handling notification:', error);
    }
  }

  static async requestPermissionsWithPrompt(
    showAlert?: (config: {
      title: string;
      message: string;
      actions?: Array<{
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: () => void;
      }>;
    }) => void,
  ): Promise<boolean> {
    try {
      const permissionStatus = await requestNotificationPermissions();

      if (!permissionStatus.granted) {
        if (permissionStatus.canAskAgain) {
          logger.debug('NotificationService: Showing permission explanation');
          return false;
        }

        if (showAlert) {
          showPermissionDeniedAlert('Notifications', showAlert);
        }
        return false;
      }

      return true;
    } catch (error) {
      logger.error('NotificationService: Error requesting permissions:', error);
      return false;
    }
  }

  static async updateNotificationsForItem(
    itemId: string,
    type: 'subscription' | 'loan',
  ): Promise<void> {
    await updateNotificationsForItem(itemId, type);
  }
}

const savePushTokenToProfile = async (token: string): Promise<void> => {
  try {
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user) return;

    const {error} = await supabase
      .from('profiles')
      .update({expo_push_token: token})
      .eq('id', user.id);

    if (error) {
      logger.warn('Failed to save push token to Supabase profiles', error);
      return;
    }

    logger.info('Saved Expo Push Token to Supabase');
  } catch (error) {
    logger.warn('Error saving push token to Supabase', error);
  }
};

export default NotificationService;
