import type {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

export interface SettingsModalAction {
  text: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'success';
}

export interface SettingsCurrencyViewModel {
  code: string;
  symbol: string;
  name: string;
}

export interface SettingsLanguageViewModel {
  code: string;
  name: string;
  flag: string;
}

export interface UseSettingsScreenResult {
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  largeTitleStyle: ReturnType<typeof useProgressiveBlurHeader>['largeTitleStyle'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isDarkMode: boolean;
  isPro: boolean;
  isAnonymousUser: boolean;
  isSigningOut: boolean;
  isDeletingAccount: boolean;
  showAllSettings: boolean;
  setShowAllSettings: (show: boolean) => void;
  userEmail?: string;
  userId?: string;
  profileImageUri?: string | null;
  profilePictureUri?: string | null;
  computedDisplayName: string;
  initialsForAvatar: string;
  currency: string;
  currentCurrency: SettingsCurrencyViewModel;
  currentLanguage: SettingsLanguageViewModel;
  modalVisible: boolean;
  modalTitle: string;
  modalMessage: string;
  modalActions: SettingsModalAction[];
  hideModal: () => void;
  deleteModalVisible: boolean;
  setDeleteModalVisible: (visible: boolean) => void;
  deleteConfirmationText: string;
  setDeleteConfirmationText: (text: string) => void;
  updateProfilePicture: (uri: string | null) => void;
  handleProfilePress: () => void;
  handleThemePress: () => void;
  handleCurrencyPress: () => void;
  handleCategoriesPress: () => void;
  handleNotificationsPress: () => void;
  handlePrivacyPress: () => void;
  handleBackupPress: () => void;
  handleSupportPress: () => void;
  handleLogoutPress: () => void;
  handleDeleteAccountPress: () => void;
  handleDeleteAccountConfirm: () => Promise<void>;
  navigateToProfile: () => void;
  navigateToSubscription: () => void;
  navigateToPlanComparison: () => void;
  navigateToLottieTest: () => void;
  navigateToAuth: () => void;
}
