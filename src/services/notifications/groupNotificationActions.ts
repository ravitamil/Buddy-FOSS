import {Group, GroupMember, Transaction} from '../../types';
import {calculateGroupBalance} from '../../utils/groupBalanceUtils.optimized';
import {logger as appLogger} from '../LoggerService';
import {formatCompactCurrency} from './notificationCurrency';
import {
  getGroupNotificationPreferences,
  getLastGroupNotificationOfType,
  saveGroupNotificationData,
} from './groupNotificationStore';
import type {GroupNotificationData} from './groupNotificationTypes';
import {
  applyClockTime,
  scheduleDateNotification,
  scheduleImmediateNotification,
} from './notificationScheduler';

const logger = appLogger.serviceLogger('GroupNotificationActions');

export const notifyExpenseAdded = async (
  group: Group,
  transaction: Transaction,
  addedBy: string,
): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.expenseNotifications) {
      logger.debug('ðŸ”• GroupNotificationService: Expense notifications disabled');
      return;
    }

    const addedByMember = group.members.find((member) => member.id === addedBy);
    const addedByName = addedByMember?.name || 'Someone';
    const expenseAmount = Math.abs(transaction.amount);

    const title = `ðŸ’¸ New expense in ${group.emoji || 'ðŸ‘¥'} ${group.name}`;
    const body = `${addedByName} added "${transaction.description}" for ${await formatCompactCurrency(expenseAmount)}`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'expense_added',
        groupId: group.id,
        transactionId: transaction.id,
        addedBy,
      },
      sound: preferences.soundEnabled,
    });

    await saveGroupNotificationData({
      id: `expense_${transaction.id}_${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      type: 'expense_added',
      title,
      body,
      data: {
        transactionId: transaction.id,
        addedBy,
        amount: expenseAmount,
      },
      scheduledDate: new Date(),
      notificationId,
      isRead: false,
      createdBy: addedBy,
    });

    logger.debug(`ðŸ”” GroupNotificationService: Expense notification sent for ${group.name}`);
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error sending expense notification:', error);
  }
};

export const schedulePaymentReminders = async (group: Group): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.paymentReminders) {
      logger.debug('ðŸ”• GroupNotificationService: Payment reminders disabled');
      return;
    }

    const groupBalance = calculateGroupBalance(group.transactions || [], group.members || []);
    const debtors = groupBalance.memberBalances.filter((member) => member.balance < -1);

    for (const debtor of debtors) {
      const owedAmount = Math.abs(debtor.balance);
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 1);

      const scheduledReminderDate = applyClockTime(reminderDate, preferences.dailyReminderTime);
      const title = `ðŸ’³ Payment reminder for ${group.emoji || 'ðŸ‘¥'} ${group.name}`;
      const body = `You owe ${await formatCompactCurrency(owedAmount)} in the group. Consider settling up!`;

      const notificationId = await scheduleDateNotification(
        {
          title,
          body,
          data: {
            type: 'payment_reminder',
            groupId: group.id,
            memberId: debtor.memberId,
            amount: owedAmount,
          },
          sound: preferences.soundEnabled,
        },
        scheduledReminderDate,
      );

      await saveGroupNotificationData({
        id: `reminder_${group.id}_${debtor.memberId}_${Date.now()}`,
        groupId: group.id,
        groupName: group.name,
        type: 'payment_reminder',
        title,
        body,
        data: {
          memberId: debtor.memberId,
          amount: owedAmount,
        },
        scheduledDate: scheduledReminderDate,
        notificationId,
        isRead: false,
        targetMembers: [debtor.memberId],
      });
    }

    logger.debug(
      `ðŸ”” GroupNotificationService: Scheduled ${debtors.length} payment reminders for ${group.name}`,
    );
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error scheduling payment reminders:', error);
  }
};

export const forceRefreshSettlementSuggestions = async (group: Group): Promise<void> => {
  try {
    logger.debug(
      'ðŸ”„ GroupNotificationService: Force refreshing settlement suggestions for',
      group.name,
    );

    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.settlementSuggestions) {
      logger.debug('ðŸ”• GroupNotificationService: Settlement notifications disabled');
      return;
    }

    const groupBalance = calculateGroupBalance(group.transactions || [], group.members || []);

    if (groupBalance.settlementSuggestions.length === 0) {
      logger.debug(
        'ðŸ“Š GroupNotificationService: No settlement suggestions for',
        group.name,
        '- sending update',
      );

      await scheduleImmediateNotification({
        title: `âœ… All debts settled in ${group.emoji || 'ðŸ‘¥'} ${group.name}`,
        body: 'All members are now settled up in this group!',
        data: {
          type: 'settlement_suggestion',
          groupId: group.id,
          isSettled: true,
        },
        sound: preferences.soundEnabled,
      });
      return;
    }

    const topSuggestion = groupBalance.settlementSuggestions[0];
    await scheduleImmediateNotification({
      title: `ðŸŽ¯ Settlement suggestion for ${group.emoji || 'ðŸ‘¥'} ${group.name}`,
      body: `${topSuggestion.fromMemberName} can pay ${await formatCompactCurrency(
        topSuggestion.amount,
      )} to ${topSuggestion.toMemberName} to simplify debts`,
      data: {
        type: 'settlement_suggestion',
        groupId: group.id,
        suggestionId: topSuggestion.id,
        fromMemberId: topSuggestion.fromMemberId,
        toMemberId: topSuggestion.toMemberId,
        amount: topSuggestion.amount,
        totalSuggestions: groupBalance.settlementSuggestions.length,
      },
      sound: preferences.soundEnabled,
    });

    logger.debug(
      `ðŸ”” GroupNotificationService: Force refresh settlement suggestions completed for ${group.name}`,
    );
  } catch (error) {
    logger.error(
      'âŒ GroupNotificationService: Error force refreshing settlement suggestions:',
      error,
    );
  }
};

export const notifySettlementSuggestions = async (group: Group): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.settlementSuggestions) {
      logger.debug('ðŸ”• GroupNotificationService: Settlement notifications disabled');
      return;
    }

    const groupBalance = calculateGroupBalance(group.transactions || [], group.members || []);
    if (groupBalance.settlementSuggestions.length === 0) {
      logger.debug('ðŸ“Š GroupNotificationService: No settlement suggestions for', group.name);
      return;
    }

    const topSuggestion = groupBalance.settlementSuggestions[0];
    const title = `ðŸŽ¯ Settlement suggestion for ${group.emoji || 'ðŸ‘¥'} ${group.name}`;
    const body = `${topSuggestion.fromMemberName} can pay ${await formatCompactCurrency(
      topSuggestion.amount,
    )} to ${topSuggestion.toMemberName} to simplify debts`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'settlement_suggestion',
        groupId: group.id,
        suggestionId: topSuggestion.id,
        fromMemberId: topSuggestion.fromMemberId,
        toMemberId: topSuggestion.toMemberId,
        amount: topSuggestion.amount,
      },
      sound: preferences.soundEnabled,
    });

    await saveGroupNotificationData({
      id: `settlement_${group.id}_${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      type: 'settlement_suggestion',
      title,
      body,
      data: {
        suggestionId: topSuggestion.id,
        fromMemberId: topSuggestion.fromMemberId,
        toMemberId: topSuggestion.toMemberId,
        amount: topSuggestion.amount,
        totalSuggestions: groupBalance.settlementSuggestions.length,
      },
      scheduledDate: new Date(),
      notificationId,
      isRead: false,
    });

    logger.debug(`ðŸ”” GroupNotificationService: Settlement suggestion sent for ${group.name}`);
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error sending settlement suggestion:', error);
  }
};

