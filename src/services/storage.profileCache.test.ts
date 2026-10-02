import {StorageService} from './storage';
import type {CachedProfile} from './storage/storageTypes';

describe('StorageService profile cache', () => {
  it('stores and retrieves cached profile by UID', async () => {
    const profile = {
      id: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      dateOfBirth: null,
    } as CachedProfile;

    await StorageService.setCachedProfile('user-1', profile);
    const retrieved = await StorageService.getCachedProfile('user-1');

    expect(retrieved).toEqual(profile);
  });
});
