import {DatePickerSheet} from '@ravitamil/buddy-ui/overlays';
import React from 'react';

import {ProfileFieldRow, ProfileSectionCard} from './ProfileSettingsShared';
import type {ProfileSettingsSectionProps} from './profileSettingsTypes';

export function PersonalInformationSection({screen}: ProfileSettingsSectionProps) {
  return (
    <>
      <ProfileSectionCard
        title="Personal Information"
        subtitle="Manage your name and personal details">
        <ProfileFieldRow
          icon="person"
          label="First Name"
          value={screen.profileData.firstName}
          onChangeText={(text) => screen.updateField('firstName', text)}
          placeholder="Enter your first name"
          testID="profile-first-name-input"
        />

        <ProfileFieldRow
          icon="person-outline"
          label="Last Name"
          value={screen.profileData.lastName}
          onChangeText={(text) => screen.updateField('lastName', text)}
          placeholder="Enter your last name"
          testID="profile-last-name-input"
        />

        <ProfileFieldRow
          icon="at"
          label="Display Name"
          value={screen.profileData.displayName || ''}
          onChangeText={(text) => screen.updateField('displayName', text)}
          placeholder="How others see you (optional)"
          testID="profile-display-name-input"
        />

        <ProfileFieldRow
          icon="calendar"
          label="Date of Birth"
          value={screen.formattedDateOfBirth}
          onPress={() => screen.setShowDatePicker(true)}
          showChevron
          testID="profile-dob-trigger"
        />
      </ProfileSectionCard>

      <DatePickerSheet
        open={screen.showDatePicker}
        onOpenChange={screen.setShowDatePicker}
        value={
          screen.profileData.dateOfBirth ? new Date(screen.profileData.dateOfBirth) : new Date()
        }
        title="Select Date of Birth"
        minimumDate={new Date(1900, 0, 1)}
        maximumDate={new Date()}
        onConfirm={screen.updateDateOfBirth}
      />
    </>
  );
}

export function ContactInformationSection({screen}: ProfileSettingsSectionProps) {
  return (
    <ProfileSectionCard
      title="Contact Information"
      subtitle="Used for authentication and notifications">
      <ProfileFieldRow
        icon="call"
        label="Phone Number"
        value={screen.profileData.mobileNumber || ''}
        onChangeText={(text) => screen.updateField('mobileNumber', text)}
        placeholder="Enter phone number"
        editable={screen.authMethod !== 'phone'}
        lockIcon={screen.authMethod === 'phone'}
        keyboardType="phone-pad"
        helperText={screen.authMethod === 'phone' ? 'Bound to phone login' : undefined}
        testID="profile-phone-input"
      />

      <ProfileFieldRow
        icon="mail"
        label="Email Address"
        value={screen.profileData.emailAddress || ''}
        onChangeText={(text) => screen.updateField('emailAddress', text)}
        placeholder="Enter email address"
        editable={screen.authMethod !== 'google'}
        lockIcon={screen.authMethod === 'google'}
        keyboardType="email-address"
        helperText={screen.authMethod === 'google' ? 'Managed by Google Sign-In' : undefined}
        testID="profile-email-input"
      />
    </ProfileSectionCard>
  );
}
