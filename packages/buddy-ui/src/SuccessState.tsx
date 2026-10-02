import React from 'react';
import {YStack} from 'tamagui';

import {LoadingIndicator} from './LoadingIndicator';
import {Text} from './Text';

export interface SuccessStateProps {
  title: string;
  description?: string;
  visual?: React.ReactNode;
  pendingLabel?: string;
  testID?: string;
}

export function SuccessState({
  title,
  description,
  visual,
  pendingLabel,
  testID,
}: SuccessStateProps) {
  return (
    <YStack
      testID={testID}
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      gap="$5"
      accessibilityRole="summary">
      <YStack alignItems="center" justifyContent="center">
        {visual}
      </YStack>
      <YStack gap="$2" alignItems="center">
        <Text variant="h2" color="$text" weight="bold" textAlign="center">
          {title}
        </Text>
        {description ? (
          <Text color="$textSecondary" textAlign="center">
            {description}
          </Text>
        ) : null}
      </YStack>
      {pendingLabel ? <LoadingIndicator label={pendingLabel} /> : null}
    </YStack>
  );
}
