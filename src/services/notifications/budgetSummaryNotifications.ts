import * as Notifications from 'expo-notifications';

import {logger as appLogger} from '../LoggerService';
import {scheduleDailyNotification, scheduleWeeklyNotification} from './notificationScheduler';
import type {BudgetAlertSettings} from './budgetNotificationTypes';

const logger = appLogger.serviceLogger('BudgetSummaryNotifications');

export const scheduleBudgetSummaryNotifications = async (
  settings: BudgetAlertSettings,
): Promise<void> => {
  try {
    await cancelBudgetSummaryNotifications();

    if (settings.dailySummary) {
      await scheduleDailyBudgetSummary(settings.dailySummaryTime);
    }

    if (settings.weeklySummary) {
      await scheduleWeeklyBudgetSummary(settings.weeklySummaryDay, settings.weeklySummaryTime);
    }

    logger.info('Summary notifications scheduled');
  } catch (error) {
    logger.error('Error scheduling summary notifications', error);
  }
};

const scheduleDailyBudgetSummary = async (time: string): Promise<void> => {
  try {
    await scheduleDailyNotification(
      {
        title: '???? Daily Budget Summary',
        body: 'Check your daily spending and budget status.',
        data: {type: 'daily_summary'},
        sound: false,
      },
      time,
    );

    logger.info(`Daily summary scheduled for ${time}`);
  } catch (error) {
    logger.error('Error scheduling daily summary', error);
  }
};

const scheduleWeeklyBudgetSummary = async (day: number, time: string): Promise<void> => {
  try {
    await scheduleWeeklyNotification(
      {
        title: '???? Weekly Budget Report',
        body: 'Review your weekly spending patterns and budget performance.',
        data: {type: 'weekly_summary'},
        sound: false,
      },
      day,
      time,
    );

    logger.info(`Weekly summary scheduled for day ${day} at ${time}`);
  } catch (error) {
    logger.error('Error scheduling weekly summary', error);
  }
};

const cancelBudgetSummaryNotifications = async (): Promise<void> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of notifications) {
      const data = notification.content.data;
      if (data?.type === 'daily_summary' || data?.type === 'weekly_summary') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    logger.info('Summary notifications cancelled');
  } catch (error) {
    logger.error('Error cancelling summary notifications', error);
  }
};
