import React from 'react';
import {Input} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {XStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {LiveBadge} from './LiveBadge';
import type {InvestmentResearchState} from './types';

export const InvestmentResearchSearchBar = ({research}: {research: InvestmentResearchState}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <GlassBackdrop
      intensity={isDarkMode ? 40 : 80}
      tint={isDarkMode ? 'dark' : 'light'}
      style={{borderRadius: 12, overflow: 'hidden', marginBottom: 16}}>
      <XStack
        alignItems="center"
        padding="$3"
        backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'}>
        <Ionicons name="search" size={20} color="$text" style={{marginRight: 8}} />
        <Input
          accessibilityLabel="Search investments"
          chrome={false}
          flex={1}
          fontSize={16}
          color={isDarkMode ? '#fff' : '#000'}
          padding={0}
          placeholder="Search stocks, ETFs, mutual funds..."
          placeholderTextColor="$colorTransparent"
          value={research.searchQuery}
          onChangeText={research.setSearchQuery}
        />
        {research.apiKeysConfigured && <LiveBadge compact />}
      </XStack>
    </GlassBackdrop>
  );
};
