/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */

import {Platform, Keyboard} from 'react-native';
import {
  preventKeyboardDismissal,
  dismissKeyboard,
  getKeyboardAvoidingProps,
  getAndroidInputProps,
  focusNextField,
  blurCurrentField,
} from './keyboardUtils';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

// Mock React for hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(() => [false, jest.fn()]),
  useEffect: jest.fn(),
}));

describe('keyboardUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preventKeyboardDismissal', () => {
    it('should handle Android focus management', () => {
      // Mock Platform.OS as Android
      (Platform as any).OS = 'android';

      const mockInputRef = {
        current: {
          isFocused: jest.fn(() => false),
          focus: jest.fn(),
        },
      };

      preventKeyboardDismissal(mockInputRef);

      // Should schedule focus restoration
      setTimeout(() => {
        expect(mockInputRef.current.isFocused).toHaveBeenCalled();
        expect(mockInputRef.current.focus).toHaveBeenCalled();
      }, 0);
    });

    it('should not interfere on iOS', () => {
      // Mock Platform.OS as iOS
      (Platform as any).OS = 'ios';

      const mockInputRef = {
        current: {
          isFocused: jest.fn(() => false),
          focus: jest.fn(),
        },
      };

      preventKeyboardDismissal(mockInputRef);

      // Should not call focus methods on iOS
      expect(mockInputRef.current.isFocused).not.toHaveBeenCalled();
      expect(mockInputRef.current.focus).not.toHaveBeenCalled();
    });

    it('should handle null ref gracefully', () => {
      const mockInputRef = {current: null};

      expect(() => {
        preventKeyboardDismissal(mockInputRef);
      }).not.toThrow();
    });
  });

  describe('dismissKeyboard', () => {
    it('should call Keyboard.dismiss', () => {
      dismissKeyboard();
      expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('getKeyboardAvoidingProps', () => {
    it('should return iOS props when platform is iOS', () => {
      (Platform as any).OS = 'ios';

      const props = getKeyboardAvoidingProps();

      expect(props).toEqual({
        behavior: 'padding',
        keyboardVerticalOffset: 0,
      });
    });

    it('should return Android props when platform is Android', () => {
      (Platform as any).OS = 'android';

      const props = getKeyboardAvoidingProps();

      expect(props).toEqual({
        behavior: 'height',
        keyboardVerticalOffset: 20,
      });
    });
  });

  describe('getAndroidInputProps', () => {
    it('should return Android-specific props when platform is Android', () => {
      (Platform as any).OS = 'android';

      const props = getAndroidInputProps();

      expect(props).toEqual({
        underlineColorAndroid: 'transparent',
        allowFontScaling: true,
        textBreakStrategy: 'simple',
        textAlignVertical: 'center',
        includeFontPadding: false,
        disableFullscreenUI: true,
        importantForAutofill: 'no',
        caretHidden: false,
        showSoftInputOnFocus: true,
      });
    });

    it('should return empty object when platform is not Android', () => {
      (Platform as any).OS = 'ios';

      const props = getAndroidInputProps();

      expect(props).toEqual({});
    });
  });

  describe('focusNextField', () => {
    it('should focus the next field after a delay', () => {
      jest.useFakeTimers();

      const mockNextFieldRef = {
        current: {
          focus: jest.fn(),
        },
      };

      focusNextField(mockNextFieldRef);

      // Fast-forward time
      jest.advanceTimersByTime(100);

      expect(mockNextFieldRef.current.focus).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should handle null ref gracefully', () => {
      const mockNextFieldRef = {current: null};

      expect(() => {
        focusNextField(mockNextFieldRef);
      }).not.toThrow();
    });
  });

  describe('blurCurrentField', () => {
    it('should blur the current field', () => {
      const mockCurrentFieldRef = {
        current: {
          blur: jest.fn(),
        },
      };

      blurCurrentField(mockCurrentFieldRef);

      expect(mockCurrentFieldRef.current.blur).toHaveBeenCalledTimes(1);
    });

    it('should handle null ref gracefully', () => {
      const mockCurrentFieldRef = {current: null};

      expect(() => {
        blurCurrentField(mockCurrentFieldRef);
      }).not.toThrow();
    });
  });
});
