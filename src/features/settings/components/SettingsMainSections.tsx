import {Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import {useBuddyColors} from '@ravitamil/buddy-ui';
import React from 'react';
import {View, XStack, YStack, styled} from 'tamagui';
import Animated from 'react-native-reanimated';
import {router} from 'expo-router';

import {ProfilePicture, SettingsItem} from '@/components/ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {getFontFamilyForWeight} from '@/utils/fonts';
import type {UseSettingsScreenResult} from '../hooks/useSettingsScreen';
import {SettingsQuickCard} from './SettingsQuickCard';

function useSettingsAccentColors() {
  const colors = useBuddyColors();
  return {
    primary: colors.iconBrand,
    primaryDark: colors.primary,
    success: colors.success,
    successDark: colors.success,
    warning: colors.warning,
    warningDark: colors.warning,
    purple: colors.savings,
    purpleDark: colors.savings,
    neutral: colors.textSecondary,
    neutralDark: colors.textSecondary,
    cyan: colors.info,
    cyanDark: colors.info,
    pink: colors.expense,
    pinkDark: colors.expense,
  };
}

interface SettingsMainSectionsProps {
  screen: UseSettingsScreenResult;
}

const SettingsProfileIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

function SettingsAccountBadge({isPro, isAnonymous}: {isPro: boolean; isAnonymous: boolean}) {
  const label = isPro ? 'PRO' : isAnonymous ? 'GUEST' : 'FREE';
  const icon = isPro ? 'star' : 'person-outline';

  return (
    <XStack
      testID="settings-account-badge"
      alignItems="center"
      gap="$1"
      minHeight={24}
      paddingHorizontal="$2"
      alignSelf="flex-start"
      borderRadius={999}
      borderWidth={1}
      borderColor={isPro ? '$warning' : '$borderColor'}
      backgroundColor="$glassStrong">
      <SettingsProfileIcon name={icon} size={12} color={isPro ? '$warning' : '$iconSecondary'} />
      <Text
        variant="caption"
        weight="bold"
        color={isPro ? '$warning' : '$textSecondary'}
        fontSize="$1"
        letterSpacing={0.6}>
        {label}
      </Text>
    </XStack>
  );
}

export function SettingsLargeTitle({screen}: SettingsMainSectionsProps) {
  return (
    <Animated.View style={screen.largeTitleStyle}>
      <YStack>
        <Text
          fontSize={28}
          lineHeight={34}
          fontWeight="700"
          color="$text"
          marginTop={0}
          paddingLeft={2}
          fontFamily={getFontFamilyForWeight('bold')}>
          Settings
        </Text>
        <Text
          fontSize={11}
          lineHeight={14}
          fontWeight="600"
          color="$textSecondary"
          marginTop={6}
          paddingLeft={4}
          textTransform="uppercase"
          letterSpacing={0.5}
          fontFamily={getFontFamilyForWeight('semibold')}>
          CUSTOMIZE YOUR EXPERIENCE
        </Text>
      </YStack>
    </Animated.View>
  );
}

export function SettingsProfileCard({screen}: SettingsMainSectionsProps) {
  const settingsAccentColors = useSettingsAccentColors();
  const accountStatus = screen.isPro
    ? 'Buddy Pro member'
    : screen.isAnonymousUser
      ? 'Guest account'
      : 'Free plan';

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={`${screen.computedDisplayName}, ${accountStatus}. Open profile settings`}
      accessibilityHint="Opens your profile information and preferences"
      onPress={screen.handleProfilePress}
      pressStyle={{opacity: 0.7}}>
      <GlassSurface
        testID="settings-profile-card"
        washColor={screen.isPro ? settingsAccentColors.warning : settingsAccentColors.primary}
        padding={16}
        borderRadius={20}
        style={{marginTop: 12, marginBottom: 0}}>
        <XStack alignItems="center" gap="$4" minHeight={80}>
          <ProfilePicture
            size={72}
            imageUri={screen.profilePictureUri || screen.profileImageUri}
            onImageChange={screen.updateProfilePicture}
            editable={false}
            borderColor="$primary"
            borderWidth={2}
            userId={screen.userId}
            fallbackColors={['$brand6', '$brand8']}
            fallbackVariant="initials"
            initialsText={screen.initialsForAvatar}
            showStarBadge={screen.isPro}
          />

          <YStack flex={1} minWidth={0} gap="$1.5">
            <Text
              testID="settings-profile-name"
              variant="h4"
              color="$text"
              weight="bold"
              numberOfLines={2}
              lineHeight={22}>
              {screen.computedDisplayName}
            </Text>
            <Text variant="body2" color="$textSecondary" numberOfLines={1}>
              {screen.isAnonymousUser ? 'Anonymous Account' : screen.userEmail}
            </Text>
            <SettingsAccountBadge isPro={screen.isPro} isAnonymous={screen.isAnonymousUser} />
          </YStack>

          <View width={48} height={48} alignItems="center" justifyContent="center">
            <SettingsProfileIcon name="chevron-forward" size={22} color="$iconSecondary" />
          </View>
        </XStack>
      </GlassSurface>
    </View>
  );
}

