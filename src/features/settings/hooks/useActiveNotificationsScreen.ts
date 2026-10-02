import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {
  GroupNotificationService,
  type GroupNotificationData,
} from '@/services/GroupNotificationService';
import {NotificationService, type NotificationData} from '@/services/NotificationService';

const GROUP_NOTIFICATION_DATA_KEY = '@group_notifications_data';
const PAYMENT_NOTIFICATION_DATA_KEY = '@BuddyApp:notificationData';

export interface CombinedNotification {
  id: string;
  type: 'group' | 'payment';
  title: string;
  body: string;
  scheduledDate: Date;
  isRead: boolean;
  sourceId?: string;
  sourceType?: string;
  groupId?: string;
  groupName?: string;
}

const logger = appLogger.contextLogger('ActiveNotificationsScreen');

function toGroupNotification(notification: GroupNotificationData): CombinedNotification {
  return {
    id: notification.id,
    type: 'group',
    title: notification.title,
    body: notification.body,
    scheduledDate: notification.scheduledDate,
    isRead: notification.isRead,
    groupId: notification.groupId,
    groupName: notification.groupName,
  };
}

function toPaymentNotification(notification: NotificationData): CombinedNotification {
  return {
    id: notification.id,
    type: 'payment',
    title: notification.title,
    body: notification.body,
    scheduledDate: notification.scheduledDate,
    isRead: false,
    sourceId: notification.sourceId,
    sourceType: notification.sourceType,
  };
}

function sortNotifications(notifications: CombinedNotification[]): CombinedNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  );
}

export function useActiveNotificationsScreen() {
  const {isDarkMode} = useTamaguiTheme();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();

  const [notifications, setNotifications] = useState<CombinedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const [groupNotifications, paymentNotifications] = await Promise.all([
        GroupNotificationService.getAllNotificationData(),
        NotificationService.getAllNotificationData(),
      ]);

      const combined = sortNotifications([
        ...groupNotifications.map(toGroupNotification),
        ...paymentNotifications.map(toPaymentNotification),
      ]);

      setNotifications(combined);
      setUnreadCount(combined.filter((notification) => !notification.isRead).length);
    } catch (error) {
      logger.error('Error loading notifications:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to load notifications',
        actions: [{text: 'OK', onPress: () => {}}],
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (id: string, type: CombinedNotification['type']) => {
      try {
        if (type === 'group') {
          await GroupNotificationService.markAsRead(id);
        }

        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === id ? {...notification, isRead: true} : notification,
          ),
        );
        setUnreadCount((previous) => Math.max(0, previous - 1));
      } catch (error) {
        logger.error('Error marking notification as read:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to mark notification as read',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [showAlert],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadGroupNotifications = notifications
        .filter((notification) => notification.type === 'group' && !notification.isRead)
        .map((notification) => notification.id);

      await Promise.all(
        unreadGroupNotifications.map((notificationId) =>
          GroupNotificationService.markAsRead(notificationId),
        ),
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.type === 'group' ? {...notification, isRead: true} : notification,
        ),
      );
      setUnreadCount(0);

      showAlert({
        title: 'Success',
        message: 'All notifications marked as read',
        actions: [{text: 'OK', variant: 'success', onPress: () => {}}],
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to mark all notifications as read',
        actions: [{text: 'OK', onPress: () => {}}],
      });
    }
  }, [notifications, showAlert]);

  const deleteNotification = useCallback(
    async (id: string, type: CombinedNotification['type']) => {
      try {
        if (type === 'group') {
          const groupNotifications = await GroupNotificationService.getAllNotificationData();
          const updated = groupNotifications.filter((notification) => notification.id !== id);
          await AsyncStorage.setItem(GROUP_NOTIFICATION_DATA_KEY, JSON.stringify(updated));
        } else {
          const paymentNotifications = await NotificationService.getAllNotificationData();
          const updated = paymentNotifications.filter((notification) => notification.id !== id);
          await AsyncStorage.setItem(PAYMENT_NOTIFICATION_DATA_KEY, JSON.stringify(updated));
        }

        setNotifications((previous) => previous.filter((notification) => notification.id !== id));

        const deletedNotification = notifications.find((notification) => notification.id === id);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((previous) => Math.max(0, previous - 1));
        }
      } catch (error) {
        logger.error('Error deleting notification:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to delete notification',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [notifications, showAlert],
  );

  const requestDeleteNotification = useCallback(
    (id: string, type: CombinedNotification['type']) => {
      showAlert({
        title: 'Delete Notification',
        message: 'Are you sure you want to delete this notification? This action cannot be undone.',
        actions: [
          {text: 'Cancel', onPress: () => {}},
          {
            text: 'Delete',
            variant: 'destructive',
            onPress: () => void deleteNotification(id, type),
          },
        ],
      });
    },
    [deleteNotification, showAlert],
  );

  const clearAllNotifications = useCallback(() => {
    if (notifications.length === 0) return;

    showAlert({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
      actions: [
        {text: 'Cancel', onPress: () => {}},
        {
          text: 'Clear All',
          variant: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await Promise.all([
                  AsyncStorage.setItem(GROUP_NOTIFICATION_DATA_KEY, JSON.stringify([])),
                  AsyncStorage.setItem(PAYMENT_NOTIFICATION_DATA_KEY, JSON.stringify([])),
                ]);

                setNotifications([]);
                setUnreadCount(0);

                showAlert({
                  title: 'Success',
                  message: 'All notifications cleared',
                  actions: [{text: 'OK', variant: 'success', onPress: () => {}}],
                });
              } catch (error) {
                logger.error('Error clearing all notifications:', error);
                showAlert({
                  title: 'Error',
                  message: 'Failed to clear all notifications',
                  actions: [{text: 'OK', onPress: () => {}}],
                });
              }
            })();
          },
        },
      ],
    });
  }, [notifications.length, showAlert]);

  return {
    headerProps,
    isDarkMode,
    loading,
    markAllAsRead,
    markAsRead,
    navigateBack: () => router.back(),
    notifications,
    onRefresh,
    onScroll,
    refreshing,
    requestDeleteNotification,
    clearAllNotifications,
    unreadCount,
  };
}

export type ActiveNotificationsScreenModel = ReturnType<typeof useActiveNotificationsScreen>;
