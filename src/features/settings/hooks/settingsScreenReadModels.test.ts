import {
  createSettingsCurrency,
  createSettingsLanguage,
  resolveSettingsDisplayName,
} from './settingsScreenReadModels';

describe('settingsScreenReadModels', () => {
  it('uses resolved profile information for the display name', () => {
    expect(
      resolveSettingsDisplayName(
        {
          firstName: 'Avery',
          profileDisplayName: 'Avery Stone',
          userDisplayName: 'Account Name',
          email: 'avery@example.com',
        },
        (firstName) => ({name: firstName ?? 'User'}),
      ),
    ).toBe('Avery');
  });

  it('falls back through account identity when profile resolution fails', () => {
    expect(
      resolveSettingsDisplayName(
        {
          userDisplayName: 'Account Name',
          email: 'avery@example.com',
        },
        () => {
          throw new Error('profile unavailable');
        },
      ),
    ).toBe('Account Name');
  });

  it('creates currency and language view models with package-backed currency metadata', () => {
    expect(createSettingsCurrency('USD')).toEqual({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
    });
    expect(createSettingsCurrency('ZZZ')).toEqual({
      code: 'ZZZ',
      symbol: 'ZZZ',
      name: 'ZZZ',
    });
    expect(createSettingsLanguage('en')).toEqual({
      code: 'en',
      name: 'English',
      flag: 'US',
    });
    expect(createSettingsLanguage('xx')).toEqual({
      code: 'xx',
      name: 'Language (xx)',
      flag: 'US',
    });
  });
});
