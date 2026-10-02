import {IconTile, Switch, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React, {memo} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface NotificationSettingRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

interface NotificationSelectionRowProps {
  title: string;
  value: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export function NotificationSectionTitle({children}: {children: React.ReactNode}) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <Text variant="h5" color={isDarkMode ? '$white' : '$gray900'} weight="bold">
      {children}
    </Text>
  );
}

const NotificationIconTile = memo(
  ({icon, iconColor}: {icon: keyof typeof Ionicons.glyphMap; iconColor: string}) => (
    <IconTile icon={icon} color={iconColor} size={42} shape="rounded" />
  ),
);

export const NotificationSettingRow = memo(
  ({title, description, value, onValueChange, icon, iconColor}: NotificationSettingRowProps) => {
    const {isDarkMode} = useTamaguiTheme();

    return (
      <XStack width="100%" onPress={() => onValueChange(!value)} pressStyle={{opacity: 0.85}}>
        <GlassSurface
          padding="$4"
          style={{marginBottom: 12, width: '100%'}}
          contentStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}>
          <NotificationIconTile icon={icon} iconColor={iconColor} />
          <YStack flex={1}>
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold"
              marginBottom="$1">
              {title}
            </Text>
            {description ? (
              <Text
                variant="body2"
                color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
                {description}
              </Text>
            ) : null}
          </YStack>
          <Switch
            accessibilityLabel={`${title} notifications`}
            checked={value}
            onCheckedChange={onValueChange}
          />
        </GlassSurface>
      </XStack>
    );
  },
);

export const NotificationSelectionRow = memo(
  ({title, value, onPress, icon, iconColor}: NotificationSelectionRowProps) => {
    const {isDarkMode} = useTamaguiTheme();

    return (
      <XStack
        width="100%"
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        pressStyle={{opacity: 0.7}}>
        <GlassSurface
          padding="$4"
          style={{marginBottom: 12, width: '100%'}}
          contentStyle={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
          <NotificationIconTile icon={icon} iconColor={iconColor} />
          <YStack flex={1}>
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold"
              marginBottom="$1">
              {title}
            </Text>
            <Text variant="body2" color={isDarkMode ? '$blue4' : '$blue9'}>
              {value}
            </Text>
          </YStack>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
          />
        </GlassSurface>
      </XStack>
    );
  },
);

interface NotificationActionRowProps {
  title: string;
  description?: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badge?: string;
}

export const NotificationActionRow = memo(
  ({title, description, onPress, icon, iconColor, badge}: NotificationActionRowProps) => {
    const {isDarkMode} = useTamaguiTheme();

    return (
      <XStack
        width="100%"
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        pressStyle={{opacity: 0.7}}>
        <GlassSurface
          padding="$4"
          style={{marginBottom: 12, width: '100%'}}
          contentStyle={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
          <NotificationIconTile icon={icon} iconColor={iconColor} />
          <YStack flex={1}>
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold"
              marginBottom="$1">
              {title}
            </Text>
            {description ? (
              <Text
                variant="body2"
                color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
                {description}
              </Text>
            ) : null}
          </YStack>
          {badge ? (
            <XStack
              backgroundColor={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)'}
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderRadius={12}>
              <Text variant="caption" weight="bold" color={isDarkMode ? '#60a5fa' : '#2563eb'}>
                {badge}
              </Text>
            </XStack>
          ) : null}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
          />
        </GlassSurface>
      </XStack>
    );
  },
);

export function NotificationInfoCard({children}: {children: React.ReactNode}) {
  return (
    <GlassSurface padding="$4" style={{marginTop: 16}}>
      {children}
    </GlassSurface>
  );
}
