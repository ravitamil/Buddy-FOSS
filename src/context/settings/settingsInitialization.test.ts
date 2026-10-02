import AsyncStorage from '@react-native-async-storage/async-storage';

import {StorageService} from '@/services/storage';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {SETTINGS_STORAGE_KEYS} from './settingsContextTypes';
import {loadInitialSettings} from './settingsInitialization';

jest.mock('@/services/storage', () => ({
  StorageService: {
    getPreferences: jest.fn(),
    savePreference: jest.fn(),
  },
}));

jest.mock('@/services/UserProfileDatabaseService', () => ({
  userProfileDatabaseService: {
    getUserProfile: jest.fn(),
  },
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockStorageService = jest.mocked(StorageService);
const mockUserProfileDatabaseService = jest.mocked(userProfileDatabaseService);

describe('settingsInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockStorageService.getPreferences.mockResolvedValue({});
    mockUserProfileDatabaseService.getUserProfile.mockResolvedValue({
      currency: 'INR',
      group_currency: 'INR',
      dateOfBirth: null,
    });
  });

  it('uses the active session profile currency before applying the USD default', async () => {
    const settings = await loadInitialSettings();

    expect(mockUserProfileDatabaseService.getUserProfile.mock.calls).toHaveLength(1);
    expect(settings.currency).toBe('INR');
    expect(settings.groupCurrency).toBe('INR');
  });

  it('keeps a stored currency without requesting the session profile', async () => {
    mockGetItem.mockImplementation((key) =>
      Promise.resolve(key === SETTINGS_STORAGE_KEYS.CURRENCY ? 'EUR' : null),
    );

    const settings = await loadInitialSettings();

    expect(mockUserProfileDatabaseService.getUserProfile.mock.calls).toHaveLength(0);
    expect(settings.currency).toBe('EUR');
  });
});