export const notifyGroupInvite = async (
  group: Group,
  invitedMemberName: string,
  invitedBy: string,
): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.groupInvites) {
      logger.debug('ðŸ”• GroupNotificationService: Group invite notifications disabled');
      return;
    }

    const invitedByMember = group.members.find((member) => member.id === invitedBy);
    const invitedByName = invitedByMember?.name || 'Someone';
    const title = `ðŸ‘‹ You've been added to ${group.emoji || 'ðŸ‘¥'} ${group.name}`;
    const body = `${invitedByName} added you to the group. Start tracking expenses together!`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'group_invite',
        groupId: group.id,
        invitedBy,
      },
      sound: preferences.soundEnabled,
    });

    await saveGroupNotificationData({
      id: `invite_${group.id}_${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      type: 'group_invite',
      title,
      body,
      data: {
        invitedMemberName,
        invitedBy,
      },
      scheduledDate: new Date(),
      notificationId,
      isRead: false,
      createdBy: invitedBy,
    });

    logger.debug(`ðŸ”” GroupNotificationService: Group invite sent for ${invitedMemberName}`);
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error sending group invite:', error);
  }
};

export const notifyDebtSettled = async (
  group: Group,
  fromMember: GroupMember,
  toMember: GroupMember,
  amount: number,
): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled || !preferences.debtUpdates) {
      logger.debug('ðŸ”• GroupNotificationService: Debt update notifications disabled');
      return;
    }

    const title = `âœ… Debt settled in ${group.emoji || 'ðŸ‘¥'} ${group.name}`;
    const body = `${fromMember.name} paid ${await formatCompactCurrency(amount)} to ${toMember.name}`;

    const notificationId = await scheduleImmediateNotification({
      title,
      body,
      data: {
        type: 'debt_settled',
        groupId: group.id,
        fromMemberId: fromMember.id,
        toMemberId: toMember.id,
        amount,
      },
      sound: preferences.soundEnabled,
    });

    await saveGroupNotificationData({
      id: `settled_${group.id}_${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      type: 'debt_settled',
      title,
      body,
      data: {
        fromMemberId: fromMember.id,
        toMemberId: toMember.id,
        amount,
      },
      scheduledDate: new Date(),
      notificationId,
      isRead: false,
    });

    logger.debug(`ðŸ”” GroupNotificationService: Debt settled notification sent for ${group.name}`);
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error sending debt settled notification:', error);
  }
};

export const schedulePeriodicReminders = async (groups: Group[]): Promise<void> => {
  try {
    const preferences = await getGroupNotificationPreferences();
    if (!preferences.enabled) {
      logger.debug(
        'ðŸ”• GroupNotificationService: Notifications disabled, skipping periodic reminders',
      );
      return;
    }

    logger.debug(
      `ðŸ”„ GroupNotificationService: Scheduling periodic reminders for ${groups.length} groups`,
    );

    for (const group of groups) {
      await schedulePaymentReminders(group);

      const groupBalance = calculateGroupBalance(group.transactions || [], group.members || []);
      if (groupBalance.settlementSuggestions.length === 0) continue;

      const lastSettlementNotification = await getLastNotificationOfType(
        group.id,
        'settlement_suggestion',
      );
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (
        !lastSettlementNotification ||
        new Date(lastSettlementNotification.scheduledDate) < oneWeekAgo
      ) {
        await notifySettlementSuggestions(group);
      }
    }
  } catch (error) {
    logger.error('âŒ GroupNotificationService: Error scheduling periodic reminders:', error);
  }
};

const getLastNotificationOfType = async (
  groupId: string,
  type: GroupNotificationData['type'],
): Promise<GroupNotificationData | null> => getLastGroupNotificationOfType(groupId, type);
