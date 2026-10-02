import {FormField, HStack, IconTile, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {View, YStack, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {
  EditableFieldProps,
  ProfileFieldRowProps,
  ProfileSectionCardProps,
} from './profileSettingsTypes';
import {iconColors} from './profileSettingsUtils';

export function SectionTitle({
  children,
  subtitle,
  rightElement,
}: {
  children: React.ReactNode;
  subtitle?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <VStack gap="$1" marginBottom="$1.5" paddingHorizontal="$1">
      <HStack justifyContent="space-between" alignItems="center">
        <Text variant="h5" color="$text" weight="bold">
          {children}
        </Text>
        {rightElement}
      </HStack>
      {subtitle ? (
        <Text variant="caption" color="$textSecondary" weight="medium">
          {subtitle}
        </Text>
      ) : null}
    </VStack>
  );
}

export function ProfileSectionCard({
  title,
  subtitle,
  rightElement,
  children,
}: ProfileSectionCardProps) {
  return (
    <VStack gap="$2" marginTop="$3">
      <SectionTitle subtitle={subtitle} rightElement={rightElement}>
        {title}
      </SectionTitle>
      <GlassSurface padding={16} borderRadius={20}>
        <VStack gap="$3.5">{children}</VStack>
      </GlassSurface>
    </VStack>
  );
}

export function ProfileFieldDivider() {
  return (
    <View
      height={1}
      width="100%"
      backgroundColor="$borderColor"
      opacity={0.3}
      marginVertical="$0.5"
    />
  );
}

const RowPressable = styled(View, {
  name: 'ProfileRowPressable',
  accessibilityRole: 'button',
  width: '100%',
  pressStyle: {
    opacity: 0.7,
  },
});

export function ProfileFieldRow({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  lockIcon = false,
  keyboardType = 'default',
  onPress,
  showChevron = false,
  testID,
  helperText,
}: ProfileFieldRowProps) {
  const primaryColor = iconColors[icon] ?? '#3b82f6';

  const iconElement = (
    <IconTile icon={icon} color={primaryColor} size={32} iconSize={16} tone="soft" />
  );

  const rightElement = lockIcon ? (
    <Ionicons name="lock-closed" size={16} color="$iconSecondary" />
  ) : showChevron ? (
    <Ionicons name="calendar-outline" size={18} color="$iconSecondary" />
  ) : undefined;

  if (onPress || !editable) {
    return (
      <RowPressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityLabel={`${label}: ${value || 'Not set'}`}
        testID={testID}>
        <YStack pointerEvents="none" width="100%">
          <FormField
            label={label}
            value={value || placeholder || 'Select date'}
            editable={false}
            opacity={1}
            color="$text"
            leftIcon={iconElement}
            rightIcon={rightElement}
            helpText={helperText}
            labelTextProps={{
              fontSize: '$2',
              fontWeight: '600',
              color: '$textSecondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          />
        </YStack>
      </RowPressable>
    );
  }

  return (
    <FormField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable}
      opacity={1}
      color="$text"
      leftIcon={iconElement}
      rightIcon={rightElement}
      testID={testID ?? `profile-${label.toLowerCase().replace(/\s+/g, '-')}`}
      helpText={helperText}
      autoCapitalize="none"
      labelTextProps={{
        fontSize: '$2',
        fontWeight: '600',
        color: '$textSecondary',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    />
  );
}

export function EditableField(props: EditableFieldProps) {
  return <ProfileFieldRow {...props} />;
}
