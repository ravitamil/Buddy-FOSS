import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';

export const LiveBadge = ({compact = false}: {compact?: boolean}) => (
  <LinearGradient
    colors={['#4CAF50', '#66BB6A']}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}
    style={{
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: compact ? 8 : 0,
    }}>
    <HStack alignItems="center" gap="$1">
      {!compact && <Ionicons name="radio" size={12} color="white" />}
      <Text variant="caption" color="white" weight="semibold">
        {compact ? 'LIVE' : 'LIVE DATA'}
      </Text>
    </HStack>
  </LinearGradient>
);
