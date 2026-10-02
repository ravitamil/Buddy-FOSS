import type {ComponentProps} from 'react';
import React from 'react';
import {XStack, YStack} from 'tamagui';

import {IconTile} from './IconTile';
import {GlassSurface} from './GlassSurface';
import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface QuickActionPanelItem {
  title: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
  icon: ComponentProps<typeof Ionicons>['name'];
}

export interface QuickActionPanelProps {
  actions: readonly QuickActionPanelItem[];
  itemGap?: '$2.5' | '$3';
  marginTop?: number;
  testID?: string;
}

export function QuickActionPanel({
  actions,
  itemGap = '$2.5',
  marginTop = 4,
  testID = 'quick-action-panel',
}: QuickActionPanelProps) {
  return (
    <GlassSurface testID={testID} padding={20} borderRadius={20} style={{marginTop}}>
      <XStack gap="$4" justifyContent="space-around">
        {actions.map((action, index) => (
          <YStack
            key={`quick-action-${action.title || index}`}
            flex={1}
            alignItems="center"
            gap={itemGap}
            opacity={action.disabled ? 0.5 : 1}
            onPress={action.disabled ? undefined : action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.title}
            accessibilityState={{disabled: action.disabled}}
            pressStyle={{opacity: 0.8}}>
            <IconTile
              size={60}
              iconSize={28}
              color={action.color}
              tone="soft"
              icon={<Ionicons name={action.icon} size={28} color={action.color} />}
            />
            <Text variant="caption" color="$text" weight="semibold" textAlign="center">
              {action.title}
            </Text>
          </YStack>
        ))}
      </XStack>
    </GlassSurface>
  );
}
