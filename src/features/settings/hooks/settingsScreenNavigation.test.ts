import {createSettingsNavigation} from './settingsScreenNavigation';

describe('settingsScreenNavigation', () => {
  it('creates settings routes and sends pro users to customer center', () => {
    const navigate = jest.fn();
    const actions = createSettingsNavigation({navigate, isPro: true});

    actions.handleCurrencyPress();
    actions.handleCategoriesPress();
    actions.handleNotificationsPress();
    actions.handlePrivacyPress();
    actions.handleBackupPress();
    actions.handleSupportPress();
    actions.navigateToProfile();
    actions.navigateToSubscription();
    actions.navigateToPlanComparison();
    actions.navigateToLottieTest();
    actions.navigateToAuth();

    expect(navigate.mock.calls).toEqual([
      ['/currency-selection'],
      ['/manage-categories'],
      ['/unified-notification-settings'],
      ['/privacy-security'],
      ['/backup-sync'],
      ['/help-support'],
      ['/profile-settings'],
      ['/customer-center'],
      ['/plan-comparison'],
      ['/lottie-test'],
      ['/auth'],
    ]);
  });

  it('sends free users to the paywall', () => {
    const navigate = jest.fn();

    createSettingsNavigation({navigate, isPro: false}).navigateToSubscription();

    expect(navigate).toHaveBeenCalledWith('/paywall');
  });
});