export function SettingsQuickSettings({screen}: SettingsMainSectionsProps) {
  const settingsAccentColors = useSettingsAccentColors();
  return (
    <YStack gap="$4" marginTop="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="h5" color="$text" weight="bold">
          Quick Settings
        </Text>
      </XStack>
      <XStack gap="$3">
        <SettingsQuickCard
          label={screen.isDarkMode ? 'Dark' : 'Light'}
          icon={screen.isDarkMode ? 'moon' : 'sunny'}
          isThemeCard
          isDarkMode={screen.isDarkMode}
          onPress={screen.handleThemePress}
          accentColors={
            screen.isDarkMode
              ? [settingsAccentColors.primary, settingsAccentColors.primaryDark]
              : [settingsAccentColors.warning, settingsAccentColors.warningDark]
          }
        />
        <SettingsQuickCard
          label={screen.currency || 'USD'}
          symbol={screen.currentCurrency.symbol || '$'}
          isDarkMode={screen.isDarkMode}
          onPress={screen.handleCurrencyPress}
          accentColors={[settingsAccentColors.success, settingsAccentColors.successDark]}
        />
        <SettingsQuickCard
          label="Categories"
          icon="apps"
          isDarkMode={screen.isDarkMode}
          onPress={screen.handleCategoriesPress}
          accentColors={[settingsAccentColors.purple, settingsAccentColors.purpleDark]}
        />
      </XStack>
    </YStack>
  );
}

export function SettingsDetailsSection({screen}: SettingsMainSectionsProps) {
  const settingsAccentColors = useSettingsAccentColors();
  if (screen.isAnonymousUser) return null;

  return (
    <YStack gap="$4" marginTop="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="h5" color="$text" weight="bold">
          Settings
        </Text>
        <View
          accessibilityRole="button"
          onPress={() => screen.setShowAllSettings(!screen.showAllSettings)}
          pressStyle={{opacity: 0.7}}>
          <Text color={settingsAccentColors.primary} variant="body2" weight="semibold">
            {screen.showAllSettings ? 'Show Less' : 'Show More'}
          </Text>
        </View>
      </XStack>

      <YStack gap="$3">
        <SettingsItem
          surface="overview"
          icon="person"
          title="Profile Settings"
          subtitle="Edit your personal information and preferences"
          onPress={screen.navigateToProfile}
        />
        <SettingsItem
          surface="overview"
          icon="notifications"
          title="Notifications"
          subtitle="Push notifications and alerts"
          onPress={screen.handleNotificationsPress}
          gradientColors={[settingsAccentColors.purple, settingsAccentColors.purpleDark]}
        />
        <SettingsItem
          surface="overview"
          icon="shield-checkmark"
          title="Privacy & Security"
          subtitle="Data protection and security settings"
          onPress={screen.handlePrivacyPress}
          gradientColors={[settingsAccentColors.success, settingsAccentColors.successDark]}
        />
        <SettingsItem
          surface="overview"
          icon="star"
          title={screen.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
          subtitle={
            screen.isPro ? 'Manage your Buddy Pro membership' : 'Unlock unlimited groups and more'
          }
          onPress={screen.navigateToSubscription}
          gradientColors={[settingsAccentColors.warning, settingsAccentColors.warningDark]}
        />
        <SettingsItem
          surface="overview"
          icon="list"
          title="Compare Plans"
          subtitle="See what's included in each plan"
          onPress={screen.navigateToPlanComparison}
          gradientColors={[settingsAccentColors.neutral, settingsAccentColors.neutralDark]}
        />
        {screen.showAllSettings ? (
          <>
            <SettingsItem
              surface="overview"
              icon="cloud-upload"
              title="Backup & Sync"
              subtitle="Data backup and synchronization"
              onPress={screen.handleBackupPress}
              gradientColors={[settingsAccentColors.cyan, settingsAccentColors.cyanDark]}
            />
            <SettingsItem
              surface="overview"
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={screen.handleSupportPress}
              gradientColors={[settingsAccentColors.warning, settingsAccentColors.warningDark]}
            />
            <SettingsItem
              surface="overview"
              icon="play-circle"
              title="Lottie Animations"
              subtitle="Test and preview Lottie animations"
              onPress={screen.navigateToLottieTest}
              gradientColors={[settingsAccentColors.pink, settingsAccentColors.pinkDark]}
            />
            <SettingsItem
              surface="overview"
              icon="alert-circle"
              title="System & Error Screens"
              subtitle="Preview maintenance, upgrade, offline & error screens"
              onPress={() => router.push('/system-screens-gallery')}
              gradientColors={[settingsAccentColors.cyan, settingsAccentColors.cyanDark]}
            />
          </>
        ) : null}
      </YStack>
    </YStack>
  );
}
