import type {OnboardingProfileData} from '../types';

import {getOnboardingStepErrors} from './onboardingStepValidation';

const createProfile = (overrides: Partial<OnboardingProfileData> = {}): OnboardingProfileData => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  displayName: 'Ada',
  dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
  currencyPreference: 'USD',
  ...overrides,
});

describe('getOnboardingStepErrors', () => {
  it('requires all identity fields on the first step', () => {
    expect(
      getOnboardingStepErrors(
        0,
        createProfile({firstName: ' ', lastName: '', displayName: '  '}),
        new Date('2026-06-21T00:00:00.000Z'),
      ),
    ).toEqual({
      firstName: 'First name is required',
      lastName: 'Last name is required',
      displayName: 'Display name is required',
    });
  });

  it('rejects users younger than eighteen on the date-of-birth step', () => {
    expect(
      getOnboardingStepErrors(
        1,
        createProfile({dateOfBirth: new Date('2008-06-22T00:00:00.000Z')}),
        new Date('2026-06-21T00:00:00.000Z'),
      ),
    ).toEqual({dateOfBirth: 'You must be at least 18 years old'});
  });

  it('requires a currency on the final step', () => {
    expect(
      getOnboardingStepErrors(
        2,
        createProfile({currencyPreference: ''}),
        new Date('2026-06-21T00:00:00.000Z'),
      ),
    ).toEqual({currencyPreference: 'Currency preference is required'});
  });
});
