import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {IoniconName} from './debtPayoffTypes';

export function SectionTitle({
  icon,
  title,
  color,
}: {
  icon: IoniconName;
  title: string;
  color: string;
}) {
  return (
    <HStack alignItems="center" gap="$2">
      <Ionicons name={icon} size={24} color={color} />
      <Text variant="h5" color="$text" weight="bold">
        {title}
      </Text>
    </HStack>
  );
}

export function SummaryRow({
  label,
  value,
  valueColor = '$text',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <HStack justifyContent="space-between">
      <Text variant="body1" color="$textSecondary">
        {label}
      </Text>
      <Text variant="body1" color={valueColor} weight="semibold">
        {value}
      </Text>
    </HStack>
  );
}
