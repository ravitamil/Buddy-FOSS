import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {PrivacySecurityScreenModel} from '../hooks/usePrivacySecurityScreen';
import {PrivacyGlassCard, SecuritySetting} from './PrivacySecurityCards';

interface PrivacySecuritySectionsProps {
  screen: PrivacySecurityScreenModel;
}

function SectionTitle({children}: {children: React.ReactNode}) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <Text variant="h5" color={isDarkMode ? '$white' : '$gray900'} weight="bold">
      {children}
    </Text>
  );
}

export function PrivacySettingsSection({screen}: PrivacySecuritySectionsProps) {
  return (
    <YStack gap="$3">
      <SectionTitle>Privacy</SectionTitle>
      <PrivacyGlassCard>
        <YStack gap="$4">
          <SecuritySetting
            icon="analytics"
            title="Usage Analytics"
            description="Help improve the app by sharing anonymous usage data"
            value={screen.analyticsEnabled}
            onValueChange={screen.handleAnalyticsToggle}
            iconColor="#F59E0B"
          />
          <SecuritySetting
            icon="bug"
            title="Crash Reports"
            description="Automatically send crash reports to help fix issues"
            value={screen.crashReportsEnabled}
            onValueChange={screen.handleCrashReportsToggle}
            iconColor="#EF4444"
          />
          <SecuritySetting
            icon="mail"
            title="Marketing Communications"
            description="Receive updates about new features and tips"
            value={screen.marketingEnabled}
            onValueChange={screen.handleMarketingToggle}
            iconColor="#06B6D4"
          />
          <SecuritySetting
            icon="location"
            title="Location Services"
            description="Use location for expense categorization and insights"
            value={screen.locationEnabled}
            onValueChange={screen.handleLocationToggle}
            iconColor="#84CC16"
          />
        </YStack>
      </PrivacyGlassCard>
    </YStack>
  );
}

export function DataManagementSection({screen}: PrivacySecuritySectionsProps) {
  return (
    <YStack gap="$3">
      <SectionTitle>Data Management</SectionTitle>
      <PrivacyGlassCard>
        <YStack gap="$4">
          <SecuritySetting
            icon="download"
            title="Export Data"
            description="Download your financial data in a secure format"
            onPress={screen.handleExportData}
            variant="action"
            iconColor="#10B981"
          />
          <SecuritySetting
            icon="trash"
            title="Delete All Data"
            description="Permanently remove all your financial data"
            onPress={screen.handleDeleteData}
            variant="action"
            iconColor="#EF4444"
          />
        </YStack>
      </PrivacyGlassCard>
    </YStack>
  );
}

export function PrivacyInformationSection({screen}: PrivacySecuritySectionsProps) {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <YStack gap="$3">
      <SectionTitle>Information</SectionTitle>
      <PrivacyGlassCard>
        <YStack gap="$3">
          <Text
            variant="body2"
            color={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}
            lineHeight={20}>
            Your privacy is important to us. All financial data is stored locally on your device and
            encrypted for security. We only collect anonymous usage statistics to improve the app
            experience.
          </Text>
          <YStack
            accessibilityRole="button"
            accessibilityLabel="Read our privacy policy"
            onPress={() =>
              screen.showAlert({
                title: 'Privacy Policy',
                message: 'Privacy policy details coming soon!',
              })
            }
            pressStyle={{opacity: 0.7}}>
            <Text variant="body2" color="#3B82F6" weight="semibold">
              Read our Privacy Policy
            </Text>
          </YStack>
        </YStack>
      </PrivacyGlassCard>
    </YStack>
  );
}
