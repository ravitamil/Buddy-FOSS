import React from 'react';
import {XStack, styled} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface ToastBannerProps {
  message: string;
  tone?: 'success' | 'warning' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

const toneIcons = {
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
  info: 'information-circle',
} as const;

export function ToastBanner({
  message,
  tone = 'info',
  actionLabel,
  onAction,
  testID,
}: ToastBannerProps) {
  return (
    <ToastFrame testID={testID} toastTone={tone} accessibilityRole="alert">
      <Ionicons name={toneIcons[tone]} size={20} color="$semanticOnColor" />
      <Text flex={1} color="$semanticOnColor" weight="semibold">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Text color="$semanticOnColor" weight="bold" onPress={onAction} accessibilityRole="button">
          {actionLabel}
        </Text>
      ) : null}
    </ToastFrame>
  );
}

const ToastFrame = styled(XStack, {
  name: 'BuddyToastBanner',
  minHeight: 48,
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  variants: {
    toastTone: {
      success: {backgroundColor: '$success'},
      warning: {backgroundColor: '$warning'},
      error: {backgroundColor: '$error'},
      info: {backgroundColor: '$info'},
    },
  } as const,
});
