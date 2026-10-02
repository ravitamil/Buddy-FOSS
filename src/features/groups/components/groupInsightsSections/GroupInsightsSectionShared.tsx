import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {GroupEmptyState} from '../GroupEmptyState';
import type {GroupInsightsViewMode} from '../../hooks/useGroupInsightsScreen';

export const renderEmptyState = (
  title: string,
  description: string,
  icon: keyof typeof Ionicons.glyphMap,
) => <GroupEmptyState iconName={icon} title={title} subtitle={description} />;

export const GroupInsightsModeButton: React.FC<{
  mode: GroupInsightsViewMode;
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  isDarkMode: boolean;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}> = ({label, detail, icon, isDarkMode, selected, onPress, accessibilityLabel}) => (
  <VStack
    onPress={onPress}
    pressStyle={{opacity: 0.7}}
    flex={1}
    paddingVertical="$3"
    paddingHorizontal="$3"
    borderRadius="$3"
    backgroundColor={selected ? (isDarkMode ? '#1a4a47' : '#22a39e') : 'transparent'}
    accessibilityRole="button"
    accessibilityState={{selected}}
    accessibilityLabel={accessibilityLabel}>
    <VStack alignItems="center" gap="$1">
      <Ionicons
        name={icon}
        size={14}
        color={selected ? '#4ECDC4' : isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'}
      />
      <Text
        variant="caption"
        weight="semibold"
        textAlign="center"
        color={selected ? (isDarkMode ? '#4ECDC4' : '#fff') : '$text'}
        numberOfLines={1}>
        {label}
      </Text>
      <Text
        variant="caption"
        textAlign="center"
        color={
          selected
            ? isDarkMode
              ? 'rgba(78,205,196,0.75)'
              : 'rgba(255,255,255,0.85)'
            : '$textSecondary'
        }
        fontSize={10}>
        {detail}
      </Text>
    </VStack>
  </VStack>
);
