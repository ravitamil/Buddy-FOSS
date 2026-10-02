import {useCallback, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth} from '@/context';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import {StorageService} from '@/services/storage';
import {UnifiedAuthService} from '@/services/UnifiedAuthService';

const PRIVACY_SETTING_KEYS = {
  biometricEnabled: '@BuddyApp:biometricEnabled',
  autoLockEnabled: '@BuddyApp:autoLockEnabled',
  dataEncryption: '@BuddyApp:dataEncryption',
  analyticsEnabled: '@BuddyApp:analyticsEnabled',
  crashReportsEnabled: '@BuddyApp:crashReportsEnabled',
  marketingEnabled: '@BuddyApp:marketingEnabled',
  locationEnabled: '@BuddyApp:locationEnabled',
  autoLockTimeout: '@BuddyApp:autoLockTimeout',
} as const;

export const AUTO_LOCK_TIMEOUT_OPTIONS = [
  {label: 'Immediately', value: '0'},
  {label: '1 minute', value: '1'},
  {label: '5 minutes', value: '5'},
  {label: '15 minutes', value: '15'},
  {label: '30 minutes', value: '30'},
  {label: 'Never', value: 'never'},
] as const;

function parseStoredBoolean(value: string): boolean | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === 'boolean' ? parsed : null;
  } catch (error) {
    appLogger.warn('Invalid stored privacy setting:', error);
    return null;
  }
}

async function saveSetting(key: string, value: boolean | string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    appLogger.error('Error saving setting:', error);
  }
}

