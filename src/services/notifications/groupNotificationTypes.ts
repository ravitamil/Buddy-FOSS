import {isRecord, parseJson} from './notificationStorage';

export interface GroupNotificationData {
  id: string;
  groupId: string;
  groupName: string;
  type:
    | 'expense_added'
    | 'payment_reminder'
    | 'settlement_suggestion'
    | 'group_invite'
    | 'debt_settled'
    | 'expense_overdue';
  title: string;
  body: string;
  data: Record<string, unknown>;
  scheduledDate: Date;
  notificationId?: string;
  isRead: boolean;
  createdBy?: string;
  targetMembers?: string[];
}

export interface GroupNotificationPreferences {
  enabled: boolean;
  expenseNotifications: boolean;
  paymentReminders: boolean;
  settlementSuggestions: boolean;
  groupInvites: boolean;
  debtUpdates: boolean;
  reminderDaysBefore: number;
  dailyReminderTime: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const defaultGroupNotificationPreferences: GroupNotificationPreferences = {
  enabled: true,
  expenseNotifications: true,
  paymentReminders: true,
  settlementSuggestions: true,
  groupInvites: true,
  debtUpdates: true,
  reminderDaysBefore: 3,
  dailyReminderTime: '10:00',
  soundEnabled: true,
  vibrationEnabled: true,
};

const notificationTypes: readonly GroupNotificationData['type'][] = [
  'expense_added',
  'payment_reminder',
  'settlement_suggestion',
  'group_invite',
  'debt_settled',
  'expense_overdue',
];

const isNotificationType = (value: unknown): value is GroupNotificationData['type'] =>
  typeof value === 'string' && notificationTypes.includes(value as GroupNotificationData['type']);

export const parseGroupNotificationPreferences = (
  stored: string | null,
): GroupNotificationPreferences => ({
  ...defaultGroupNotificationPreferences,
  ...parsePreferencePatch(stored ? parseJson(stored) : {}),
});

export const parseGroupNotificationData = (value: unknown): GroupNotificationData[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): GroupNotificationData[] => {
    if (!isRecord(item)) return [];

    const scheduledDate =
      typeof item.scheduledDate === 'string' || item.scheduledDate instanceof Date
        ? new Date(item.scheduledDate)
        : undefined;

    if (
      typeof item.id !== 'string' ||
      typeof item.groupId !== 'string' ||
      typeof item.groupName !== 'string' ||
      !isNotificationType(item.type) ||
      typeof item.title !== 'string' ||
      typeof item.body !== 'string' ||
      !scheduledDate
    ) {
      return [];
    }

    return [
      {
        id: item.id,
        groupId: item.groupId,
        groupName: item.groupName,
        type: item.type,
        title: item.title,
        body: item.body,
        data: isRecord(item.data) ? item.data : {},
        scheduledDate,
        notificationId: typeof item.notificationId === 'string' ? item.notificationId : undefined,
        isRead: typeof item.isRead === 'boolean' ? item.isRead : false,
        createdBy: typeof item.createdBy === 'string' ? item.createdBy : undefined,
        targetMembers: Array.isArray(item.targetMembers)
          ? item.targetMembers.filter((member): member is string => typeof member === 'string')
          : undefined,
      },
    ];
  });
};

const parsePreferencePatch = (value: unknown): Partial<GroupNotificationPreferences> => {
  if (!isRecord(value)) return {};

  const preferences: Partial<GroupNotificationPreferences> = {};
  if (typeof value.enabled === 'boolean') preferences.enabled = value.enabled;
  if (typeof value.expenseNotifications === 'boolean') {
    preferences.expenseNotifications = value.expenseNotifications;
  }
  if (typeof value.paymentReminders === 'boolean') {
    preferences.paymentReminders = value.paymentReminders;
  }
  if (typeof value.settlementSuggestions === 'boolean') {
    preferences.settlementSuggestions = value.settlementSuggestions;
  }
  if (typeof value.groupInvites === 'boolean') preferences.groupInvites = value.groupInvites;
  if (typeof value.debtUpdates === 'boolean') preferences.debtUpdates = value.debtUpdates;
  if (typeof value.reminderDaysBefore === 'number') {
    preferences.reminderDaysBefore = value.reminderDaysBefore;
  }
  if (typeof value.dailyReminderTime === 'string') {
    preferences.dailyReminderTime = value.dailyReminderTime;
  }
  if (typeof value.soundEnabled === 'boolean') preferences.soundEnabled = value.soundEnabled;
  if (typeof value.vibrationEnabled === 'boolean') {
    preferences.vibrationEnabled = value.vibrationEnabled;
  }

  return preferences;
};
