import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {AddEditSubscriptionCard} from '../AddEditSubscriptionCard';
import {mutedIconColor, SelectField, ToggleRow} from './AddEditSubscriptionControls';
import type {AddEditSubscriptionSectionsProps} from './addEditSubscriptionSectionsTypes';

export function SmartSettingsSection({screen, isDarkMode}: AddEditSubscriptionSectionsProps) {
  return (
    <AddEditSubscriptionCard
      title="Smart Settings"
      subtitle="Configure automatic features"
      isDarkMode={isDarkMode}
      accentColor="#3b82f6"
      icon="settings">
      <VStack gap="$4">
        <ToggleRow
          icon="card"
          iconColor={screen.formData.autoPayEnabled ? '#10B981' : mutedIconColor(isDarkMode)}
          title="Auto-Pay"
          subtitle="Automatically track payments when due"
          enabled={screen.formData.autoPayEnabled}
          onPress={() => screen.updateForm({autoPayEnabled: !screen.formData.autoPayEnabled})}
        />

        <ToggleRow
          icon="notifications"
          iconColor={screen.formData.reminderEnabled ? '#3B82F6' : mutedIconColor(isDarkMode)}
          title="Reminders"
          subtitle="Get notified before payment is due"
          enabled={screen.formData.reminderEnabled}
          onPress={() => screen.updateForm({reminderEnabled: !screen.formData.reminderEnabled})}
        />

        {screen.formData.reminderEnabled && (
          <VStack gap="$2">
            <Text variant="body2" color="$textSecondary" weight="medium">
              Remind me before payment due date
            </Text>
            <SelectField
              isDarkMode={isDarkMode}
              onPress={() => screen.setShowReminderDaysDropdown(true)}
              label={`${screen.formData.reminderDaysBefore} day${
                screen.formData.reminderDaysBefore !== 1 ? 's' : ''
              } before`}
              compact
            />
          </VStack>
        )}
      </VStack>
    </AddEditSubscriptionCard>
  );
}
