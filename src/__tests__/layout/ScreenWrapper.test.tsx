/**
 * ScreenWrapper Component Tests
 * Tests for enhanced ScreenWrapper with standardized keyboard avoiding behavior
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import {Text} from 'react-native';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';

// Mock dependencies
jest.mock('../../services/LoggerService', () => ({
  logger: {
    component: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  }),
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock('@tamagui/scroll-view', () => ({
  ScrollView: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock('tamagui', () => ({
  YStack: ({children, ...props}: any) => <div {...props}>{children}</div>,
}));

jest.mock('../../components/ui/SafeAreaWrapper', () => ({
  SafeAreaWrapper: ({children}: any) => <div>{children}</div>,
}));

jest.mock('../../components/ui/StandardKeyboardAvoidingView', () => ({
  StandardKeyboardAvoidingView: ({children}: any) => <div>{children}</div>,
}));

jest.mock('../../components/ui/ScreenContainer', () => ({
  useIsInsideScreenContainer: () => false,
}));

describe('ScreenWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    const {getByText} = render(
      <ScreenWrapper>
        <Text>Test Content</Text>
      </ScreenWrapper>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle scrollable prop correctly', () => {
    const {getByText} = render(
      <ScreenWrapper scrollable={false}>
        <Text>Non-scrollable Content</Text>
      </ScreenWrapper>,
    );

    expect(getByText('Non-scrollable Content')).toBeTruthy();
  });

  it('should handle keyboardAvoiding prop correctly', () => {
    const {getByText} = render(
      <ScreenWrapper keyboardAvoiding={false}>
        <Text>No Keyboard Avoiding</Text>
      </ScreenWrapper>,
    );

    expect(getByText('No Keyboard Avoiding')).toBeTruthy();
  });
});
