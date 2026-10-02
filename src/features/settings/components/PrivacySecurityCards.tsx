import {IconTile, Switch, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {GlassSurface, type GlassSurfaceProps} from '@ravitamil/buddy-ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface PrivacyGlassCardProps {
  children: React.ReactNode;
  style?: GlassSurfaceProps['style'];
}

export function PrivacyGlassCard({children, style}: PrivacyGlassCardProps) {
  return <GlassSurface style={style}>{children}</GlassSurface>;
}

export interface SecuritySettingProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  variant?: 'toggle' | 'action';
  iconColor?: string;
}

export function SecuritySetting({
  icon,
  title,
  description,
  value,
  onValueChange,
  onPress,
  variant = 'toggle',
  iconColor = '#3B82F6',
}: SecuritySettingProps) {
  const {isDarkMode} = useTamaguiTheme();

  const content = (
    <XStack alignItems="center" gap="$4">
      <IconTile icon={icon} color={iconColor} />

      <YStack flex={1}>
        <Text
          variant="body1"
          color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
          weight="semibold"
          marginBottom="$1">
          {title}
        </Text>
        <Text variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
          {description}
        </Text>
      </YStack>

      {variant === 'toggle' && onValueChange ? (
        <Switch
          accessibilityLabel={title}
          checked={value ?? false}
          onCheckedChange={onValueChange}
        />
      ) : null}

      {variant === 'action' ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
        />
      ) : null}
    </XStack>
  );

  if (variant === 'action' && onPress) {
    return (
      <YStack
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        pressStyle={{opacity: 0.7}}>
        {content}
      </YStack>
    );
  }

  return content;
}
