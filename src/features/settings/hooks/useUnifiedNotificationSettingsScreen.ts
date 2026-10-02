import {useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {router} from 'expo-router';

import {useAlert} from '@/hooks/useAlert';
import {
  budgetNotificationService,
  type BudgetAlertSettings,
} from '@/services/BudgetNotificationService';
import {defaultBudgetAlertSettings} from '@/services/notifications/budgetNotificationTypes';
import {
  GroupNotificationService,
  type GroupNotificationPreferences,
} from '@/services/GroupNotificationService';
import {logger as appLogger} from '@/services/LoggerService';
import {NotificationService, type ReminderPreferences} from '@/services/NotificationService';
import {scheduleImmediateNotification} from '@/services/notifications/notificationScheduler';
import {
  getNotificationPermissions,
  requestNotificationPermissions,
  showPermissionDeniedAlert,
} from '@/utils/permissions';

export const NOTIFICATION_TIME_OPTIONS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
] as const;

export const NOTIFICATION_REMINDER_DAYS_OPTIONS = [
  {value: 1, label: '1 day before'},
  {value: 2, label: '2 days before'},
  {value: 3, label: '3 days before'},
  {value: 5, label: '5 days before'},
  {value: 7, label: '1 week before'},
] as const;

const DEFAULT_PAYMENT_PREFERENCES: ReminderPreferences = {
  subscriptionReminders: true,
  loanReminders: true,
  reminderDaysBefore: 3,
  dailyReminderTime: '09:00',
  overdueReminders: true,
  successNotifications: true,
};

