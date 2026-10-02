import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {UseSubscriptionDetailScreenResult} from '../../hooks/useSubscriptionDetailScreen';

export const VIBRANT_GREEN = '#4ADE80';
export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface SubscriptionDetailSectionProps {
  screen: UseSubscriptionDetailScreenResult;
}

interface DetailRowProps {
  icon: IoniconName;
  label: string;
  value: React.ReactNode;
  color: string;
}

export function Separator({isDarkMode}: {isDarkMode: boolean}) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }}
    />
  );
}

export function DetailRow({icon, label, value, color}: DetailRowProps) {
  return (
    <HStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <HStack alignItems="center" gap="$2">
        <Ionicons name={icon} size={16} color={color} />
        <Text variant="body1" color="$text" weight="medium">
          {label}
        </Text>
      </HStack>
      {typeof value === 'string' ? (
        <Text variant="body1" color={color} weight="bold">
          {value}
        </Text>
      ) : (
        value
      )}
    </HStack>
  );
}
