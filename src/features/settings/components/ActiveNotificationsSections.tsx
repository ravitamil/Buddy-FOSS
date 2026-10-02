import {LottieAnimationView} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React, {memo, useCallback} from 'react';
import {RefreshControl} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Swipeable} from 'react-native-gesture-handler';
import {View} from 'tamagui';
import Animated from 'react-native-reanimated';

import emptyNotificationsAnimationJson from '../../../../assets/lottie/Empty Notifications.json';

import type {
  ActiveNotificationsScreenModel,
  CombinedNotification,
} from '../hooks/useActiveNotificationsScreen';

const emptyNotificationsAnimation: unknown = emptyNotificationsAnimationJson;

interface ActiveNotificationsContentProps {
  screen: ActiveNotificationsScreenModel;
}

interface NotificationSwipeActionsProps {
  notification: CombinedNotification;
  onMarkAsRead: ActiveNotificationsScreenModel['markAsRead'];
  onDelete: ActiveNotificationsScreenModel['requestDeleteNotification'];
}

interface NotificationCardProps extends NotificationSwipeActionsProps {
  isDarkMode: boolean;
}

function formatDate(date: Date) {
  const scheduledDate = new Date(date);
  return `${scheduledDate.toLocaleDateString()} ${scheduledDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getNotificationIcon(notification: CombinedNotification): keyof typeof Ionicons.glyphMap {
  if (notification.type === 'group') return 'people';

  const normalizedTitle = notification.title.toLowerCase();
  if (normalizedTitle.includes('due')) return 'calendar';
  if (normalizedTitle.includes('overdue')) return 'warning';
  return 'notifications';
}

const NotificationSwipeActions = memo(
  ({notification, onMarkAsRead, onDelete}: NotificationSwipeActionsProps) => (
    <HStack>
      <View
        accessibilityRole="button"
        accessibilityLabel="Mark notification as read"
        onPress={() => void onMarkAsRead(notification.id, notification.type)}
        pressStyle={{opacity: 0.8}}
        backgroundColor="#4CAF50"
        justifyContent="center"
        alignItems="center"
        width={80}
        height="100%"
        borderRadius={8}
        marginRight={8}>
        <Ionicons name="checkmark" size={24} color="white" />
      </View>
      <View
        accessibilityRole="button"
        accessibilityLabel="Delete notification"
        onPress={() => onDelete(notification.id, notification.type)}
        pressStyle={{opacity: 0.8}}
        backgroundColor="#FF5252"
        justifyContent="center"
        alignItems="center"
        width={80}
        height="100%"
        borderRadius={8}>
        <Ionicons name="trash" size={24} color="white" />
      </View>
    </HStack>
  ),
);

const NotificationCard = memo(
  ({notification, isDarkMode, onMarkAsRead, onDelete}: NotificationCardProps) => {
    const renderRightActions = useCallback(
      () => (
        <NotificationSwipeActions
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ),
      [notification, onDelete, onMarkAsRead],
    );

    return (
      <Swipeable renderRightActions={renderRightActions} rightThreshold={80}>
        <GlassSurface
          padding="$4"
          borderRadius="$4"
          style={{marginBottom: 12, opacity: notification.isRead ? 0.7 : 1}}>
          <VStack>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1}>
                <HStack alignItems="center" gap="$2">
                  <Ionicons
                    name={getNotificationIcon(notification)}
                    size={18}
                    color={isDarkMode ? '#93c5fd' : '#3b82f6'}
                  />
                  <Text variant="body1" color="$text" weight="semibold" flex={1}>
                    {notification.title}
                  </Text>
                </HStack>

                <Text variant="body2" color="$textSecondary" marginTop="$2">
                  {notification.body}
                </Text>

                {notification.groupName ? (
                  <Text variant="caption" color="$textSecondary" marginTop="$2">
                    Group: {notification.groupName}
                  </Text>
                ) : null}
              </VStack>

              {!notification.isRead ? (
                <View
                  width={10}
                  height={10}
                  borderRadius={5}
                  backgroundColor="#3b82f6"
                  marginLeft={8}
                />
              ) : null}
            </HStack>

            <Text variant="caption" color="$textSecondary" marginTop="$3">
              {formatDate(notification.scheduledDate)}
            </Text>
          </VStack>
        </GlassSurface>
      </Swipeable>
    );
  },
);

function ActiveNotificationsLoading() {
  return (
    <VStack alignItems="center" justifyContent="center" flex={1} height={300}>
      <Text variant="body1" color="$textSecondary">
        Loading notifications...
      </Text>
    </VStack>
  );
}

function ActiveNotificationsEmptyState() {
  return (
    <VStack alignItems="center" justifyContent="center" flex={1} height={450} gap="$2">
      <LottieAnimationView
        source={emptyNotificationsAnimation}
        width={300}
        height={300}
        autoPlay
        loop
        backgroundColor="transparent"
      />
      <VStack alignItems="center" gap="$2" marginTop="$-6">
        <Text variant="h4" color="$text" weight="bold" textAlign="center">
          All Caught Up!
        </Text>
        <Text
          variant="body1"
          color="$textSecondary"
          textAlign="center"
          lineHeight={24}
          paddingHorizontal="$6">
          You don't have any notifications right now. Sit back and relax!
        </Text>
      </VStack>
    </VStack>
  );
}

function ActiveNotificationsList({screen}: ActiveNotificationsContentProps) {
  return (
    <VStack gap="$4">
      <HStack justifyContent="space-between" alignItems="center">
        <Text variant="body2" color="$textSecondary">
          {screen.unreadCount} unread notification{screen.unreadCount !== 1 ? 's' : ''}
        </Text>
        <View
          accessibilityRole="button"
          onPress={screen.clearAllNotifications}
          pressStyle={{opacity: 0.8}}>
          <Text variant="body2" color={screen.isDarkMode ? '$red11' : '$red10'} weight="semibold">
            Clear All
          </Text>
        </View>
      </HStack>

      <VStack gap="$3">
        {screen.notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            isDarkMode={screen.isDarkMode}
            onMarkAsRead={screen.markAsRead}
            onDelete={screen.requestDeleteNotification}
          />
        ))}
      </VStack>
    </VStack>
  );
}

function ActiveNotificationsBody({screen}: ActiveNotificationsContentProps) {
  if (screen.loading) return <ActiveNotificationsLoading />;
  if (screen.notifications.length === 0) return <ActiveNotificationsEmptyState />;
  return <ActiveNotificationsList screen={screen} />;
}

export function ActiveNotificationsContent({screen}: ActiveNotificationsContentProps) {
  return (
    <Animated.ScrollView
      style={{flex: 1, backgroundColor: 'transparent'}}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 120, paddingTop: 118}}
      onScroll={screen.onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={screen.refreshing} onRefresh={() => void screen.onRefresh()} />
      }>
      <VStack flex={1} padding="$4" gap="$4">
        <ActiveNotificationsBody screen={screen} />
      </VStack>
    </Animated.ScrollView>
  );
}
