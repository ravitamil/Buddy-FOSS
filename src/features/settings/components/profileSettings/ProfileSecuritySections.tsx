import {Button, HStack, IconTile, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {XStack} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {ProfileSectionCard, SectionTitle} from './ProfileSettingsShared';
import type {ProfileSettingsSectionProps} from './profileSettingsTypes';

const getAuthMethodLabel = (authMethod: ProfileSettingsSectionProps['screen']['authMethod']) => {
  if (authMethod === 'phone') return 'Phone Verification';
  if (authMethod === 'email') return 'Email & Password';
  if (authMethod === 'google') return 'Google Sign-In';
  return 'Guest Session';
};

const getAuthMethodIcon = (authMethod: ProfileSettingsSectionProps['screen']['authMethod']) => {
  if (authMethod === 'phone') return 'call';
  if (authMethod === 'email') return 'mail';
  if (authMethod === 'google') return 'logo-google';
  return 'shield-checkmark';
};

export function AccountSecuritySection({screen}: ProfileSettingsSectionProps) {
  return (
    <ProfileSectionCard
      title="Security & Authentication"
      subtitle="How your identity and session are verified">
      <XStack
        backgroundColor="$glassStrong"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={14}
        minHeight={52}
        paddingHorizontal="$3.5"
        paddingVertical="$2.5"
        alignItems="center"
        gap="$3">
        <IconTile
          icon={getAuthMethodIcon(screen.authMethod)}
          color="#10b981"
          size={34}
          iconSize={18}
          tone="soft"
        />
        <VStack flex={1} minWidth={0} gap="$0.5">
          <Text
            variant="caption"
            color="$textSecondary"
            weight="semibold"
            textTransform="uppercase"
            letterSpacing={0.5}
            fontSize={11}>
            Sign-in Method
          </Text>
          <Text variant="body1" color="$text" weight="semibold" fontSize={15}>
            {getAuthMethodLabel(screen.authMethod)}
          </Text>
        </VStack>

        <HStack alignItems="center" gap="$1.5" paddingRight="$1">
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text variant="caption" color="$textSecondary" weight="medium" fontSize={12}>
            Active
          </Text>
        </HStack>
      </XStack>
    </ProfileSectionCard>
  );
}

export function LinkAccountSection({screen}: ProfileSettingsSectionProps) {
  if (!screen.isAnonymous) return null;

  return (
    <VStack gap="$2" marginTop="$3">
      <SectionTitle subtitle="Protect your data across devices">Permanent Account</SectionTitle>
      <GlassSurface padding={18} borderRadius={20}>
        <VStack gap="$3.5">
          <HStack alignItems="center" gap="$3">
            <IconTile icon="link" color="#3B82F6" size={42} iconSize={22} tone="soft" />
            <VStack flex={1} minWidth={0}>
              <Text variant="body1" color="$text" weight="bold">
                Save Your Data Permanently
              </Text>
              <Text variant="body2" color="$textSecondary" fontSize={12}>
                Link your guest session to Google so you never lose your transactions or groups.
              </Text>
            </VStack>
          </HStack>

          <Button
            onPress={() => void screen.handleLinkGoogle()}
            variant="primary"
            loading={screen.isLoading}
            loadingLabel="Linking account..."
            disabled={screen.isLoading}
            leftIcon={<Ionicons name="logo-google" size={18} color="white" />}>
            Link Google Account
          </Button>
        </VStack>
      </GlassSurface>
    </VStack>
  );
}
