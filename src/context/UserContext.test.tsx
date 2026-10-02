import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react-native';

import {StorageService} from '@/services/storage';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {useAuth} from './AuthContext';
import {UserProvider, useUser} from './UserContext';

jest.mock('./AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('@/services/storage', () => ({
  StorageService: {
    getCachedProfile: jest.fn(),
    setCachedProfile: jest.fn(),
  },
}));
jest.mock('@/services/UserProfileDatabaseService', () => ({
  userProfileDatabaseService: {
    getUserProfile: jest.fn(),
    saveUserProfile: jest.fn(),
  },
}));
jest.mock('@/services/StartupTelemetry', () => ({markStartupPhase: jest.fn()}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockStorageService = jest.mocked(StorageService);
const mockUserProfileDatabaseService = jest.mocked(userProfileDatabaseService);

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

describe('UserProvider profile loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAuth>);
    mockStorageService.getCachedProfile.mockResolvedValue(null);
    mockUserProfileDatabaseService.getUserProfile.mockResolvedValue({
      email: user.email,
      displayName: user.displayName,
      firstName: 'Buddy',
      lastName: 'User',
      dateOfBirth: null,
      isOnboardingComplete: true,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    });
  });

  it('keeps a successful remote profile when local caching fails', async () => {
    mockStorageService.setCachedProfile.mockRejectedValue(new Error('SecureStore unavailable'));
    const queryClient = new QueryClient({
      defaultOptions: {queries: {retry: false}},
    });
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={queryClient}>
        <UserProvider>{children}</UserProvider>
      </QueryClientProvider>
    );

    const {result} = renderHook(() => useUser(), {wrapper});

    await waitFor(() => expect(result.current.profile?.displayName).toBe('Buddy User'));
    expect(result.current.error).toBeNull();
    expect(mockStorageService.setCachedProfile).toHaveBeenCalledTimes(1);
  });
});
