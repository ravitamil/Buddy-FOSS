import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import Animated from 'react-native-reanimated';
import {View, useTheme} from 'tamagui';

import {resolveThemeColor} from '@ravitamil/buddy-ui';
import {ScreenWrapper} from '@/components/ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {BackupSyncScreenModel} from '../hooks/useBackupSyncScreen';

interface BackupSyncContentProps {
  screen: BackupSyncScreenModel;
}

interface BackupSyncItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  gradientColors: [string, string];
  isLoading?: boolean;
}

function BackupSyncItem({
  icon,
  title,
  subtitle,
  onPress,
  gradientColors,
  isLoading = false,
}: BackupSyncItemProps) {
  const {isDarkMode} = useTamaguiTheme();
  const theme = useTheme();

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      pressStyle={{opacity: 0.7}}
      disabled={isLoading}>
      <GlassSurface>
        <HStack alignItems="center" gap="$4">
          <GlassBackdrop
            intensity={60}
            tint={isDarkMode ? 'dark' : 'light'}
            style={{borderRadius: 16, overflow: 'hidden'}}>
            <LinearGradient
              colors={gradientColors}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: resolveThemeColor(theme, 'glassBorder', 'rgba(255, 255, 255, 0.22)'),
              }}>
              <Ionicons
                name={isLoading ? 'sync' : icon}
                size={24}
                color="white"
                style={isLoading ? {transform: [{rotate: '45deg'}]} : {}}
              />
            </LinearGradient>
          </GlassBackdrop>

          <VStack flex={1}>
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold">
              {title}
            </Text>
            <Text variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
              {subtitle}
            </Text>
          </VStack>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
          />
        </HStack>
      </GlassSurface>
    </View>
  );
}

export function BackupSyncContent({screen}: BackupSyncContentProps) {
  return (
    <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
      <Animated.ScrollView
        style={{flex: 1, backgroundColor: 'transparent'}}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={screen.onScroll}
        contentContainerStyle={{paddingTop: 118}}>
        <VStack flex={1} padding="$4" gap="$4" paddingBottom="$8">
          <BackupSyncHeaderSection />
          <BackupSyncStatusSection screen={screen} />
          <BackupSyncOptionsSection screen={screen} />
          <BackupSyncInformationSection />
        </VStack>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}

function BackupSyncHeaderSection() {
  return (
    <VStack gap="$2" marginTop="$4">
      <Text variant="h2" color="$color" weight="bold">
        Data Management
      </Text>
      <Text variant="body1" color="$color11">
        Keep your financial data safe and synchronized across devices
      </Text>
    </VStack>
  );
}

function BackupSyncStatusSection({screen}: BackupSyncContentProps) {
  const theme = useTheme();
  const statusGradient: [string, string] = ['rgba(34, 197, 94, 0.9)', 'rgba(22, 163, 74, 0.9)'];

  return (
    <GlassSurface>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$3">
          <GlassBackdrop
            intensity={60}
            tint={screen.isDarkMode ? 'dark' : 'light'}
            style={{borderRadius: 12, overflow: 'hidden'}}>
            <LinearGradient
              colors={statusGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: resolveThemeColor(theme, 'glassBorder', 'rgba(255, 255, 255, 0.22)'),
              }}>
              <Ionicons name="shield-checkmark" size={18} color="white" />
            </LinearGradient>
          </GlassBackdrop>

          <VStack flex={1}>
            <Text
              variant="body1"
              color={screen.isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="semibold">
              Storage Mode
            </Text>
            <Text variant="body2" color="rgba(34, 197, 94, 0.9)" weight="medium">
              100% Offline & Private
            </Text>
          </VStack>
        </HStack>

        <Text
          variant="caption"
          color={screen.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}>
          Your financial data stays 100% on your device. No cloud transmission, zero tracking.
        </Text>
      </VStack>
    </GlassSurface>
  );
}

function BackupSyncOptionsSection({screen}: BackupSyncContentProps) {
  return (
    <VStack gap="$3" marginTop="$4">
      <Text variant="h4" color="$color" weight="bold">
        Backup & Restore
      </Text>

      <BackupSyncItem
        icon="cloud-upload"
        title="Export Backup (JSON)"
        subtitle="Create a portable JSON archive of your ledger"
        onPress={() => void screen.handleBackupData()}
        gradientColors={['#10b981', '#059669']}
        isLoading={screen.isLoading}
      />

      <BackupSyncItem
        icon="cloud-download"
        title="Import Backup (JSON)"
        subtitle="Restore your financial ledger from a backup file"
        onPress={() => void screen.handleRestoreData()}
        gradientColors={['#8b5cf6', '#7c3aed']}
        isLoading={screen.isLoading}
      />

      <BackupSyncItem
        icon="sync"
        title="Verify Local Storage"
        subtitle="Check local database integrity and refresh indexes"
        onPress={() => void screen.handleSyncData()}
        gradientColors={['#06b6d4', '#0891b2']}
        isLoading={screen.isLoading}
      />
    </VStack>
  );
}

function BackupSyncInformationSection() {
  const {isDarkMode} = useTamaguiTheme();
  const textColor = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  return (
    <GlassSurface style={{marginTop: 24}}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$3">
          <Ionicons
            name="information-circle"
            size={24}
            color={isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)'}
          />
          <Text
            variant="body1"
            color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
            weight="semibold">
            About Offline Storage
          </Text>
        </HStack>

        <VStack gap="$2">
          {backupSyncInformationItems.map((item) => (
            <Text key={item} variant="body2" color={textColor} lineHeight="$1">
              {'\u2022'} {item}
            </Text>
          ))}
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

const backupSyncInformationItems = [
  '100% Offline: Your financial data never leaves your device',
  'Total Ownership: Export and import complete JSON backups anytime',
  'Zero Telemetry: De-googled, privacy-first, zero tracking',
  'All Pro features unlocked in this community edition',
];
