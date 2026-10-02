import {isRecord, parseJson} from './notificationStorage';

export type NotificationType =
  | 'subscription_due'
  | 'loan_emi_due'
  | 'payment_overdue'
  | 'payment_success'
  | 'payment_reminder';

export interface NotificationData {
  id: string;
  type: NotificationType;
  sourceId: string;
  sourceType: 'subscription' | 'loan';
  title: string;
  body: string;
  scheduledDate: Date;
  notificationId?: string;
}

export interface ReminderPreferences {
  subscriptionReminders: boolean;
  loanReminders: boolean;
  reminderDaysBefore: number;
  dailyReminderTime: string;
  overdueReminders: boolean;
  successNotifications: boolean;
}

export type NotificationPayload = Pick<NotificationData, 'type' | 'sourceId' | 'sourceType'>;

export const defaultReminderPreferences: ReminderPreferences = {
  subscriptionReminders: true,
  loanReminders: true,
  reminderDaysBefore: 3,
  dailyReminderTime: '09:00',
  overdueReminders: true,
  successNotifications: true,
};

const notificationTypes: readonly NotificationType[] = [
  'subscription_due',
  'loan_emi_due',
  'payment_overdue',
  'payment_success',
  'payment_reminder',
];

const isNotificationType = (value: unknown): value is NotificationType =>
  typeof value === 'string' && notificationTypes.includes(value as NotificationType);

const isNotificationSourceType = (value: unknown): value is NotificationData['sourceType'] =>
  value === 'subscription' || value === 'loan';

export const parseNotificationPayload = (
  data: Record<string, unknown>,
): Partial<NotificationPayload> => ({
  type: isNotificationType(data.type) ? data.type : undefined,
  sourceId: typeof data.sourceId === 'string' ? data.sourceId : undefined,
  sourceType: isNotificationSourceType(data.sourceType) ? data.sourceType : undefined,
});

export const parseReminderPreferences = (stored: string | null): ReminderPreferences => ({
  ...defaultReminderPreferences,
  ...parseReminderPreferencePatch(stored ? parseJson(stored) : {}),
});

export const parseStoredNotificationData = (value: unknown): NotificationData[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): NotificationData[] => {
    if (!isRecord(item)) return [];

    const payload = parseNotificationPayload(item);
    const title = typeof item.title === 'string' ? item.title : undefined;
    const body = typeof item.body === 'string' ? item.body : undefined;
    const scheduledDate =
      typeof item.scheduledDate === 'string' || item.scheduledDate instanceof Date
        ? new Date(item.scheduledDate)
        : undefined;

    if (
      !payload.type ||
      !payload.sourceId ||
      !payload.sourceType ||
      !title ||
      !body ||
      !scheduledDate
    ) {
      return [];
    }

    return [
      {
        id:
          typeof item.id === 'string'
            ? item.id
            : `${payload.type}_${payload.sourceId}_${scheduledDate.getTime()}`,
        type: payload.type,
        sourceId: payload.sourceId,
        sourceType: payload.sourceType,
        title,
        body,
        scheduledDate,
        notificationId: typeof item.notificationId === 'string' ? item.notificationId : undefined,
      },
    ];
  });
};

const parseReminderPreferencePatch = (value: unknown): Partial<ReminderPreferences> => {
  if (!isRecord(value)) return {};

  const preferences: Partial<ReminderPreferences> = {};

  if (typeof value.subscriptionReminders === 'boolean') {
    preferences.subscriptionReminders = value.subscriptionReminders;
  }
  if (typeof value.loanReminders === 'boolean') preferences.loanReminders = value.loanReminders;
  if (typeof value.reminderDaysBefore === 'number') {
    preferences.reminderDaysBefore = value.reminderDaysBefore;
  }
  if (typeof value.dailyReminderTime === 'string') {
    preferences.dailyReminderTime = value.dailyReminderTime;
  }
  if (typeof value.overdueReminders === 'boolean') {
    preferences.overdueReminders = value.overdueReminders;
  }
  if (typeof value.successNotifications === 'boolean') {
    preferences.successNotifications = value.successNotifications;
  }

  return preferences;
};
