import {Button, Text} from '@ravitamil/buddy-ui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {BottomSheet} from '@ravitamil/buddy-ui/overlays';
import React from 'react';
import {XStack, YStack} from 'tamagui';

import type {UseSettingsScreenResult} from '../hooks/useSettingsScreen';

interface SettingsDeleteAccountSheetProps {
  screen: UseSettingsScreenResult;
}

const DELETION_ITEMS = [
  {
    icon: 'receipt-outline' as const,
    title: 'Transactions & Budgets',
    subtitle: 'All expense records, recurring entries & limits',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Savings & Investments',
    subtitle: 'Goals, portfolio tracking & asset history',
  },
  {
    icon: 'people-outline' as const,
    title: 'Shared Groups & Splits',
    subtitle: 'Group expenses, balances & settlement history',
  },
  {
    icon: 'person-circle-outline' as const,
    title: 'Profile & Account Data',
    subtitle: 'Personal details, linked accounts & preferences',
  },
];

export function SettingsDeleteAccountSheet({screen}: SettingsDeleteAccountSheetProps) {
  const isConfirmed = screen.deleteConfirmationText === 'DELETE';

  return (
    <BottomSheet
      open={screen.deleteModalVisible}
      onOpenChange={screen.setDeleteModalVisible}
      snapPoints={[78]}
      defaultPosition={0}
      zIndex={100000}
      moveOnKeyboardChange
      scrollable
      title="Delete Account"
      description="This action is permanent and cannot be undone"
      footer={
        <YStack gap="$2.5">
          <Button
            variant="danger"
            size="large"
            disabled={!isConfirmed}
            onPress={() => {
              void screen.handleDeleteAccountConfirm();
            }}>
            Delete Account Permanently
          </Button>
          <Button
            variant="outline"
            size="large"
            onPress={() => screen.setDeleteModalVisible(false)}>
            Cancel
          </Button>
        </YStack>
      }>
      <YStack gap="$3.5" paddingHorizontal="$1" paddingTop="$1">
        <YStack
          backgroundColor={
            screen.isDarkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)'
          }
          borderRadius="$4"
          borderWidth={1}
          borderColor={screen.isDarkMode ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)'}
          padding="$3.5"
          gap="$2.5"
          width="100%">
          <XStack alignItems="center" gap="$2">
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
            <Text variant="body2" weight="bold" color="$error">
              Data to be permanently erased
            </Text>
          </XStack>

          <YStack gap="$2" paddingTop="$1">
            {DELETION_ITEMS.map((item) => (
              <XStack key={item.title} alignItems="center" gap="$2.5">
                <YStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={
                    screen.isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)'
                  }>
                  <Ionicons name={item.icon} size={15} color="#EF4444" />
                </YStack>
                <YStack flex={1}>
                  <Text variant="caption" weight="semibold" color="$color">
                    {item.title}
                  </Text>
                  <Text variant="caption" color="$textSecondary" fontSize={11}>
                    {item.subtitle}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </YStack>

        <YStack gap="$2" width="100%" marginTop="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" color="$textSecondary" weight="medium">
              To confirm, type{' '}
              <Text variant="caption" weight="bold" color="$color">
                DELETE
              </Text>{' '}
              below:
            </Text>
            {isConfirmed ? (
              <XStack alignItems="center" gap="$1">
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text variant="caption" color="#10B981" weight="bold">
                  Verified
                </Text>
              </XStack>
            ) : null}
          </XStack>
          <FormField
            value={screen.deleteConfirmationText}
            onChangeText={screen.setDeleteConfirmationText}
            placeholder="Type DELETE"
            autoCapitalize="characters"
            autoCorrect={false}
            testID="delete-confirmation"
            autoComplete="off"
            returnKeyType="done"
            error={
              screen.deleteConfirmationText.length > 0 && !isConfirmed
                ? 'Must type exactly "DELETE"'
                : undefined
            }
          />
        </YStack>
      </YStack>
    </BottomSheet>
  );
}
