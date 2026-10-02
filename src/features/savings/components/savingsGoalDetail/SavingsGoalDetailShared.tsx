import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {IoniconName} from './savingsGoalDetailTypes';

export const tokenColor = (value: unknown, fallback: string) => {
  return typeof value === 'string' ? value : fallback;
};

export const DetailSeparator = ({isDarkMode}: {isDarkMode: boolean}) => (
  <View
    style={{
      height: 1,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    }}
  />
);

export const DetailRow = ({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: IoniconName;
  iconColor?: string;
  label: string;
  value: React.ReactNode;
}) => (
  <HStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
    <HStack alignItems="center" gap="$2">
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text variant="body1" color="$textSecondary" weight="medium">
        {label}
      </Text>
    </HStack>
    {typeof value === 'string' ? (
      <Text variant="body1" color="$text" weight="bold">
        {value}
      </Text>
    ) : (
      value
    )}
  </HStack>
);
