/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {PhoneAuthButton} from './PhoneAuthButton';

const mockPush = jest.fn();
const mockShowAlert = jest.fn();
const mockPhoneSignIn: {
  action: string;
  feature: string;
  kind: string;
  status: string;
  isAllowed: boolean;
  message?: string;
} = {
  action: 'auth.phoneSignIn',
  feature: 'phoneAuth',
  kind: 'write',
  status: 'disabled',
  isAllowed: false,
  message: 'Phone login is unavailable. Use Email, Google, or Anonymous login.',
};

jest.mock('@/components/ui', () => {
  const {Text} = require('react-native');

  return {
    Text,
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/features/featureControls', () => ({
  useFeatureAction: () => mockPhoneSignIn,
}));

jest.mock('@tamagui/constants', () => ({
  isWeb: false,
}));

jest.mock('@/hooks/useAlert', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock('@/services/LoggerService', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const TestWrapper = ({children}: {children: React.ReactNode}) => <>{children}</>;

describe('PhoneAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPhoneSignIn.status = 'disabled';
    mockPhoneSignIn.isAllowed = false;
    mockPhoneSignIn.message = 'Phone login is unavailable. Use Email, Google, or Anonymous login.';
  });

  it('hides itself when phone login is disabled', () => {
    const {queryByText} = render(
      <TestWrapper>
        <PhoneAuthButton />
      </TestWrapper>,
    );

    expect(queryByText('Continue with Phone')).toBeFalsy();
  });

  it('navigates to the phone input route when explicitly enabled', () => {
    mockPhoneSignIn.status = 'enabled';
    mockPhoneSignIn.isAllowed = true;
    mockPhoneSignIn.message = undefined;

    const {getByText} = render(
      <TestWrapper>
        <PhoneAuthButton />
      </TestWrapper>,
    );

    fireEvent.press(getByText('Continue with Phone'));

    expect(mockPush).toHaveBeenCalledWith('/phone-input');
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('shows an alert instead of navigating during maintenance', () => {
    mockPhoneSignIn.status = 'maintenance';
    mockPhoneSignIn.isAllowed = false;
    mockPhoneSignIn.message = 'Phone login is under maintenance.';

    const {getByText} = render(
      <TestWrapper>
        <PhoneAuthButton />
      </TestWrapper>,
    );

    fireEvent.press(getByText('Continue with Phone'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Phone Authentication Unavailable',
        message: 'Phone login is under maintenance.',
      }),
    );
  });
});
