/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {EmailAuthButton} from './EmailAuthButton';

const mockPush = jest.fn();
const mockShowAlert = jest.fn();
const mockEmailSignIn = {
  action: 'auth.emailSignIn',
  feature: 'emailAuth',
  kind: 'write',
  status: 'enabled',
  isAllowed: true,
  message: undefined,
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
  useFeatureAction: () => mockEmailSignIn,
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

describe('EmailAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailSignIn.status = 'enabled';
    mockEmailSignIn.isAllowed = true;
    mockEmailSignIn.message = undefined;
  });

  it('renders the email auth call to action', () => {
    const {getByText} = render(
      <TestWrapper>
        <EmailAuthButton />
      </TestWrapper>,
    );

    expect(getByText('Continue with Email')).toBeTruthy();
  });

  it('navigates to the email login route', () => {
    const {getByText} = render(
      <TestWrapper>
        <EmailAuthButton />
      </TestWrapper>,
    );

    fireEvent.press(getByText('Continue with Email'));

    expect(mockPush).toHaveBeenCalledWith('/email-login');
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('hides itself when email login is disabled', () => {
    mockEmailSignIn.status = 'disabled';
    mockEmailSignIn.isAllowed = false;

    const {queryByText} = render(
      <TestWrapper>
        <EmailAuthButton />
      </TestWrapper>,
    );

    expect(queryByText('Continue with Email')).toBeFalsy();
  });

  it('reports navigation failures through onError', () => {
    const onError = jest.fn();
    mockPush.mockImplementationOnce(() => {
      throw new Error('navigation failed');
    });

    const {getByText} = render(
      <TestWrapper>
        <EmailAuthButton onError={onError} />
      </TestWrapper>,
    );

    fireEvent.press(getByText('Continue with Email'));

    expect(onError).toHaveBeenCalledWith({
      code: 'email-auth-navigation-failed',
      message: 'navigation failed',
    });
  });
});
