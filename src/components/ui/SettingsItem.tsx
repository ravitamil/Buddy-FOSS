import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, styled} from 'tamagui';

import {GlassSurface} from '@ravitamil/buddy-ui';
import {IconTile} from '@ravitamil/buddy-ui';
import {Card, Text} from '@ravitamil/buddy-ui';

export type SettingsIconName = keyof typeof Ionicons.glyphMap;

export interface SettingsItemProps {
  icon: SettingsIconName | React.ReactElement;
  title: string;
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: 'default' | 'danger' | 'accent';
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  gradientColors?: [string, string];
  insideContainer?: boolean;
  disabled?: boolean;
  surface?: 'entry' | 'overview';
}

const SettingsItemPressable = styled(YStack, {
  name: 'SettingsItemPressable',
  padding: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
  width: '100%',
  alignSelf: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'center',
  zIndex: 1000,
  pressStyle: {
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
});

const SettingsIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

export const SettingsItem = React.memo(function SettingsItem({
  icon,
  title,
  value,
  subtitle,
  onPress,
  variant = 'default',
  showArrow = true,
  rightElement,
  gradientColors = ['$blue6', '$blue8'],
  insideContainer = false,
  disabled = false,
  surface = 'entry',
}: SettingsItemProps) {
  const titleColor = variant === 'danger' ? '$red6' : '$color';
  const supportingTextColor = '$color11';
  const iconBackgroundColor =
    variant === 'danger' ? '$red6' : variant === 'accent' ? '$brand6' : gradientColors[0];

  const content = (
    <XStack width="100%" minWidth={0} alignItems="center" gap="$4">
      <IconTile
        icon={
          React.isValidElement(icon) ? icon : <SettingsIcon name={icon} size={24} color="$white" />
        }
        color={iconBackgroundColor}
        size={52}
      />

      <YStack flex={1} minWidth={0}>
        <Text
          variant="h5"
          color={titleColor}
          weight="bold"
          marginBottom={subtitle ? '$1' : 0}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body2" color={supportingTextColor} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </YStack>

      {rightElement ??
        (value ? (
          <Text variant="body2" color={supportingTextColor} marginRight="$2">
            {value}
          </Text>
        ) : showArrow ? (
          <SettingsIcon name="chevron-forward" size={20} color="$iconSecondary" />
        ) : null)}
    </XStack>
  );

  return (
    <SettingsItemPressable
      onPress={onPress}
      disabled={disabled || !onPress}
      width={insideContainer ? '100%' : undefined}
      opacity={disabled ? 0.5 : 1}
      accessibilityRole="button">
      {insideContainer ? (
        <Card
          elevation={0}
          backgroundColor="transparent"
          borderWidth={0}
          padding="$4"
          marginBottom="$0"
          borderRadius="$4">
          {content}
        </Card>
      ) : surface === 'overview' ? (
        <GlassSurface padding={16} borderRadius={20} style={{width: '100%'}}>
          {content}
        </GlassSurface>
      ) : (
        <GlassSurface style={{width: '100%'}}>{content}</GlassSurface>
      )}
    </SettingsItemPressable>
  );
});
