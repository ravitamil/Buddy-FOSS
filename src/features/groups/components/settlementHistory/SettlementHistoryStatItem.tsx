import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {StatItemProps} from './settlementHistoryTypes';

export const SettlementHistoryStatItem: React.FC<StatItemProps> = ({
  icon,
  iconColor,
  iconBackgroundColor,
  label,
  value,
  valueColor = '$color',
}) => (
  <VStack alignItems="center" gap="$1.5" flex={1}>
    <View
      width={40}
      height={40}
      borderRadius={20}
      backgroundColor={iconBackgroundColor}
      justifyContent="center"
      alignItems="center">
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text variant="body1" color={valueColor} weight="bold" textAlign="center">
      {value}
    </Text>
    <Text variant="caption" color="$textSecondary" textAlign="center">
      {label}
    </Text>
  </VStack>
);
