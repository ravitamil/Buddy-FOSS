/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */

import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import EmailLoginScreen from '../EmailLoginScreen';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockShowAlert = jest.fn();
const mockSignInWithEmail = jest.fn();

const mockEmailSignIn = {
  action: 'auth.emailSignIn',
  feature: 'emailAuth',
  kind: 'write',
  status: 'enabled',
  isAllowed: true,
  message: undefined as string | undefined,
};

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => {
      mockPush(...args);
    },
    back: () => {
      mockBack();
    },
  },
}));

jest.mock('@ravitamil/buddy-ui/icons/AppIcon', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/components/ui', () => {
  const {View, Text, TouchableOpacity} = require('react-native');
  return {
    ScreenContainer: ({children}: {children?: React.ReactNode}) => (
      <View testID="screen-container">{children}</View>
    ),
    CustomNavigationHeader: ({
      title,
      subtitle,
      onBackPress,
    }: {
      title: string;
      subtitle?: string;
      onBackPress?: () => void;
    }) => (
      <View testID="custom-header">
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
        <TouchableOpacity testID="header-back-button" onPress={onBackPress} />
      </View>
    ),
    ScreenWrapper: ({children}: {children?: React.ReactNode}) => (
      <View testID="screen-wrapper">{children}</View>
    ),
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
  }),
}));

jest.mock('@/features/featureControls/hooks', () => ({
  useFeatureAction: () => mockEmailSignIn,
}));

jest.mock('@/hooks/useAlert', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

describe('EmailLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailSignIn.status = 'enabled';
    mockEmailSignIn.isAllowed = true;
    mockEmailSignIn.message = undefined;
    mockSignInWithEmail.mockResolvedValue({verificationId: 'test-verification-id'});
  });

  it('renders the email login screen components properly', () => {
    const {getByText, getByPlaceholderText} = render(<EmailLoginScreen />);

    expect(getByText('Email Login')).toBeTruthy();
    expect(getByText('Sign in or register with email')).toBeTruthy();
    expect(getByText('Sign in with Email')).toBeTruthy();
    expect(getByText('Email Address')).toBeTruthy();
    expect(getByPlaceholderText('name@example.com')).toBeTruthy();
    expect(getByText('Send Verification Link')).toBeTruthy();
  });

  it('handles back button press via header', () => {
    const {getByTestId} = render(<EmailLoginScreen />);
    const backButton = getByTestId('header-back-button');

    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when email is empty or invalid', () => {
    const {getByText} = render(<EmailLoginScreen />);
    const submitButton = getByText('Send Verification Link');

    fireEvent.press(submitButton);
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits valid email and navigates to verification screen', async () => {
    const {getByPlaceholderText, getByText} = render(<EmailLoginScreen />);
    const input = getByPlaceholderText('name@example.com');

    fireEvent.changeText(input, 'user@example.com');

    const submitButton = getByText('Send Verification Link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/email-verification',
        params: {
          verificationId: 'test-verification-id',
          email: 'user@example.com',
        },
      });
    });
  });

  it('shows clear button when email has text and clears it on press', () => {
    const {getByPlaceholderText, getByLabelText, queryByLabelText} = render(<EmailLoginScreen />);
    const input = getByPlaceholderText('name@example.com');

    fireEvent.changeText(input, 'hello@test.com');
    const clearButton = getByLabelText('Clear email');
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);
    expect(queryByLabelText('Clear email')).toBeNull();
  });

  it('shows alert if feature action is disabled', () => {
    mockEmailSignIn.isAllowed = false;
    mockEmailSignIn.message = 'Email login temporarily disabled';

    const {getByPlaceholderText, getByText} = render(<EmailLoginScreen />);
    const input = getByPlaceholderText('name@example.com');

    fireEvent.changeText(input, 'user@example.com');

    const submitButton = getByText('Send Verification Link');
    fireEvent.press(submitButton);

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Email Login Unavailable',
        message: 'Email login temporarily disabled',
      }),
    );
  });
});
