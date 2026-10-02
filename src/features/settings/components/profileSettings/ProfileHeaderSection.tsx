import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {View, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {ProfilePicture} from '@/components/ui';

import type {ProfileSettingsSectionProps} from './profileSettingsTypes';

const HeaderBadgePressable = styled(View, {
  name: 'HeaderBadgePressable',
  accessibilityRole: 'button',
  pressStyle: {
    opacity: 0.7,
  },
});

export function ProfileHeaderSection({screen}: ProfileSettingsSectionProps) {
  return (
    <GlassSurface
      padding={20}
      borderRadius={24}
      style={{marginTop: 6, marginBottom: 0}}
      washColor={screen.isPro ? '#f59e0b18' : undefined}>
      <VStack alignItems="center" gap="$3">
        <VStack alignItems="center" gap="$2">
          <ProfilePicture
            size={96}
            imageUri={screen.profileData.profilePictureUri || screen.profileImageUri}
            onImageChange={screen.updateProfilePicture}
            editable
            userId={screen.userId}
            fallbackVariant="initials"
            initialsText={screen.initials}
            fallbackColors={['$brand6', '$brand8']}
            showStarBadge={screen.isPro}
            key={`profile-pic-${screen.isPro ? 'pro' : 'standard'}`}
          />
          <Text variant="caption" color="$textSecondary" fontSize={12} weight="medium">
            Tap avatar to change
          </Text>
        </VStack>

        <VStack alignItems="center" gap="$2" width="100%">
          <Text variant="h4" color="$text" weight="bold" textAlign="center" numberOfLines={1}>
            {screen.displayName}
          </Text>

          <ProfileIdBadge screen={screen} />
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

function ProfileIdBadge({screen}: ProfileSettingsSectionProps) {
  if (!screen.cinId) return null;

  return (
    <HeaderBadgePressable
      accessibilityRole="button"
      accessibilityLabel={`Profile ID: ${screen.cinId}. Tap anywhere on this badge to copy.`}
      onPress={() => void screen.copyProfileId()}
      hitSlop={{top: 10, bottom: 10, left: 14, right: 14}}>
      <HStack
        alignItems="center"
        gap="$1.5"
        minHeight={32}
        backgroundColor="$glassStrong"
        borderWidth={1}
        borderColor="$borderColor"
        paddingHorizontal="$3.5"
        borderRadius={999}
        pointerEvents="none">
        <Ionicons name="finger-print" size={14} color="$textSecondary" />
        <Text
          variant="caption"
          color="$textSecondary"
          weight="semibold"
          fontSize={12}
          letterSpacing={0.4}>
          ID: {screen.cinId}
        </Text>
        <Ionicons name="copy-outline" size={13} color="$textSecondary" />
      </HStack>
    </HeaderBadgePressable>
  );
}
