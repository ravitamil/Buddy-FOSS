import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {ScreenWrapper} from '@/components/ui';

import type {HelpSupportScreenModel} from '../hooks/useHelpSupportScreen';
import {
  HelpSupportLearningResourcesSection,
  HelpSupportQuickActionsSection,
} from './helpSupport/HelpSupportActionSections';
import {HelpSupportAppInformationSection} from './helpSupport/HelpSupportAppInformationSection';
import {HelpSupportFAQSection} from './helpSupport/HelpSupportFAQSection';

interface HelpSupportContentProps {
  screen: HelpSupportScreenModel;
}

export function HelpSupportContent({screen}: HelpSupportContentProps) {
  return (
    <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
      <Animated.ScrollView
        style={{flex: 1, backgroundColor: 'transparent'}}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={screen.onScroll}
        contentContainerStyle={{paddingTop: 118}}>
        <VStack flex={1} padding="$4" gap="$4" paddingBottom="$8">
          <HelpSupportQuickActionsSection screen={screen} />
          <HelpSupportLearningResourcesSection screen={screen} />
          <HelpSupportFAQSection screen={screen} />
          <HelpSupportAppInformationSection screen={screen} />
        </VStack>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
