import {Button, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {XStack, YStack} from 'tamagui';

import type {SavingsGoalIoniconName} from './types';

export const SectionHeader = ({
  color,
  description,
  icon,
  title,
}: {
  color: string;
  description: string;
  icon: string;
  title: string;
}) => (
  <>
    <XStack alignItems="center" gap="$2">
      <Ionicons name={icon as SavingsGoalIoniconName} size={24} color={color} />
      <Text variant="h5" color={color} weight="bold">
        {title}
      </Text>
    </XStack>
    <Text variant="body2" color="$color11">
      {description}
    </Text>
  </>
);

export const FieldLabel = ({children}: {children: React.ReactNode}) => (
  <Text variant="body1" color="$color" fontWeight="600">
    {children}
  </Text>
);

export const FieldError = ({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) => (
  <YStack gap="$2">
    <FieldLabel>{label}</FieldLabel>
    {children}
    {error ? (
      <Text color="$red10" fontSize="$2" marginTop="$1">
        {error}
      </Text>
    ) : null}
  </YStack>
);

export const PickerButton = ({
  borderColor,
  children,
  isDarkMode,
  onPress,
}: {
  borderColor?: string;
  children: React.ReactNode;
  isDarkMode: boolean;
  onPress: () => void;
}) => (
  <Button
    onPress={onPress}
    backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
    borderColor={borderColor ?? (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')}
    borderWidth={1}
    borderRadius="$3"
    justifyContent="flex-start"
    paddingHorizontal="$3"
    height="$4">
    {children}
  </Button>
);

export const SheetButton = ({
  active,
  activeColor,
  children,
  isDarkMode,
  onPress,
}: {
  active: boolean;
  activeColor: string;
  children: React.ReactNode;
  isDarkMode: boolean;
  onPress: () => void;
}) => (
  <Button
    onPress={onPress}
    backgroundColor={
      active ? `${activeColor}20` : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
    }
    borderColor={active ? activeColor : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
    borderWidth={1}
    borderRadius="$3"
    justifyContent="flex-start"
    paddingHorizontal="$3"
    height="$4">
    {children}
  </Button>
);