export function usePrivacySecurityScreen() {
  const {signOut} = useAuth();
  const {showAlert} = useAlert();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5');
  const [showTimeoutSheet, setShowTimeoutSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPrivacySettings = useCallback(async () => {
    try {
      const settings = await AsyncStorage.multiGet(Object.values(PRIVACY_SETTING_KEYS));

      settings.forEach(([key, value]) => {
        if (value === null) return;

        if (key === PRIVACY_SETTING_KEYS.autoLockTimeout) {
          setAutoLockTimeout(value);
          return;
        }

        const parsed = parseStoredBoolean(value);
        if (parsed === null) return;

        switch (key) {
          case PRIVACY_SETTING_KEYS.biometricEnabled:
            setBiometricEnabled(parsed);
            break;
          case PRIVACY_SETTING_KEYS.autoLockEnabled:
            setAutoLockEnabled(parsed);
            break;
          case PRIVACY_SETTING_KEYS.dataEncryption:
            setDataEncryption(parsed);
            break;
          case PRIVACY_SETTING_KEYS.analyticsEnabled:
            setAnalyticsEnabled(parsed);
            break;
          case PRIVACY_SETTING_KEYS.crashReportsEnabled:
            setCrashReportsEnabled(parsed);
            break;
          case PRIVACY_SETTING_KEYS.marketingEnabled:
            setMarketingEnabled(parsed);
            break;
          case PRIVACY_SETTING_KEYS.locationEnabled:
            setLocationEnabled(parsed);
            break;
          default:
            break;
        }
      });
    } catch (error) {
      appLogger.error('Error loading privacy settings:', error);
    }
  }, []);

  useEffect(() => {
    void loadPrivacySettings();
  }, [loadPrivacySettings]);

  const handleBiometricToggle = useCallback(
    (value: boolean) => {
      setBiometricEnabled(value);
      void saveSetting(PRIVACY_SETTING_KEYS.biometricEnabled, value);
      if (value) {
        showAlert({
          title: 'Biometric Authentication',
          message: 'Biometric authentication will be enabled on your next app launch.',
          actions: [{text: 'OK', onPress: () => {}}],
        });
      }
    },
    [showAlert],
  );

  const handleAutoLockToggle = useCallback((value: boolean) => {
    setAutoLockEnabled(value);
    void saveSetting(PRIVACY_SETTING_KEYS.autoLockEnabled, value);
  }, []);

  const handleDataEncryptionToggle = useCallback(
    (value: boolean) => {
      if (!value) {
        showAlert({
          title: 'Disable Data Encryption?',
          message: 'This will make your financial data less secure. Are you sure?',
          actions: [
            {text: 'Cancel', onPress: () => {}},
            {
              text: 'Disable',
              onPress: () => {
                setDataEncryption(value);
                void saveSetting(PRIVACY_SETTING_KEYS.dataEncryption, value);
              },
            },
          ],
        });
        return;
      }

      setDataEncryption(value);
      void saveSetting(PRIVACY_SETTING_KEYS.dataEncryption, value);
    },
    [showAlert],
  );

  const handleAnalyticsToggle = useCallback((value: boolean) => {
    setAnalyticsEnabled(value);
    void saveSetting(PRIVACY_SETTING_KEYS.analyticsEnabled, value);
  }, []);

  const handleCrashReportsToggle = useCallback((value: boolean) => {
    setCrashReportsEnabled(value);
    void saveSetting(PRIVACY_SETTING_KEYS.crashReportsEnabled, value);
  }, []);

  const handleMarketingToggle = useCallback((value: boolean) => {
    setMarketingEnabled(value);
    void saveSetting(PRIVACY_SETTING_KEYS.marketingEnabled, value);
  }, []);

  const handleLocationToggle = useCallback((value: boolean) => {
    setLocationEnabled(value);
    void saveSetting(PRIVACY_SETTING_KEYS.locationEnabled, value);
  }, []);

  const handleTimeoutSelect = useCallback((value: string) => {
    setAutoLockTimeout(value);
    void saveSetting(PRIVACY_SETTING_KEYS.autoLockTimeout, value);
    setShowTimeoutSheet(false);
  }, []);

  const handleExportData = useCallback(() => {
    showAlert({
      title: 'Export Data',
      message: 'This feature will allow you to export your financial data in a secure format.',
      actions: [{text: 'Coming Soon', onPress: () => {}}],
    });
  }, [showAlert]);

  const handleDeleteData = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteData = useCallback(async () => {
    try {
      setShowDeleteModal(false);
      setIsDeleting(true);

      const authService = UnifiedAuthService.getInstance();
      const currentUser = authService.getCurrentUserSync();
      const userId = currentUser?.uid;

      await StorageService.clearUserData();
      await signOut();

      if (userId) {
        appLogger.info('Firestore data deletion skipped (REMOVED - Legacy Firebase)');
      }

      setIsDeleting(false);
      showAlert({
        title: 'Data Deleted',
        message:
          'All your financial data has been successfully deleted from both local storage and cloud.',
        actions: [{text: 'OK', variant: 'success', onPress: () => {}}],
      });
    } catch (error) {
      appLogger.error('Error deleting data:', error);
      setIsDeleting(false);
      showAlert({
        title: 'Error',
        message: 'An error occurred while deleting your data. Please try again.',
        actions: [{text: 'OK', variant: 'default', onPress: () => {}}],
      });
    }
  }, [showAlert, signOut]);

  const currentTimeoutLabel = useMemo(() => {
    return (
      AUTO_LOCK_TIMEOUT_OPTIONS.find((option) => option.value === autoLockTimeout)?.label ??
      '5 minutes'
    );
  }, [autoLockTimeout]);

  return {
    biometricEnabled,
    autoLockEnabled,
    dataEncryption,
    analyticsEnabled,
    crashReportsEnabled,
    marketingEnabled,
    locationEnabled,
    autoLockTimeout,
    currentTimeoutLabel,
    showTimeoutSheet,
    showDeleteModal,
    isDeleting,
    setShowTimeoutSheet,
    setShowDeleteModal,
    handleBiometricToggle,
    handleAutoLockToggle,
    handleDataEncryptionToggle,
    handleAnalyticsToggle,
    handleCrashReportsToggle,
    handleMarketingToggle,
    handleLocationToggle,
    handleTimeoutSelect,
    handleExportData,
    handleDeleteData,
    confirmDeleteData,
    showAlert,
  };
}

export type PrivacySecurityScreenModel = ReturnType<typeof usePrivacySecurityScreen>;
