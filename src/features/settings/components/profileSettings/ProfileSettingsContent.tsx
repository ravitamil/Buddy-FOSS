import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {ScreenWrapper} from '@/components/ui';

import {ProfileHeaderSection} from './ProfileHeaderSection';
import {ContactInformationSection, PersonalInformationSection} from './ProfileInfoSections';
import {AccountSecuritySection, LinkAccountSection} from './ProfileSecuritySections';
import type {ProfileSettingsSectionProps} from './profileSettingsTypes';

export function ProfileSettingsContent({screen}: ProfileSettingsSectionProps) {
  return (
    <ScreenWrapper
      edges={[]}
      backgroundColor="transparent"
      padding={false}
      keyboardMode="aware-scroll"
      onScroll={screen.onScroll}
      scrollViewStyle={{flex: 1, backgroundColor: 'transparent'}}
      contentContainerStyle={{paddingTop: 98}}>
      <VStack flex={1} padding="$4" gap="$3.5" paddingBottom={130}>
        <ProfileHeaderSection screen={screen} />
        <PersonalInformationSection screen={screen} />
        <ContactInformationSection screen={screen} />
        <AccountSecuritySection screen={screen} />
        <LinkAccountSection screen={screen} />
      </VStack>
    </ScreenWrapper>
  );
}
