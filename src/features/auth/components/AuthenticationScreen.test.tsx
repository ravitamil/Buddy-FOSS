/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */

import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {TamaguiProvider, Theme} from 'tamagui';
import {AuthenticationScreen} from './AuthenticationScreen';
import config from '../../../../tamagui.config';

const mockToggleTheme = jest.fn();
const mockAuthState = {
  isAuthenticated: false,
  user: null as {uid?: string; name?: string; email?: string} | null,
};

jest.unmock('tamagui');

jest.mock('expo-image', () => {
  const {View} = require('react-native');

  return {
    Image: (props: {children?: React.ReactNode}) => <View {...props} />,
  };
});

jest.mock('@/components/ui', () => {
  const {Text, View} = require('react-native');

  return {
    Text: ({children, ...props}: {children?: React.ReactNode}) => (
      <Text {...props}>{children}</Text>
    ),
    ScreenContainer: ({children}: {children?: React.ReactNode}) => <View>{children}</View>,
    GlassmorphismCard: ({children}: {children?: React.ReactNode}) => <View>{children}</View>,
    EnhancedShadowView: ({children}: {children?: React.ReactNode}) => <View>{children}</View>,
    DayNightThemeSwitch: ({
      checked,
      onCheckedChange,
      testID = 'login-theme-switch',
      accessibilityLabel,
    }: {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
      testID?: string;
      accessibilityLabel?: string;
    }) => {
      const {Pressable} = require('react-native');
      return (
        <Pressable
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          onPress={() => onCheckedChange?.(!checked)}
        />
      );
    },
  };
});

jest.mock('@ravitamil/buddy-ui/overlays', () => {
  const {Text, View} = require('react-native');

  return {
    Dialog: ({open, title, description}: {open: boolean; title: string; description: string}) =>
      open ? (
        <View>
          <Text>{title}</Text>
          <Text>{description}</Text>
        </View>
      ) : null,
  };
});

jest.mock('./GoogleSignInButton', () => ({
  GoogleSignInButton: ({
    onSignInSuccess,
    onSignInError,
  }: {
    onSignInSuccess?: (user?: {uid: string}) => void;
    onSignInError?: (error: string) => void;
  }) => {
    const {Pressable, Text} = require('react-native');

    return (
      <Pressable
        testID="google-signin-button"
        onPress={() => onSignInSuccess?.({uid: 'google-user'})}>
        <Text>Continue with Google</Text>
        <Pressable testID="google-error-button" onPress={() => onSignInError?.('Google failed')}>
          <Text>Fail Google</Text>
        </Pressable>
      </Pressable>
    );
  },
}));

jest.mock('@ravitamil/buddy-ui', () => {
  const {Pressable, Text, View} = require('react-native');

  return {
    Button: ({children, onPress, ...props}: {children?: React.ReactNode; onPress?: () => void}) => (
      <Pressable {...props} onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    ),
    GlassSurface: ({children}: {children?: React.ReactNode}) => <View>{children}</View>,
    Text: ({children, ...props}: {children?: React.ReactNode}) => (
      <Text {...props}>{children}</Text>
    ),
    useBuddyColors: () => ({
      primary: '#f6c31a',
      text: '#111827',
      textSecondary: '#6b7280',
    }),
  };
});

jest.mock('./EmailAuthButton', () => ({
  EmailAuthButton: () => {
    const {Pressable, Text} = require('react-native');

    return (
      <Pressable testID="email-auth-button">
        <Text>Continue with Email</Text>
      </Pressable>
    );
  },
}));

jest.mock('./PhoneAuthButton', () => ({
  PhoneAuthButton: ({compact}: {compact?: boolean}) => {
    const {Pressable, Text} = require('react-native');

    return (
      <Pressable testID="phone-auth-button">
        <Text>{compact ? 'Use phone instead' : 'Continue with Phone'}</Text>
      </Pressable>
    );
  },
}));

jest.mock('./AnonymousAuthButton', () => ({
  AnonymousAuthButton: ({
    onSuccess,
    disabled,
  }: {
    onSuccess?: (user?: {uid: string}) => void;
    disabled?: boolean;
  }) => {
    const {Pressable, Text} = require('react-native');

    return (
      <Pressable
        testID="anonymous-auth-button"
        disabled={disabled}
        onPress={() => onSuccess?.({uid: 'anonymous-user'})}>
        <Text>{disabled ? 'Guest access — coming soon' : 'Continue Anonymously'}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/auth/components/SuccessAnimationScreen', () => ({
  SuccessAnimationScreen: ({message}: {message: string}) => {
    const {Text} = require('react-native');

    return <Text>{message}</Text>;
  },
}));

jest.mock('@/hooks/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    authState: mockAuthState,
  }),
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock('@/services/LoggerService', () => ({
  logger: {
    contextLogger: jest.fn(() => ({
      debug: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <TamaguiProvider config={config}>
    <Theme name="light">{children}</Theme>
  </TamaguiProvider>
);

describe('AuthenticationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.user = null;
  });

  it('renders the current unauthenticated sign-in surface', () => {
    const {getByText} = render(
      <TestWrapper>
        <AuthenticationScreen />
      </TestWrapper>,
    );

    expect(getByText('Your money,')).toBeTruthy();
    expect(getByText('in sync.')).toBeTruthy();
    expect(getByText('One place for everything.\nAlways up to date.')).toBeTruthy();
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Email')).toBeTruthy();
    expect(getByText('Use phone instead')).toBeTruthy();
    expect(getByText('Guest access — coming soon')).toBeTruthy();
  });

  it('can hide alternative auth methods', () => {
    const {getByText, queryByText} = render(
      <TestWrapper>
        <AuthenticationScreen showAlternativeAuth={false} />
      </TestWrapper>,
    );

    expect(getByText('Continue with Google')).toBeTruthy();
    expect(queryByText('Continue with Email')).toBeFalsy();
    expect(queryByText('Guest access — coming soon')).toBeFalsy();
  });

  it('renders the authenticated user card', () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = {
      uid: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    };

    const {getByText} = render(
      <TestWrapper>
        <AuthenticationScreen />
      </TestWrapper>,
    );

    expect(getByText('Welcome back!')).toBeTruthy();
    expect(getByText('You are signed in as:')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
  });

  it('keeps anonymous access visible but disabled', () => {
    const {getByTestId, getByText} = render(
      <TestWrapper>
        <AuthenticationScreen />
      </TestWrapper>,
    );

    expect(getByTestId('anonymous-auth-button').props.disabled).toBe(true);
    expect(getByText('Guest access — coming soon')).toBeTruthy();
  });

  it('shows the current sign-in error modal', () => {
    const {getByTestId, getByText} = render(
      <TestWrapper>
        <AuthenticationScreen />
      </TestWrapper>,
    );

    fireEvent.press(getByTestId('google-error-button'));

    expect(getByText('Sign-In Error')).toBeTruthy();
    expect(getByText('Google failed')).toBeTruthy();
  });

  it('toggles theme when theme switch is pressed', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <AuthenticationScreen />
      </TestWrapper>,
    );

    fireEvent.press(getByTestId('login-theme-switch'));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
