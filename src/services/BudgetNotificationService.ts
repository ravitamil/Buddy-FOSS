/**
 * Budget Notification Service
 *
 * Handles budget alerts and notifications including:
 * - Threshold-based alerts (50%, 80%, 100% budget used)
 * - Daily/weekly budget summary push notifications
 * - Overspending warnings when transactions exceed budget
 * - Category budget limit alerts
 *
 * P0-001: Critical Budget Alert Notifications Implementation
 */

import type * as Notifications from 'expo-notifications';

import {Budget} from '../types';
import type {BudgetCycleModel} from '@/features/budgets/model/budgetCycle';
import {logger as appLogger} from './LoggerService';
import {BudgetAlertStateStore} from './notifications/budgetAlertStateStore';
import {
  handleBudgetNotificationReceived,
  sendCategoryLimitAlert,
  sendImmediateBudgetSummary,
  sendOverspendingAlert,
  sendThresholdAlert,
} from './notifications/budgetNotificationAlerts';
import {
  clearBudgetNotificationHistory,
  getAllBudgetNotificationData,
  getBudgetAlertSettings,
  getUnreadBudgetNotificationCount,
  markBudgetNotificationAsRead,
  updateBudgetAlertSettings,
} from './notifications/budgetNotificationStore';
import {
  type BudgetAlertSettings,
  type BudgetNotificationData,
} from './notifications/budgetNotificationTypes';
import {scheduleBudgetSummaryNotifications} from './notifications/budgetSummaryNotifications';

export type {
  BudgetAlertSettings,
  BudgetAlertState,
  BudgetAlertThreshold,
  BudgetAlertType,
  BudgetNotificationData,
  CategoryBudget,
} from './notifications/budgetNotificationTypes';

const logger = appLogger.serviceLogger('BudgetNotificationService');

const LAST_ALERT_SENT_KEY = '@BuddyApp:lastBudgetAlert';

export class BudgetNotificationService {
  private static instance: BudgetNotificationService;
  private alertStateStore = new BudgetAlertStateStore(LAST_ALERT_SENT_KEY);

  private constructor() {
    void this.alertStateStore.load();
  }

  static getInstance(): BudgetNotificationService {
    if (!BudgetNotificationService.instance) {
      BudgetNotificationService.instance = new BudgetNotificationService();
    }
    return BudgetNotificationService.instance;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing BudgetNotificationService');

    try {
      await this.alertStateStore.load();
      await this.scheduleSummaryNotifications();

      logger.info('BudgetNotificationService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize BudgetNotificationService', error);
    }
  }

  async getAlertSettings(): Promise<BudgetAlertSettings> {
    return getBudgetAlertSettings();
  }

  async updateAlertSettings(settings: Partial<BudgetAlertSettings>): Promise<void> {
    try {
      const updated = await updateBudgetAlertSettings(settings);

      if (
        settings.dailySummary !== undefined ||
        settings.weeklySummary !== undefined ||
        settings.dailySummaryTime !== undefined ||
        settings.weeklySummaryTime !== undefined ||
        settings.weeklySummaryDay !== undefined
      ) {
        await this.scheduleSummaryNotifications();
      }

      logger.info('Alert settings updated', updated);
    } catch (error) {
      logger.error('Error updating alert settings', error);
      throw error;
    }
  }

  async checkBudgetCycleThresholds({
    budget,
    model,
  }: {
    budget: Budget;
    model: BudgetCycleModel;
  }): Promise<void> {
    const settings = await this.getAlertSettings();

    if (!settings.enabled) {
      return;
    }

    const spendingLimit = model.plannedVariableSpending + model.totalCommitted;
    const notificationBudget = {...budget, plannedExpenses: spendingLimit};
    const currentSpent = model.actualSpent;
    const percentage = model.utilizationPercentage;

    for (const threshold of settings.thresholdAlerts) {
      if (percentage >= threshold && !this.alertStateStore.hasAlertBeenSent(budget.id, threshold)) {
        await sendThresholdAlert({budget: notificationBudget, currentSpent, threshold, percentage});
        this.alertStateStore.markAlertSent(budget.id, threshold);
      }
    }

    if (
      settings.overspendingAlerts &&
      currentSpent > spendingLimit &&
      !this.alertStateStore.hasAlertBeenSent(budget.id, 100)
    ) {
      await sendOverspendingAlert({
        budget: notificationBudget,
        currentSpent,
        overspendAmount: currentSpent - spendingLimit,
        percentage,
      });
      this.alertStateStore.markAlertSent(budget.id, 100);
    }

    if (settings.categoryLimitAlerts) {
      for (const category of model.categoryProgress) {
        if (category.spent > category.amount) {
          await sendCategoryLimitAlert({
            budget: notificationBudget,
            categoryBudget: {
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              allocated: category.amount,
              spent: category.spent,
              color: category.color,
            },
          });
        }
      }
    }
  }

  async scheduleSummaryNotifications(): Promise<void> {
    await scheduleBudgetSummaryNotifications(await this.getAlertSettings());
  }

  async sendImmediateSummary(
    budget: Budget,
    currentSpent: number,
    remainingDays: number,
  ): Promise<void> {
    await sendImmediateBudgetSummary({budget, currentSpent, remainingDays});
  }

  async getAllNotificationData(): Promise<BudgetNotificationData[]> {
    return getAllBudgetNotificationData();
  }

  async getUnreadNotificationsCount(): Promise<number> {
    return getUnreadBudgetNotificationCount();
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await markBudgetNotificationAsRead(notificationId);
  }

  async clearNotificationHistory(): Promise<void> {
    await clearBudgetNotificationHistory();
  }

  async resetAlertStates(budgetId: string): Promise<void> {
    await this.alertStateStore.reset(budgetId);
    logger.info(`Alert states reset for budget ${budgetId}`);
  }

  handleNotificationReceived(notification: Notifications.Notification): void {
    handleBudgetNotificationReceived(notification);
  }
}

export const budgetNotificationService = BudgetNotificationService.getInstance();

export default budgetNotificationService;
