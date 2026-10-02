import type {UseSettingsScreenResult} from './settingsScreenTypes';

type SettingsNavigation = Pick<
  UseSettingsScreenResult,
  | 'handleCurrencyPress'
  | 'handleCategoriesPress'
  | 'handleNotificationsPress'
  | 'handlePrivacyPress'
  | 'handleBackupPress'
  | 'handleSupportPress'
  | 'navigateToProfile'
  | 'navigateToSubscription'
  | 'navigateToPlanComparison'
  | 'navigateToLottieTest'
  | 'navigateToAuth'
>;

interface CreateSettingsNavigationParams {
  navigate: (path: string) => void;
  isPro: boolean;
}

export const createSettingsNavigation = ({
  navigate,
  isPro,
}: CreateSettingsNavigationParams): SettingsNavigation => ({
  handleCurrencyPress: () => navigate('/currency-selection'),
  handleCategoriesPress: () => navigate('/manage-categories'),
  handleNotificationsPress: () => navigate('/unified-notification-settings'),
  handlePrivacyPress: () => navigate('/privacy-security'),
  handleBackupPress: () => navigate('/backup-sync'),
  handleSupportPress: () => navigate('/help-support'),
  navigateToProfile: () => navigate('/profile-settings'),
  navigateToSubscription: () => navigate(isPro ? '/customer-center' : '/paywall'),
  navigateToPlanComparison: () => navigate('/plan-comparison'),
  navigateToLottieTest: () => navigate('/lottie-test'),
  navigateToAuth: () => navigate('/auth'),
});
