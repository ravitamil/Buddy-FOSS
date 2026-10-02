import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';

import {SubscriptionData} from '../../types/finance.types';
import {LoanData} from '../../types/loan.types';
import {logger as appLogger} from '../LoggerService';
import {formatCompactCurrency} from './notificationCurrency';
import {
  applyClockTime,
  scheduleDateNotification,
  scheduleImmediateNotification,
} from './notificationScheduler';
import {
  clearPaymentNotificationData,
  getReminderPreferences,
  removePaymentNotificationsForItem,
  savePaymentNotificationData,
} from './paymentNotificationStore';
import type {ReminderPreferences} from './paymentNotificationTypes';

const logger = appLogger.serviceLogger('PaymentNotificationActions');
const OVERDUE_THROTTLE_MS = 24 * 60 * 60 * 1000;

export const canSendOverdueNotification = async (
  itemId: string,
  type: 'subscription' | 'loan',
): Promise<boolean> => {
  try {
    const key = `@BuddyApp:lastOverdue:${type}:${itemId}`;
    const lastSentStr = await AsyncStorage.getItem(key);
    if (lastSentStr) {
      const lastSent = Number(lastSentStr);
      if (Date.now() - lastSent < OVERDUE_THROTTLE_MS) {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
};

export const markOverdueNotificationSent = async (
  itemId: string,
  type: 'subscription' | 'loan',
): Promise<void> => {
  try {
    const key = `@BuddyApp:lastOverdue:${type}:${itemId}`;
    await AsyncStorage.setItem(key, String(Date.now()));
  } catch (error) {
    logger.error('Error saving last overdue notification timestamp', error);
  }
};

export const clearOverdueNotificationRecord = async (
  itemId: string,
  type: 'subscription' | 'loan',
): Promise<void> => {
  try {
    const key = `@BuddyApp:lastOverdue:${type}:${itemId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error('Error clearing overdue notification record', error);
  }
};
let paymentSources: {subscriptions: SubscriptionData[]; loans: LoanData[]} = {
  subscriptions: [],
  loans: [],
};

export const setPaymentReminderSources = (
  subscriptions: SubscriptionData[],
  loans: LoanData[],
): void => {
  paymentSources = {subscriptions, loans};
};

export const clearAllScheduledPaymentNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await clearPaymentNotificationData();
    logger.debug('NotificationService: Cleared all scheduled notifications');
  } catch (error) {
    logger.error('NotificationService: Error clearing notifications:', error);
  }
};

export const scheduleAllPaymentReminders = async (): Promise<void> => {
  logger.debug('NotificationService: Scheduling all payment reminders...');

  try {
    await clearAllScheduledPaymentNotifications();

    const preferences = await getReminderPreferences();
    if (!preferences.subscriptionReminders && !preferences.loanReminders) {
      logger.debug('NotificationService: All reminders disabled in preferences');
      return;
    }

    const {subscriptions, loans} = paymentSources;

    let scheduledCount = 0;

    if (preferences.subscriptionReminders) {
      for (const subscription of subscriptions) {
        if (subscription.status === 'active' && subscription.reminderEnabled) {
          await scheduleSubscriptionReminder(subscription, preferences);
          scheduledCount++;
        }
      }
    }

    if (preferences.loanReminders) {
      for (const loan of loans) {
        if (loan.currentOutstanding > 0 && loan.reminderEnabled) {
          await scheduleLoanReminder(loan, preferences);
          scheduledCount++;
        }
      }
    }

    logger.debug(`NotificationService: Scheduled ${scheduledCount} payment reminders`);
  } catch (error) {
    logger.error('NotificationService: Error scheduling reminders:', error);
  }
};

export const scheduleSubscriptionReminder = async (
  subscription: SubscriptionData,
  preferences: ReminderPreferences,
): Promise<void> => {
  try {
    if (subscription.status !== 'active' || !subscription.reminderEnabled) {
      return;
    }

    const dueDate = new Date(subscription.nextBilling);
    const reminderDays = subscription.reminderDaysBefore ?? preferences.reminderDaysBefore;
    const reminderDate = new Date(dueDate.getTime() - reminderDays * 24 * 60 * 60 * 1000);

    const scheduledReminderDate = applyClockTime(reminderDate, preferences.dailyReminderTime);

    if (scheduledReminderDate > new Date()) {
      const title = `${subscription.name} Payment Reminder`;
      const body = `Your ${subscription.name} subscription of ${await formatCompactCurrency(
        subscription.amount,
      )} is due on ${dueDate.toLocaleDateString()}`;
      const notificationId = await scheduleDateNotification(
        {
          title,
          body,
          data: {
            type: 'subscription_due',
            sourceId: subscription.id,
            sourceType: 'subscription',
          },
          sound: true,
        },
        scheduledReminderDate,
      );

      await savePaymentNotificationData({
        id: `sub_${subscription.id}_${Date.now()}`,
        type: 'subscription_due',
        sourceId: subscription.id,
        sourceType: 'subscription',
        title,
        body,
        scheduledDate: scheduledReminderDate,
        notificationId,
      });

      logger.debug(
        `Scheduled subscription reminder for ${subscription.name} at ${scheduledReminderDate.toISOString()}`,
      );
    }

    const isSubscriptionPastDue = dayjs().isAfter(dayjs(dueDate).endOf('day'));
    if (preferences.overdueReminders && isSubscriptionPastDue) {
      if (await canSendOverdueNotification(subscription.id, 'subscription')) {
        await scheduleOverdueNotification(subscription, 'subscription');
        await markOverdueNotificationSent(subscription.id, 'subscription');
      }
    }
  } catch (error) {
    logger.error('NotificationService: Error scheduling subscription reminder:', error);
  }
};

export const scheduleLoanReminder = async (
  loan: LoanData,
  preferences: ReminderPreferences,
): Promise<void> => {
  try {
    const dueDate = new Date(loan.nextEmiDate);
    const reminderDate = new Date(
      dueDate.getTime() - preferences.reminderDaysBefore * 24 * 60 * 60 * 1000,
    );

    const scheduledReminderDate = applyClockTime(reminderDate, preferences.dailyReminderTime);

    if (scheduledReminderDate > new Date()) {
      const title = `${loan.name} EMI Reminder`;
      const body = `Your EMI payment of ${await formatCompactCurrency(loan.emiAmount)} for ${
        loan.name
      } is due on ${dueDate.toLocaleDateString()}`;
      const notificationId = await scheduleDateNotification(
        {
          title,
          body,
          data: {
            type: 'loan_emi_due',
            sourceId: loan.id,
            sourceType: 'loan',
          },
          sound: true,
        },
        scheduledReminderDate,
      );

      await savePaymentNotificationData({
        id: `loan_${loan.id}_${Date.now()}`,
        type: 'loan_emi_due',
        sourceId: loan.id,
        sourceType: 'loan',
        title,
        body,
        scheduledDate: scheduledReminderDate,
        notificationId,
      });

      logger.debug(
        `Scheduled loan reminder for ${loan.name} at ${scheduledReminderDate.toISOString()}`,
      );
    }

    const isLoanPastDue = dayjs().isAfter(dayjs(dueDate).endOf('day'));
    if (preferences.overdueReminders && isLoanPastDue) {
      if (await canSendOverdueNotification(loan.id, 'loan')) {
        await scheduleOverdueNotification(loan, 'loan');
        await markOverdueNotificationSent(loan.id, 'loan');
      }
    }
  } catch (error) {
    logger.error('NotificationService: Error scheduling loan reminder:', error);
  }
};

export const scheduleOverdueNotification = async (
  item: SubscriptionData | LoanData,
  type: 'subscription' | 'loan',
): Promise<void> => {
  try {
    const isSubscription = type === 'subscription';
    const title = isSubscription ? `${item.name} Payment Overdue!` : `${item.name} EMI Overdue!`;
    const amount = isSubscription
      ? (item as SubscriptionData).amount
      : (item as LoanData).emiAmount;
    const body = `Your ${isSubscription ? 'subscription' : 'EMI'} payment of ${await formatCompactCurrency(
      amount,
    )} is overdue. Please pay as soon as possible.`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'payment_overdue',
        sourceId: item.id,
        sourceType: type,
      },
      sound: true,
    });

    await savePaymentNotificationData({
      id: `overdue_${item.id}_${Date.now()}`,
      type: 'payment_overdue',
      sourceId: item.id,
      sourceType: type,
      title,
      body,
      scheduledDate: new Date(),
      notificationId,
    });

    logger.debug(`Sent overdue notification for ${item.name}`);
  } catch (error) {
    logger.error('NotificationService: Error scheduling overdue notification:', error);
  }
};

export const sendPaymentSuccessNotification = async (
  itemName: string,
  amount: number,
  type: 'subscription' | 'loan',
  itemId?: string,
): Promise<void> => {
  try {
    if (itemId) {
      await clearOverdueNotificationRecord(itemId, type);
    }
    const preferences = await getReminderPreferences();
    if (!preferences.successNotifications) {
      logger.debug('NotificationService: Success notifications disabled');
      return;
    }

    const isSubscription = type === 'subscription';
    await scheduleImmediateNotification({
      title: 'Payment Successful! ðŸŽ‰',
      body: `Your ${isSubscription ? 'subscription' : 'EMI'} payment of ${await formatCompactCurrency(
        amount,
      )} for ${itemName} has been recorded successfully.`,
      data: {
        type: 'payment_success',
        sourceType: type,
      },
      sound: true,
    });

    logger.debug(`Sent payment success notification for ${itemName}`);
  } catch (error) {
    logger.error('NotificationService: Error sending payment success notification:', error);
  }
};

export const updateNotificationsForItem = async (
  itemId: string,
  type: 'subscription' | 'loan',
): Promise<void> => {
  logger.debug(`NotificationService: Updating notifications for ${type}: ${itemId}`);

  try {
    const itemNotifications = await removePaymentNotificationsForItem(itemId, type);

    for (const notification of itemNotifications) {
      if (notification.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      }
    }

    await scheduleAllPaymentReminders();
  } catch (error) {
    logger.error('NotificationService: Error updating notifications for item:', error);
  }
};
