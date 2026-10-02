/**
 * Keyboard utilities for preventing dismissal and managing keyboard behavior
 */

import React from 'react';
import {Platform, Keyboard} from 'react-native';

interface FocusableInput {
  isFocused?: () => boolean;
  focus: () => void;
  blur: () => void;
}

/**
 * Prevents keyboard dismissal by maintaining focus
 */
export const preventKeyboardDismissal = (inputRef: React.RefObject<FocusableInput | null>) => {
  if (Platform.OS === 'android') {
    // On Android, we need to be more careful about focus management
    setTimeout(() => {
      if (inputRef.current && inputRef.current.isFocused && !inputRef.current.isFocused()) {
        inputRef.current.focus();
      }
    }, 0);
  }
};

/**
 * Dismisses keyboard programmatically
 */
export const dismissKeyboard = () => {
  Keyboard.dismiss();
};

/**
 * Keyboard event listeners for managing keyboard state
 */
export const useKeyboardState = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
  };
};

/**
 * Standard keyboard avoiding view props for consistent behavior
 */
export const getKeyboardAvoidingProps = () => ({
  behavior: Platform.OS === 'ios' ? ('padding' as const) : ('height' as const),
  keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
});

/**
 * Android-specific input props to prevent keyboard dismissal
 */
export const getAndroidInputProps = () => {
  if (Platform.OS !== 'android') return {};

  return {
    underlineColorAndroid: 'transparent',
    allowFontScaling: true,
    textBreakStrategy: 'simple' as const,
    textAlignVertical: 'center' as const,
    includeFontPadding: false,
    disableFullscreenUI: true,
    importantForAutofill: 'no' as const,
    caretHidden: false,
    showSoftInputOnFocus: true,
  };
};

/**
 * Focus management utilities
 */
export const focusNextField = (nextFieldRef: React.RefObject<FocusableInput | null>) => {
  setTimeout(() => {
    if (nextFieldRef.current) {
      nextFieldRef.current.focus();
    }
  }, 100);
};

export const blurCurrentField = (currentFieldRef: React.RefObject<FocusableInput | null>) => {
  if (currentFieldRef.current) {
    currentFieldRef.current.blur();
  }
};
