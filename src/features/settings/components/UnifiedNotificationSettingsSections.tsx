import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {
  NOTIFICATION_REMINDER_DAYS_OPTIONS,
  NOTIFICATION_TIME_OPTIONS,
  type UnifiedNotificationSettingsScreenModel,
} from '../hooks/useUnifiedNotificationSettingsScreen';
import {
  NotificationActionRow,
  NotificationInfoCard,
  NotificationSectionTitle,
  NotificationSelectionRow,
  NotificationSettingRow,
} from './NotificationSettingsRows';

interface NotificationSettingsSectionsProps {
  screen: UnifiedNotificationSettingsScreenModel;
}

export function NotificationPermissionsSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <NotificationSectionTitle>Permissions</NotificationSectionTitle>
      <GlassSurface
        padding="$4"
        style={{marginBottom: 8, width: '100%'}}
        contentStyle={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
        <HStack
          width={42}
          height={42}
          borderRadius={12}
          backgroundColor={
            screen.permissionsGranted
              ? isDarkMode
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(16, 185, 129, 0.12)'
              : isDarkMode
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(245, 158, 11, 0.12)'
          }
          alignItems="center"
          justifyContent="center">
          <Ionicons
            name={screen.permissionsGranted ? 'notifications' : 'notifications-off'}
            size={22}
            color={screen.permissionsGranted ? '#10B981' : '#F59E0B'}
          />
        </HStack>

        <VStack flex={1}>
          <Text
            variant="body1"
            color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
            weight="semibold"
            marginBottom="$1">
            System Notifications
          </Text>
          <Text variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
            {screen.permissionsGranted
              ? 'Alerts, sounds, and badges enabled'
              : 'Notifications are disabled on this device'}
          </Text>
        </VStack>

        <Button
          size="small"
          variant={screen.permissionsGranted ? 'secondary' : 'primary'}
          onPress={
            screen.permissionsGranted
              ? screen.openSystemSettings
              : () => void screen.requestPermissions()
          }>
          {screen.permissionsGranted ? 'Settings' : 'Enable'}
        </Button>
      </GlassSurface>
    </VStack>
  );
}

export function PaymentRemindersSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <NotificationSectionTitle>Payment Reminders</NotificationSectionTitle>
      <Text variant="body2" color={isDarkMode ? '$gray5' : '$gray11'} marginBottom="$2">
        Get reminders for subscriptions, loans, and other payments
      </Text>
      <NotificationSettingRow
        title="Subscription Reminders"
        description="Get reminders before subscription payments are due"
        value={screen.paymentPreferences.subscriptionReminders}
        onValueChange={(value) =>
          void screen.updatePaymentPreference('subscriptionReminders', value)
        }
        icon="card"
        iconColor="#10B981"
      />
      <NotificationSettingRow
        title="Loan Reminders"
        description="Get reminders for upcoming loan payments"
        value={screen.paymentPreferences.loanReminders}
        onValueChange={(value) => void screen.updatePaymentPreference('loanReminders', value)}
        icon="cash"
        iconColor="#8B5CF6"
      />
      <NotificationSelectionRow
        title="Reminder Timing"
        value={`${screen.paymentPreferences.reminderDaysBefore} day(s) before`}
        onPress={screen.handleSelectReminderDays}
        icon="calendar"
        iconColor="#F59E0B"
      />
      <NotificationSelectionRow
        title="Daily Reminder Time"
        value={screen.paymentPreferences.dailyReminderTime}
        onPress={screen.handleSelectTime}
        icon="time"
        iconColor="#EF4444"
      />
      <NotificationSettingRow
        title="Overdue Reminders"
        description="Get reminders for overdue payments"
        value={screen.paymentPreferences.overdueReminders}
        onValueChange={(value) => void screen.updatePaymentPreference('overdueReminders', value)}
        icon="alert-circle"
        iconColor="#EF4444"
      />
      <NotificationSettingRow
        title="Success Notifications"
        description="Get notified when payments are successfully processed"
        value={screen.paymentPreferences.successNotifications}
        onValueChange={(value) =>
          void screen.updatePaymentPreference('successNotifications', value)
        }
        icon="checkmark-circle"
        iconColor="#10B981"
      />
    </VStack>
  );
}

export function BudgetAlertsSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <NotificationSectionTitle>Budget Alerts</NotificationSectionTitle>
      <Text variant="body2" color={isDarkMode ? '$gray5' : '$gray11'} marginBottom="$2">
        Stay aware of your spending with automatic budget threshold warnings
      </Text>
      <NotificationSettingRow
        title="Budget Alerts"
        description="Enable threshold and overspending notifications"
        value={screen.budgetPreferences.enabled}
        onValueChange={(value) => void screen.updateBudgetPreference('enabled', value)}
        icon="pie-chart"
        iconColor="#3B82F6"
      />
      {screen.budgetPreferences.enabled && (
        <>
          <NotificationSettingRow
            title="Threshold Warnings"
            description="Alerts at 50%, 80%, and 100% of budget"
            value={screen.budgetPreferences.thresholdAlerts.length > 0}
            onValueChange={(value) =>
              void screen.updateBudgetPreference('thresholdAlerts', value ? [50, 80, 100] : [])
            }
            icon="trending-up"
            iconColor="#F59E0B"
          />
          <NotificationSettingRow
            title="Overspending Alerts"
            description="Alert when transactions exceed budgeted amounts"
            value={screen.budgetPreferences.overspendingAlerts}
            onValueChange={(value) =>
              void screen.updateBudgetPreference('overspendingAlerts', value)
            }
            icon="warning"
            iconColor="#EF4444"
          />
          <NotificationSettingRow
            title="Category Limit Alerts"
            description="Alert when category spending surpasses its target"
            value={screen.budgetPreferences.categoryLimitAlerts}
            onValueChange={(value) =>
              void screen.updateBudgetPreference('categoryLimitAlerts', value)
            }
            icon="albums"
            iconColor="#8B5CF6"
          />
          <NotificationSettingRow
            title="Daily Summary"
            description="Receive a daily summary of budget progress"
            value={screen.budgetPreferences.dailySummary}
            onValueChange={(value) => void screen.updateBudgetPreference('dailySummary', value)}
            icon="newspaper"
            iconColor="#10B981"
          />
        </>
      )}
    </VStack>
  );
}

