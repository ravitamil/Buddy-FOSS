import * as Notifications from 'expo-notifications';

import type {Budget} from '../../types';
import {logger as appLogger} from '../LoggerService';
import {formatBudgetCurrency} from './budgetCurrency';
import {saveBudgetNotificationData} from './budgetNotificationStore';
import type {BudgetAlertThreshold, CategoryBudget} from './budgetNotificationTypes';
import {scheduleImmediateNotification} from './notificationScheduler';
import {isRecord} from './notificationStorage';

const logger = appLogger.serviceLogger('BudgetNotificationService');

export async function sendThresholdAlert(params: {
  budget: Budget;
  currentSpent: number;
  threshold: BudgetAlertThreshold;
  percentage: number;
}): Promise<void> {
  const {budget, currentSpent, threshold, percentage} = params;

  try {
    const title = `Budget Alert: ${threshold}% Reached`;
    const body =
      threshold === 100
        ? `You've reached 100% of your monthly budget. Consider pausing non-essential spending.`
        : `You've spent ${percentage.toFixed(1)}% of your monthly budget (${threshold}% threshold reached).`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'threshold_reached',
        budgetId: budget.id,
        threshold,
        percentage,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    });

    await saveBudgetNotificationData({
      id: `threshold_${budget.id}_${threshold}_${Date.now()}`,
      type: 'threshold_reached',
      budgetId: budget.id,
      budgetName: budget.name,
      threshold,
      currentSpent,
      budgetLimit: budget.plannedExpenses,
      percentage,
      scheduledDate: new Date(),
      notificationId: notificationId || undefined,
      isRead: false,
    });

    logger.info(`Threshold alert sent for budget ${budget.id} at ${threshold}%`);
  } catch (error) {
    logger.error('Error sending threshold alert', error);
  }
}

export async function sendOverspendingAlert(params: {
  budget: Budget;
  currentSpent: number;
  overspendAmount: number;
  percentage: number;
}): Promise<void> {
  const {budget, currentSpent, overspendAmount, percentage} = params;

  try {
    const title = 'Budget overspent';
    const body = `You've exceeded your budget by ${formatBudgetCurrency(overspendAmount, budget.currencyCode)}. Total spent: ${formatBudgetCurrency(currentSpent, budget.currencyCode)}`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'overspending',
        budgetId: budget.id,
        overspendAmount,
        percentage,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    });

    await saveBudgetNotificationData({
      id: `overspend_${budget.id}_${Date.now()}`,
      type: 'overspending',
      budgetId: budget.id,
      budgetName: budget.name,
      currentSpent,
      budgetLimit: budget.plannedExpenses,
      percentage,
      scheduledDate: new Date(),
      notificationId: notificationId || undefined,
      isRead: false,
    });

    logger.info(`Overspending alert sent for budget ${budget.id}`);
  } catch (error) {
    logger.error('Error sending overspending alert', error);
  }
}

export async function sendCategoryLimitAlert(params: {
  budget: Budget;
  categoryBudget: CategoryBudget;
}): Promise<void> {
  const {budget, categoryBudget} = params;

  try {
    const overspendAmount = categoryBudget.spent - categoryBudget.allocated;
    const title = `Category Budget Exceeded: ${categoryBudget.categoryName}`;
    const body = `You've spent ${formatBudgetCurrency(categoryBudget.spent, budget.currencyCode)} in ${categoryBudget.categoryName}, exceeding your ${formatBudgetCurrency(categoryBudget.allocated, budget.currencyCode)} budget by ${formatBudgetCurrency(overspendAmount, budget.currencyCode)}.`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'category_limit',
        budgetId: budget.id,
        categoryId: categoryBudget.categoryId,
        categoryName: categoryBudget.categoryName,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    });

    await saveBudgetNotificationData({
      id: `category_${budget.id}_${categoryBudget.categoryId}_${Date.now()}`,
      type: 'category_limit',
      budgetId: budget.id,
      budgetName: budget.name,
      categoryId: categoryBudget.categoryId,
      categoryName: categoryBudget.categoryName,
      currentSpent: categoryBudget.spent,
      budgetLimit: categoryBudget.allocated,
      percentage: (categoryBudget.spent / categoryBudget.allocated) * 100,
      scheduledDate: new Date(),
      notificationId: notificationId || undefined,
      isRead: false,
    });

    logger.info(
      `Category limit alert sent for budget ${budget.id}, category ${categoryBudget.categoryName}`,
    );
  } catch (error) {
    logger.error('Error sending category limit alert', error);
  }
}

export async function sendImmediateBudgetSummary(params: {
  budget: Budget;
  currentSpent: number;
  remainingDays: number;
}): Promise<void> {
  const {budget, currentSpent, remainingDays} = params;

  try {
    const percentage =
      budget.plannedExpenses > 0 ? (currentSpent / budget.plannedExpenses) * 100 : 0;
    const remaining = budget.plannedExpenses - currentSpent;
    const dailyBudget = remainingDays > 0 ? remaining / remainingDays : 0;
    const title = 'Budget status update';
    const body =
      percentage >= 100
        ? `Budget exceeded! You've spent ${percentage.toFixed(1)}% of your monthly budget.`
        : `You've used ${percentage.toFixed(1)}% of your budget. ${remainingDays} days left with ${formatBudgetCurrency(dailyBudget, budget.currencyCode)}/day available.`;

    await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'threshold_reached',
        budgetId: budget.id,
        percentage,
      },
      sound: true,
    });

    logger.info(`Immediate summary sent for budget ${budget.id}`);
  } catch (error) {
    logger.error('Error sending immediate summary', error);
  }
}

export function handleBudgetNotificationReceived(notification: Notifications.Notification): void {
  try {
    const data = notification.request.content.data;
    logger.info('Budget notification received', data);
    const notificationType = isRecord(data) ? data.type : undefined;

    switch (notificationType) {
      case 'daily_summary':
      case 'weekly_summary':
        logger.info(`Summary notification: ${notificationType}`);
        break;
      case 'threshold_reached':
      case 'overspending':
      case 'category_limit':
        logger.info(`Alert notification: ${notificationType}`);
        break;
      default:
        logger.warn('Unknown notification type', notificationType);
    }
  } catch (error) {
    logger.error('Error handling notification', error);
  }
}
