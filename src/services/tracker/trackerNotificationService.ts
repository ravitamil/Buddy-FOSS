import {logger as appLogger} from '../LoggerService';

export type TrackerNotificationService = Pick<
  typeof import('../NotificationService').NotificationService,
  'updateNotificationsForItem' | 'sendPaymentSuccessNotification'
>;

let notificationServiceInstance: TrackerNotificationService | null = null;

export async function getTrackerNotificationService(): Promise<TrackerNotificationService | null> {
  if (!notificationServiceInstance) {
    try {
      const {NotificationService} = await import('../NotificationService');
      notificationServiceInstance = NotificationService;
    } catch (error) {
      appLogger.warn('NotificationService not available:', error);
    }
  }

  return notificationServiceInstance;
}
