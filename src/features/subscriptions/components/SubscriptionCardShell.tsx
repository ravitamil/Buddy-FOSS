import {GlassSurface, HStack, IconTile, Text, VStack, resolveThemeColor} from '@ravitamil/buddy-ui';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, useTheme} from 'tamagui';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SubscriptionCardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  isDarkMode: boolean;
  accentColor?: string;
  icon?: IoniconName;
  enableWebBackdrop?: boolean;
}

export const SubscriptionCardShell = React.memo(function SubscriptionCardShell({
  children,
  title,
  subtitle,
  style,
  onPress,
  accentColor,
  icon,
}: SubscriptionCardShellProps) {
  const theme = useTheme();
  const accent =
    accentColor && accentColor !== '#000000' && accentColor.toLowerCase() !== '#1f2937'
      ? accentColor
      : resolveThemeColor(theme, 'primary', '#f59e0b');

  return (
    <View
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      pressStyle={onPress ? {opacity: 0.9} : undefined}
      style={[{marginBottom: 14}, style]}>
      <GlassSurface padding={18} borderRadius={20}>
        <VStack gap="$3.5">
          {title ? (
            <HStack alignItems="center" gap="$2.5">
              {icon ? (
                <IconTile
                  icon={icon}
                  color={accent}
                  tone="soft"
                  size={36}
                  iconSize={18}
                  shape="rounded"
                />
              ) : null}
              <VStack flex={1}>
                <Text variant="h5" color="$text" weight="bold">
                  {title}
                </Text>
                {subtitle ? (
                  <Text variant="caption" color="$textSecondary">
                    {subtitle}
                  </Text>
                ) : null}
              </VStack>
            </HStack>
          ) : null}
          {children}
        </VStack>
      </GlassSurface>
    </View>
  );
});
