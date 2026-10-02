import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {IoniconName} from './debtPayoffTypes';

const STATUS_CONFIG = {
  synced: {icon: 'cloud-done-outline' as IoniconName, color: '#4CAF50', text: 'Synced'},
  pending: {icon: 'cloud-upload-outline' as IoniconName, color: '#FF9800', text: 'Sync pending'},
  error: {icon: 'cloud-offline-outline' as IoniconName, color: '#F44336', text: 'Sync error'},
};

export function DebtPayoffSyncStatus({status}: {status: keyof typeof STATUS_CONFIG}) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <HStack alignItems="center" gap="$2">
      <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
      <Text variant="caption" color={statusConfig.color}>
        {statusConfig.text}
      </Text>
    </HStack>
  );
}
