import {Button, IconTile, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, styled} from 'tamagui';

import type {UseSettingsScreenResult} from '../hooks/useSettingsScreen';

interface SettingsDangerZoneProps {
  screen: UseSettingsScreenResult;
}

interface DangerActionRowProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  textColor?: string;
  disabled: boolean;
  onPress: () => void;
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

function DangerActionRow({
  title,
  subtitle,
  icon,
  iconColor,
  textColor,
  disabled,
  onPress,
}: DangerActionRowProps) {
  return (
    <YStack
      accessibilityRole="button"
      accessibilityState={{disabled}}
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : {opacity: 0.7}}
      opacity={disabled ? 0.6 : 1}
      zIndex={100}>
      <XStack alignItems="center" gap="$4" padding="$3">
        <IconTile icon={icon} color={iconColor} size={44} iconSize={20} />
        <YStack flex={1}>
          <Text variant="h5" color={textColor ?? '$text'} weight="bold">
            {title}
          </Text>
          <Text variant="body2" color="$textSecondary">
            {subtitle}
          </Text>
        </YStack>
        <ThemedIonicon name="chevron-forward" size={20} color="$iconSecondary" />
      </XStack>
    </YStack>
  );
}

export function SettingsDangerZone({screen}: SettingsDangerZoneProps) {
  return (
    <YStack gap="$4" marginTop="$3" marginBottom="$4">
      <Text variant="h5" color="$error" weight="bold">
        Danger Zone
      </Text>
      {screen.userEmail || screen.isAnonymousUser ? (
        <GlassSurface padding="$2" washColor="$error">
          <DangerActionRow
            title="Sign Out"
            subtitle="Sign out of your account"
            icon="log-out"
            iconColor="$blue9"
            disabled={screen.isSigningOut}
            onPress={screen.handleLogoutPress}
          />
          <YStack
            height={1}
            backgroundColor="$error"
            opacity={screen.isDarkMode ? 0.36 : 0.24}
            marginHorizontal="$4"
            marginVertical="$1.5"
          />
          {!screen.isAnonymousUser ? (
            <DangerActionRow
              title="Delete Account"
              subtitle="Permanently delete your account and all data"
              icon="trash"
              iconColor="$error"
              textColor="$error"
              disabled={screen.isSigningOut}
              onPress={screen.handleDeleteAccountPress}
            />
          ) : null}
        </GlassSurface>
      ) : (
        <GlassSurface padding="$4">
          <YStack gap="$4">
            <Text variant="body1" color="$textSecondary" textAlign="center">
              You are not currently signed in. Sign in to access account settings.
            </Text>
            <Button
              backgroundColor="$buttonPrimary"
              color="$buttonPrimaryText"
              fontWeight="bold"
              onPress={screen.navigateToAuth}>
              Sign In
            </Button>
          </YStack>
        </GlassSurface>
      )}
    </YStack>
  );
}
