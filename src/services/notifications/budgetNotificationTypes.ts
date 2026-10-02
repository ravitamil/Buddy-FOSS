import {isRecord} from './notificationStorage';

export interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  color?: string;
}

export type BudgetAlertThreshold = 50 | 80 | 100;

export type BudgetAlertType =
  | 'threshold_reached'
  | 'overspending'
  | 'category_limit'
  | 'daily_summary'
  | 'weekly_summary';

export interface BudgetNotificationData {
  id: string;
  type: BudgetAlertType;
  budgetId: string;
  budgetName: string;
  threshold?: BudgetAlertThreshold;
  categoryId?: string;
  categoryName?: string;
  currentSpent: number;
  budgetLimit: number;
  percentage: number;
  scheduledDate: Date;
  notificationId?: string;
  isRead: boolean;
}

export interface BudgetAlertSettings {
  enabled: boolean;
  thresholdAlerts: BudgetAlertThreshold[];
  overspendingAlerts: boolean;
  categoryLimitAlerts: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  dailySummaryTime: string;
  weeklySummaryDay: number;
  weeklySummaryTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface BudgetAlertState {
  budgetId: string;
  alertedThresholds: BudgetAlertThreshold[];
  lastAlertDate: string;
}

export const defaultBudgetAlertSettings: BudgetAlertSettings = {
  enabled: true,
  thresholdAlerts: [50, 80, 100],
  overspendingAlerts: true,
  categoryLimitAlerts: true,
  dailySummary: true,
  weeklySummary: true,
  dailySummaryTime: '09:00',
  weeklySummaryDay: 0,
  weeklySummaryTime: '10:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

const budgetAlertTypes: readonly BudgetAlertType[] = [
  'threshold_reached',
  'overspending',
  'category_limit',
  'daily_summary',
  'weekly_summary',
];

const budgetAlertThresholds: readonly BudgetAlertThreshold[] = [50, 80, 100];

export const isBudgetAlertThreshold = (value: unknown): value is BudgetAlertThreshold =>
  typeof value === 'number' && budgetAlertThresholds.includes(value as BudgetAlertThreshold);

const isBudgetAlertType = (value: unknown): value is BudgetAlertType =>
  typeof value === 'string' && budgetAlertTypes.includes(value as BudgetAlertType);

export const parseBudgetAlertSettings = (value: unknown): Partial<BudgetAlertSettings> => {
  if (!isRecord(value)) {
    return {};
  }

  const settings: Partial<BudgetAlertSettings> = {};

  if (typeof value.enabled === 'boolean') settings.enabled = value.enabled;
  if (Array.isArray(value.thresholdAlerts)) {
    settings.thresholdAlerts = value.thresholdAlerts.filter(isBudgetAlertThreshold);
  }
  if (typeof value.overspendingAlerts === 'boolean') {
    settings.overspendingAlerts = value.overspendingAlerts;
  }
  if (typeof value.categoryLimitAlerts === 'boolean') {
    settings.categoryLimitAlerts = value.categoryLimitAlerts;
  }
  if (typeof value.dailySummary === 'boolean') settings.dailySummary = value.dailySummary;
  if (typeof value.weeklySummary === 'boolean') settings.weeklySummary = value.weeklySummary;
  if (typeof value.dailySummaryTime === 'string') {
    settings.dailySummaryTime = value.dailySummaryTime;
  }
  if (typeof value.weeklySummaryDay === 'number') {
    settings.weeklySummaryDay = value.weeklySummaryDay;
  }
  if (typeof value.weeklySummaryTime === 'string') {
    settings.weeklySummaryTime = value.weeklySummaryTime;
  }
  if (typeof value.quietHoursStart === 'string') settings.quietHoursStart = value.quietHoursStart;
  if (typeof value.quietHoursEnd === 'string') settings.quietHoursEnd = value.quietHoursEnd;

  return settings;
};

export const parseBudgetAlertStates = (value: unknown): BudgetAlertState[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): BudgetAlertState[] => {
    if (
      !isRecord(item) ||
      typeof item.budgetId !== 'string' ||
      typeof item.lastAlertDate !== 'string'
    ) {
      return [];
    }

    return [
      {
        budgetId: item.budgetId,
        lastAlertDate: item.lastAlertDate,
        alertedThresholds: Array.isArray(item.alertedThresholds)
          ? item.alertedThresholds.filter(isBudgetAlertThreshold)
          : [],
      },
    ];
  });
};

const parseScheduledDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseBudgetNotificationData = (value: unknown): BudgetNotificationData[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): BudgetNotificationData[] => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      !isBudgetAlertType(item.type) ||
      typeof item.budgetId !== 'string' ||
      typeof item.budgetName !== 'string' ||
      typeof item.currentSpent !== 'number' ||
      typeof item.budgetLimit !== 'number' ||
      typeof item.percentage !== 'number' ||
      typeof item.isRead !== 'boolean'
    ) {
      return [];
    }

    const scheduledDate = parseScheduledDate(item.scheduledDate);
    if (!scheduledDate) {
      return [];
    }

    return [
      {
        id: item.id,
        type: item.type,
        budgetId: item.budgetId,
        budgetName: item.budgetName,
        threshold: isBudgetAlertThreshold(item.threshold) ? item.threshold : undefined,
        categoryId: typeof item.categoryId === 'string' ? item.categoryId : undefined,
        categoryName: typeof item.categoryName === 'string' ? item.categoryName : undefined,
        currentSpent: item.currentSpent,
        budgetLimit: item.budgetLimit,
        percentage: item.percentage,
        scheduledDate,
        notificationId: typeof item.notificationId === 'string' ? item.notificationId : undefined,
        isRead: item.isRead,
      },
    ];
  });
};