export function GroupNotificationsSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <NotificationSectionTitle>Group Notifications</NotificationSectionTitle>
      <Text variant="body2" color={isDarkMode ? '$gray5' : '$gray11'} marginBottom="$2">
        Get notifications about group activities and updates
      </Text>
      <NotificationSettingRow
        title="Expense Notifications"
        description="Get notified when new expenses are added to groups"
        value={screen.groupPreferences.expenseNotifications}
        onValueChange={(value) => void screen.updateGroupPreference('expenseNotifications', value)}
        icon="receipt"
        iconColor="#3B82F6"
      />
      <NotificationSettingRow
        title="Payment Reminders"
        description="Get reminders for payments you owe to group members"
        value={screen.groupPreferences.paymentReminders}
        onValueChange={(value) => void screen.updateGroupPreference('paymentReminders', value)}
        icon="wallet"
        iconColor="#10B981"
      />
      <NotificationSettingRow
        title="Settlement Suggestions"
        description="Get suggestions for optimal debt settlements"
        value={screen.groupPreferences.settlementSuggestions}
        onValueChange={(value) => void screen.updateGroupPreference('settlementSuggestions', value)}
        icon="swap-horizontal"
        iconColor="#8B5CF6"
      />
      <NotificationSettingRow
        title="Group Invites"
        description="Get notified when invited to new groups"
        value={screen.groupPreferences.groupInvites}
        onValueChange={(value) => void screen.updateGroupPreference('groupInvites', value)}
        icon="person-add"
        iconColor="#F59E0B"
      />
      <NotificationSettingRow
        title="Debt Updates"
        description="Get notified when your debt status changes"
        value={screen.groupPreferences.debtUpdates}
        onValueChange={(value) => void screen.updateGroupPreference('debtUpdates', value)}
        icon="trending-up"
        iconColor="#EF4444"
      />
    </VStack>
  );
}

export function NotificationActionsSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <VStack gap="$3">
      <NotificationSectionTitle>Tools & Testing</NotificationSectionTitle>
      <Text variant="body2" color={isDarkMode ? '$gray5' : '$gray11'} marginBottom="$2">
        Verify notification delivery and view active reminders
      </Text>
      <NotificationActionRow
        title="Send Test Notification"
        description="Trigger an immediate alert to verify banners and sounds"
        onPress={() => void screen.sendTestNotification()}
        icon="paper-plane"
        iconColor="#3B82F6"
      />
      <NotificationActionRow
        title="Active Notifications"
        description="View and manage scheduled and delivered alerts"
        badge={screen.scheduledCount > 0 ? `${screen.scheduledCount} scheduled` : undefined}
        onPress={screen.navigateToActiveNotifications}
        icon="notifications"
        iconColor="#8B5CF6"
      />
    </VStack>
  );
}

export function NotificationScheduleInfoSection({screen}: NotificationSettingsSectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <NotificationInfoCard>
      <HStack alignItems="center" gap="$3">
        <Ionicons name="information-circle" size={24} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
        <Text variant="body1" color={isDarkMode ? '$white' : '$gray900'} weight="medium">
          {screen.scheduledCount} scheduled reminder{screen.scheduledCount !== 1 ? 's' : ''}
        </Text>
      </HStack>
      <Text variant="caption" color={isDarkMode ? '$gray5' : '$gray11'} marginTop="$2">
        Scheduled notifications run locally on your device based on your chosen times and days.
      </Text>
    </NotificationInfoCard>
  );
}

export function UnifiedNotificationSettingsSheets({screen}: NotificationSettingsSectionsProps) {
  return (
    <>
      <BottomSheet
        open={screen.showReminderDaysSheet}
        onOpenChange={screen.setShowReminderDaysSheet}
        title="Select Reminder Timing"
        description="Choose how many days before payment is due"
        snapPoints={[55, 35]}
        defaultPosition={0}>
        {NOTIFICATION_REMINDER_DAYS_OPTIONS.map((option) => (
          <BottomSheetOption
            key={option.value}
            label={option.label}
            selected={screen.paymentPreferences.reminderDaysBefore === option.value}
            onPress={() => void screen.selectReminderDaysOption(option.value)}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        open={screen.showReminderTimeSheet}
        onOpenChange={screen.setShowReminderTimeSheet}
        title="Daily Reminder Time"
        description="Choose the time of day to receive notifications"
        scrollable
        snapPoints={[65, 45]}
        defaultPosition={0}>
        {NOTIFICATION_TIME_OPTIONS.map((time) => (
          <BottomSheetOption
            key={time}
            label={time}
            selected={screen.paymentPreferences.dailyReminderTime === time}
            onPress={() => void screen.selectReminderTimeOption(time)}
          />
        ))}
      </BottomSheet>
    </>
  );
}
