import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {Text} from '@ravitamil/buddy-ui';
import {TamaguiProvider, Theme} from 'tamagui';

import {useAuth} from '@/context/AuthContext';
import {useUser} from '@/context/UserContext';
import {AuthGuard} from './AuthGuard';
import config from '../../../../tamagui.config';

const mockReplace = jest.fn();
const refreshProfile = jest.fn(() => Promise.resolve());

jest.unmock('tamagui');

jest.mock('expo-router', () => ({
  useRouter: () => ({replace: mockReplace}),
}));

jest.mock('@/context/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('@/context/UserContext', () => ({useUser: jest.fn()}));
jest.mock('@ravitamil/buddy-ui', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Pressable, Text: NativeText} =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Button: ({children, onPress}: {children?: React.ReactNode; onPress?: () => void}) =>
      ReactModule.createElement(
        Pressable,
        {accessibilityRole: 'button', onPress},
        ReactModule.createElement(NativeText, null, children),
      ),
    Text: ({children}: {children?: React.ReactNode}) =>
      ReactModule.createElement(NativeText, null, children),
  };
});
jest.mock('@/features/startup/components/StartupShell', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text: NativeText} = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    StartupShell: ({message}: {message: string}) =>
      ReactModule.createElement(NativeText, null, message),
  };
});
jest.mock('./AuthenticationScreen', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text: NativeText} = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    AuthenticationScreen: () => ReactModule.createElement(NativeText, null, 'Authentication'),
  };
});
jest.mock('@/services/StartupTelemetry', () => ({markStartupPhase: jest.fn()}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <TamaguiProvider config={config} defaultTheme="light">
    <Theme name="light">{children}</Theme>
  </TamaguiProvider>
);

const user = {
  uid: 'user-1',
  email: 'buddy@example.com',
  phoneNumber: null,
  displayName: 'Buddy User',
  photoURL: null,
  isAnonymous: false,
  emailVerified: true,
  authProvider: 'email',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  lastSignInAt: new Date('2026-01-01T00:00:00.000Z'),
};

const completedProfile = {
  id: user.uid,
  firstName: 'Buddy',
  lastName: 'User',
  displayName: 'Buddy User',
  dateOfBirth: null,
  profilePictureUri: null,
  mobileNumber: null,
  emailAddress: user.email,
  authMethod: null,
  isOnboardingComplete: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const setAuth = (overrides: Record<string, unknown> = {}) => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isInitialized: true,
    isLoading: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAuth>);
};

const setProfile = (overrides: Record<string, unknown> = {}) => {
  mockUseUser.mockReturnValue({
    profile: null,
    isLoading: false,
    error: null,
    refreshProfile,
    updateProfile: jest.fn(),
    ...overrides,
  });
};

describe('AuthGuard startup states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuth();
    setProfile();
  });

  it('renders a visible shell while local auth is unresolved', () => {
    setAuth({isInitialized: false, isLoading: true});

    const screen = render(
      <AuthGuard>
        <Text>Protected</Text>
      </AuthGuard>,
      {wrapper: TestWrapper},
    );

    expect(screen.getByText('Restoring your session…')).toBeTruthy();
  });

  it('renders authentication after a signed-out local session resolves', () => {
    const screen = render(
      <AuthGuard>
        <Text>Protected</Text>
      </AuthGuard>,
      {wrapper: TestWrapper},
    );

    expect(screen.getByText('Authentication')).toBeTruthy();
  });

  it('shows recovery instead of onboarding when profile loading fails without cache', () => {
    setAuth({user, isAuthenticated: true});
    setProfile({error: 'Network unavailable'});

    const screen = render(
      <AuthGuard>
        <Text>Protected</Text>
      </AuthGuard>,
      {wrapper: TestWrapper},
    );

    expect(screen.getByText("We couldn't load your profile")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders protected content immediately from a completed cached profile', () => {
    setAuth({user, isAuthenticated: true});
    setProfile({profile: completedProfile});

    const screen = render(
      <AuthGuard>
        <Text>Protected</Text>
      </AuthGuard>,
      {wrapper: TestWrapper},
    );

    expect(JSON.stringify(screen.toJSON())).toContain('Protected');
  });

  it('routes an explicitly incomplete profile to onboarding', async () => {
    setAuth({user, isAuthenticated: true});
    setProfile({profile: {...completedProfile, isOnboardingComplete: false}});

    render(
      <AuthGuard>
        <Text>Protected</Text>
      </AuthGuard>,
      {wrapper: TestWrapper},
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/create-profile'));
  });
});
