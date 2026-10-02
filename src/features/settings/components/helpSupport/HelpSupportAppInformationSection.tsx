import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Platform} from 'react-native';
import {YStack} from 'tamagui';

import type {HelpSupportScreenModel} from '../../hooks/useHelpSupportScreen';
import {getPlatformLabel} from './helpSupportPresentation';
import {HelpSupportSectionTitle} from './HelpSupportShared';

interface HelpSupportAppInformationSectionProps {
  screen: HelpSupportScreenModel;
}

interface InfoRowProps {
  label: string;
  value: string;
  isDarkMode: boolean;
}

function InfoRow({label, value, isDarkMode}: InfoRowProps) {
  return (
    <HStack justifyContent="space-between">
      <Text variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}>
        {label}
      </Text>
      <Text
        variant="body2"
        color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
        weight="semibold">
        {value}
      </Text>
    </HStack>
  );
}

export function HelpSupportAppInformationSection({screen}: HelpSupportAppInformationSectionProps) {
  return (
    <VStack gap="$3">
      <HelpSupportSectionTitle>App Information</HelpSupportSectionTitle>
      <GlassSurface>
        <YStack gap="$3">
          <InfoRow label="App Version" value="1.0.0" isDarkMode={screen.isDarkMode} />
          <InfoRow
            label="Platform"
            value={getPlatformLabel(Platform.OS)}
            isDarkMode={screen.isDarkMode}
          />
          <InfoRow
            label="Last Updated"
            value={new Date().toLocaleDateString()}
            isDarkMode={screen.isDarkMode}
          />
        </YStack>
      </GlassSurface>
    </VStack>
  );
}
