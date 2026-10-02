import {IconTile, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface SectionTitleProps {
  children: React.ReactNode;
}

interface SupportOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  iconColor?: string;
  badge?: string;
}

export function HelpSupportSectionTitle({children}: SectionTitleProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <Text variant="h5" color={isDarkMode ? '$white' : '$gray900'} weight="bold">
      {children}
    </Text>
  );
}

export function HelpSupportOption({
  icon,
  title,
  description,
  onPress,
  iconColor = '#3B82F6',
  badge,
}: SupportOptionProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <XStack
      onPress={onPress}
      pressStyle={{opacity: 0.7}}
      accessibilityRole="button"
      accessibilityLabel={title}
      alignItems="center"
      gap="$4"
      minHeight={48}>
      <IconTile icon={icon} color={iconColor} badge={badge} />

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

      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
      />
    </XStack>
  );
}