const DEFAULT_GROUP_PREFERENCES: GroupNotificationPreferences = {
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

const logger = appLogger.contextLogger('UnifiedNotificationSettingsScreen');

export function useUnifiedNotificationSettingsScreen() {
  const {showAlert} = useAlert();

  const [paymentPreferences, setPaymentPreferences] = useState<ReminderPreferences>(
    DEFAULT_PAYMENT_PREFERENCES,
  );
  const [groupPreferences, setGroupPreferences] =
    useState<GroupNotificationPreferences>(DEFAULT_GROUP_PREFERENCES);
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetAlertSettings>(
    defaultBudgetAlertSettings,
  );
  const [loading, setLoading] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  const [showReminderDaysSheet, setShowReminderDaysSheet] = useState(false);
  const [showReminderTimeSheet, setShowReminderTimeSheet] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);

      const permissionStatus = await getNotificationPermissions();
      setPermissionsGranted(permissionStatus.granted);

      const [paymentPrefs, groupPrefs, budgetPrefs, count] = await Promise.all([
        NotificationService.getReminderPreferences(),
        GroupNotificationService.getPreferences(),
        budgetNotificationService.getAlertSettings(),
        NotificationService.getScheduledNotificationsCount(),
      ]);

      setPaymentPreferences(paymentPrefs);
      setGroupPreferences(groupPrefs);
      setBudgetPreferences(budgetPrefs);
      setScheduledCount(count);
    } catch (error) {
      logger.error('Error loading notification preferences', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const updateScheduledCount = useCallback(async () => {
    const newCount = await NotificationService.getScheduledNotificationsCount();
    setScheduledCount(newCount);
  }, []);

  const updatePaymentPreference = useCallback(
    async <Key extends keyof ReminderPreferences>(key: Key, value: ReminderPreferences[Key]) => {
      try {
        if (!permissionsGranted && (key === 'subscriptionReminders' || key === 'loanReminders')) {
          showPermissionDeniedAlert('notifications', showAlert);
          return;
        }

        setPaymentPreferences((current) => ({...current, [key]: value}));
        await NotificationService.updateReminderPreferences({[key]: value});

        if (
          key === 'subscriptionReminders' ||
          key === 'loanReminders' ||
          key === 'dailyReminderTime'
        ) {
          await NotificationService.scheduleAllPaymentReminders();
          await updateScheduledCount();
        }
      } catch (error) {
        logger.error('Error updating payment preference', error, {key, value});
        showAlert({
          title: 'Error',
          message: 'Failed to update preference. Please try again.',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [permissionsGranted, showAlert, updateScheduledCount],
  );

  const updateGroupPreference = useCallback(
    async <Key extends keyof GroupNotificationPreferences>(
      key: Key,
      value: GroupNotificationPreferences[Key],
    ) => {
      try {
        setGroupPreferences((current) => ({...current, [key]: value}));
        await GroupNotificationService.updatePreferences({[key]: value});
        await updateScheduledCount();
      } catch (error) {
        logger.error('Error updating group preference', error, {key, value});
        showAlert({
          title: 'Error',
          message: 'Failed to update preference. Please try again.',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [showAlert, updateScheduledCount],
  );

  const updateBudgetPreference = useCallback(
    async <Key extends keyof BudgetAlertSettings>(key: Key, value: BudgetAlertSettings[Key]) => {
      try {
        setBudgetPreferences((current) => ({...current, [key]: value}));
        await budgetNotificationService.updateAlertSettings({[key]: value});
        await updateScheduledCount();
      } catch (error) {
        logger.error('Error updating budget preference', error, {key, value});
        showAlert({
          title: 'Error',
          message: 'Failed to update budget alert preference. Please try again.',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [showAlert, updateScheduledCount],
  );

  const handleSelectTime = useCallback(() => {
    setShowReminderTimeSheet(true);
  }, []);

  const handleSelectReminderDays = useCallback(() => {
    setShowReminderDaysSheet(true);
  }, []);

  const selectReminderDaysOption = useCallback(
    async (days: number) => {
      setShowReminderDaysSheet(false);
      await updatePaymentPreference('reminderDaysBefore', days);
    },
    [updatePaymentPreference],
  );

  const selectReminderTimeOption = useCallback(
    async (time: string) => {
      setShowReminderTimeSheet(false);
      await updatePaymentPreference('dailyReminderTime', time);
    },
    [updatePaymentPreference],
  );

  const requestPermissions = useCallback(async () => {
    try {
      const result = await requestNotificationPermissions();
      setPermissionsGranted(result.granted);

      if (result.granted) {
        await NotificationService.initialize();
        await updateScheduledCount();
      } else {
        showPermissionDeniedAlert('notifications', showAlert);
      }
    } catch (error) {
      logger.error('Error requesting permissions', error);
    }
  }, [showAlert, updateScheduledCount]);

  const openSystemSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      if (!permissionsGranted) {
        showPermissionDeniedAlert('notifications', showAlert);
        return;
      }

      await scheduleImmediateNotification({
        title: 'Buddy Test Notification 🔔',
        body: 'Notifications are configured and working properly!',
        sound: true,
      });

      await updateScheduledCount();

      showAlert({
        title: 'Test Notification Sent',
        message:
          'A test notification has been triggered. You should see it in your notification tray momentarily.',
        actions: [{text: 'OK', variant: 'success', onPress: () => {}}],
      });
    } catch (error) {
      logger.error('Error sending test notification', error);
      showAlert({
        title: 'Error',
        message: 'Could not send test notification. Please ensure notifications are enabled.',
        actions: [{text: 'OK', onPress: () => {}}],
      });
    }
  }, [permissionsGranted, showAlert, updateScheduledCount]);

  const navigateToActiveNotifications = useCallback(() => {
    router.push('/active-notifications');
  }, []);

  return {
    budgetPreferences,
    groupPreferences,
    handleSelectReminderDays,
    handleSelectTime,
    loading,
    navigateToActiveNotifications,
    openSystemSettings,
    paymentPreferences,
    permissionsGranted,
    requestPermissions,
    scheduledCount,
    selectReminderDaysOption,
    selectReminderTimeOption,
    sendTestNotification,
    setShowReminderDaysSheet,
    setShowReminderTimeSheet,
    showReminderDaysSheet,
    showReminderTimeSheet,
    updateBudgetPreference,
    updateGroupPreference,
    updatePaymentPreference,
  };
}

export type UnifiedNotificationSettingsScreenModel = ReturnType<
  typeof useUnifiedNotificationSettingsScreen
>;
