/**
 * Internal keyboard avoiding adapter for ScreenWrapper.
 * Screens should use ScreenWrapper keyboardMode instead of importing this directly.
 */

import React from 'react';
import {currentPlatform, isIos} from '@tamagui/constants';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import type {KeyboardAvoidingViewProps} from 'react-native-keyboard-controller';
import {logger as appLogger} from '../../services/LoggerService';

type StandardKeyboardBehavior = NonNullable<KeyboardAvoidingViewProps['behavior']>;

interface StandardKeyboardAvoidingViewProps {
  children: React.ReactNode;
  behavior?: StandardKeyboardBehavior;
  keyboardVerticalOffset?: number;
  automaticOffset?: boolean;
  contentContainerStyle?: KeyboardAvoidingViewProps['contentContainerStyle'];
  enabled?: boolean;
  style?: KeyboardAvoidingViewProps['style'];
}

export const StandardKeyboardAvoidingView: React.FC<StandardKeyboardAvoidingViewProps> = ({
  children,
  behavior,
  keyboardVerticalOffset,
  automaticOffset = true,
  contentContainerStyle,
  enabled = true,
  style,
}) => {
  const defaultBehavior = behavior || (isIos ? 'padding' : 'translate-with-padding');

  // Platform-specific default offset
  const defaultOffset = keyboardVerticalOffset ?? 0;

  const logger = appLogger.component('StandardKeyboardAvoidingView');

  React.useEffect(() => {
    logger.debug('StandardKeyboardAvoidingView initialized (KeyboardController)', {
      platform: currentPlatform,
      behavior: defaultBehavior,
      offset: defaultOffset,
      automaticOffset,
      enabled,
    });
  }, [automaticOffset, defaultBehavior, defaultOffset, enabled, logger]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={[{flex: 1}, style]}
      behavior={defaultBehavior}
      keyboardVerticalOffset={defaultOffset}
      automaticOffset={automaticOffset}
      contentContainerStyle={contentContainerStyle}
      enabled={enabled}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default StandardKeyboardAvoidingView;
