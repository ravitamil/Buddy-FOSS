import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';
import type {Href} from 'expo-router';
import {useQueryClient} from '@tanstack/react-query';

import {useAuth, useSettings, useUser} from '@/context';
import {useMembership} from '@/context/MembershipContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useGoogleAuth} from '@/hooks/useGoogleAuth';
import {useProfilePicture} from '@/hooks/useProfilePicture';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {getCurrentUserInfo, getInitials} from '@/utils/userUtils';

import {createSettingsNavigation} from './settingsScreenNavigation';
import {
  createSettingsCurrency,
  createSettingsLanguage,
  resolveSettingsDisplayName,
} from './settingsScreenReadModels';
import type {SettingsModalAction, UseSettingsScreenResult} from './settingsScreenTypes';

export type {
  SettingsCurrencyViewModel,
  SettingsLanguageViewModel,
  SettingsModalAction,
  UseSettingsScreenResult,
} from './settingsScreenTypes';

const logger = appLogger.contextLogger('SettingsScreen');
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

export function useSettingsScreen(): UseSettingsScreenResult {
  logger.debug('Component rendering started');

  const {onScroll, largeTitleStyle, headerProps} = useProgressiveBlurHeader({
    showBackButtonInNonBlur: false,
  });
  const queryClient = useQueryClient();
  const {isDarkMode, toggleTheme} = useTamaguiTheme();
  const {authState} = useGoogleAuth();
  const {profileImageUri, userId, updateProfilePicture} = useProfilePicture();
  const {user, setAccountDeletionInProgress} = useAuth();
  const {profile, refreshProfile} = useUser();
  const {isPro} = useMembership();
  const {currency, language} = useSettings();

  const isAnonymousUser = Boolean(user?.isAnonymous);
  const navigate = useCallback((path: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    router.push(path as Href);
  }, []);
  const [showAllSettings, setShowAllSettings] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalActions, setModalActions] = useState<SettingsModalAction[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    try {
      void Promise.resolve(refreshProfile());
    } catch (error) {
      logger.warn('SettingsScreen: Failed to refresh profile on mount', error);
    }
  }, [refreshProfile]);

  logger.debug('User state', {
    hasUser: Boolean(user),
    isAnonymousUser,
    userEmail: user?.email,
    userName: user?.displayName,
    isLoading: authState.isLoading,
  });

  const showModal = useCallback(
    (title: string, message: string, actions: SettingsModalAction[] = []) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalActions(actions);
      setModalVisible(true);
    },
    [],
  );
  const hideModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const computedDisplayName = useMemo(
    () =>
      resolveSettingsDisplayName(
        {
          firstName: profile?.firstName,
          profileDisplayName: profile?.displayName,
          userDisplayName: user?.displayName,
          email: user?.email,
        },
        getCurrentUserInfo,
      ),
    [profile?.displayName, profile?.firstName, user?.displayName, user?.email],
  );
  const initialsForAvatar = useMemo(
    () => getInitials(computedDisplayName.trim() || 'User'),
    [computedDisplayName],
  );
  const currentCurrency = useMemo(() => createSettingsCurrency(currency), [currency]);
  const currentLanguage = useMemo(() => createSettingsLanguage(language), [language]);
  const navigation = useMemo(() => createSettingsNavigation({navigate, isPro}), [isPro, navigate]);

  const handleProfilePress = useCallback(() => {
    if (isAnonymousUser) {
      showModal(
        'Access Restricted',
        'Guest users cannot access profile settings. Please sign in to edit your profile.',
      );
      return;
    }
    navigate('/profile-settings');
  }, [isAnonymousUser, navigate, showModal]);

  const handleThemePress = useCallback(() => {
    void toggleTheme();
  }, [toggleTheme]);

  const handleLogoutPress = useCallback(() => {
    logger.info('Sign out initiated');
    if (!user) {
      logger.warn('No authenticated user found');
      showModal('Not Signed In', 'You are not currently signed in.');
      return;
    }

    const userDisplayName = isAnonymousUser
      ? 'Guest User'
      : user.displayName || user.email || 'your account';
    showModal('Sign Out', `Are you sure you want to sign out of ${userDisplayName}?`, [
      {
        text: 'Cancel',
        onPress: () => {
          logger.debug('Sign out cancelled by user');
          hideModal();
        },
      },
      {
        text: 'Sign Out',
        variant: 'destructive',
        onPress: () => {
          void (async () => {
            logger.info('User confirmed sign out, proceeding');
            hideModal();
            setIsSigningOut(true);

            try {
              const {performCompleteSignOut} = await import('@/utils/signOutUtils');
              await performCompleteSignOut();
              router.replace('/');
            } catch (error) {
              logger.error('Sign out error', error);
              setIsSigningOut(false);
              showModal(
                'Error',
                `Failed to sign out: ${getErrorMessage(error)}. Please try again.`,
              );
            }
          })();
        },
      },
    ]);
  }, [hideModal, isAnonymousUser, showModal, user]);

  const handleDeleteAccountPress = useCallback(() => {
    logger.info('Delete account button pressed');
    if (!user) {
      showModal('Not Signed In', 'You are not currently signed in.');
      return;
    }
    if (isAnonymousUser) {
      showModal(
        'Access Restricted',
        'Guest users cannot delete account. Please sign in with a permanent account to access this feature.',
      );
      return;
    }

    setDeleteConfirmationText('');
    setDeleteModalVisible(true);
  }, [isAnonymousUser, showModal, user]);

  const handleDeleteAccountConfirm = useCallback(async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showModal('Confirmation Required', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    try {
      setDeleteModalVisible(false);
      setIsDeletingAccount(true);
      setAccountDeletionInProgress?.(true);

      const {UnifiedAuthService} = await import('@/services/UnifiedAuthService');
      await UnifiedAuthService.getInstance().deleteAccount();

      const {StorageService} = await import('@/services/storage');
      await StorageService.clearUserSessionData();

      const SecureStore = await import('@/services/SecureStore');
      await Promise.all([
        SecureStore.deleteItemAsync('google_auth_user').catch(() => undefined),
        SecureStore.deleteItemAsync('google_auth_tokens').catch(() => undefined),
      ]);

      try {
        queryClient.clear();
      } catch (error) {
        logger.warn('[SettingsScreen] Failed to clear query client cache', error);
      }

      showModal(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted. You will now be redirected to the login screen.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsDeletingAccount(false);
              setAccountDeletionInProgress?.(false);
              hideModal();
              try {
                router.dismissAll();
              } catch {
                // dismissAll is only available for stack contexts.
              }
              router.replace('/');
            },
          },
        ],
      );
    } catch (error) {
      setIsDeletingAccount(false);
      setAccountDeletionInProgress?.(false);
      logger.error('Delete account error', error);
      showModal(
        'Deletion Failed',
        `Failed to delete your account: ${getErrorMessage(error)}. Please try again.`,
        [{text: 'OK', onPress: hideModal}],
      );
    }
  }, [deleteConfirmationText, hideModal, queryClient, setAccountDeletionInProgress, showModal]);

  return {
    headerProps,
    largeTitleStyle,
    onScroll,
    isDarkMode,
    isPro,
    isAnonymousUser,
    isSigningOut,
    isDeletingAccount,
    showAllSettings,
    setShowAllSettings,
    userEmail: user?.email ?? undefined,
    userId,
    profileImageUri,
    profilePictureUri: profile?.profilePictureUri ?? null,
    computedDisplayName,
    initialsForAvatar,
    currency,
    currentCurrency,
    currentLanguage,
    modalVisible,
    modalTitle,
    modalMessage,
    modalActions,
    hideModal,
    deleteModalVisible,
    setDeleteModalVisible,
    deleteConfirmationText,
    setDeleteConfirmationText,
    updateProfilePicture,
    handleProfilePress,
    handleThemePress,
    ...navigation,
    handleLogoutPress,
    handleDeleteAccountPress,
    handleDeleteAccountConfirm,
  };
}
