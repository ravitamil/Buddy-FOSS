import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack} from 'tamagui';

export const DeleteRetirementPlanButton = ({
  isDarkMode,
  onPress,
}: {
  isDarkMode: boolean;
  onPress: () => void;
}) => (
  <XStack
    accessibilityRole="button"
    onPress={onPress}
    pressStyle={{opacity: 0.8}}
    marginTop="$4"
    padding="$4"
    borderRadius="$3"
    backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}
    borderWidth={1}
    borderColor={isDarkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}
    justifyContent="center"
    alignItems="center"
    gap="$2">
    <Ionicons name="trash" size={20} color={isDarkMode ? '#ef4444' : '#dc2626'} />
    <Text variant="body1" color={isDarkMode ? '#ef4444' : '#dc2626'} weight="semibold">
      Delete Retirement Plan
    </Text>
  </XStack>
);
