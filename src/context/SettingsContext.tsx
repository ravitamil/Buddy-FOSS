/**
 * Enhanced SettingsContext
 *
 * Manages global app settings and preferences with comprehensive functionality.
 * Handles currency, language, theme, notifications, and formatting utilities.
 * Implements standardized error handling and memoized performance optimizations.
 *
 * Features:
 * - Currency and language management
 * - Theme preferences (light/dark/system)
 * - Notification settings
 * - Memoized formatting utilities
 * - Remote synchronization
 * - Migration support
 */

import React, {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react';
import {logger as appLogger} from '../services/LoggerService';
import {
  createCurrencyFormatter,
  createDateFormatter,
  createExactCurrencyFormatter,
} from './settings/settingsFormatters';
import {syncSettingsFromRemote} from './settings/settingsRemoteSync';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
  SettingsContextType,
  SettingsProviderProps,
  ThemeMode,
} from './settings/settingsContextTypes';
import {loadInitialSettings} from './settings/settingsInitialization';
import {useSettingsOperations} from './settings/useSettingsOperations';

// Create context-specific logger
const logger = appLogger.contextLogger('SettingsContext');
import {sanitizeSettings} from '../utils/settings-validation';
import {useAuth} from './AuthContext';
import {setDefaultSettlementStrategy} from '../utils/groupBalance';

export type {NotificationSettings, SettingsContextType, ThemeMode};

// Create Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Enhanced SettingsProvider Component
 *
 * Provides comprehensive app settings and preferences to the entire app.
 * Manages currency, language, theme, notifications, and formatting utilities.
 * Implements proper error handling, loading states, and remote synchronization.
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({children}) => {
  const {isAuthenticated, user} = useAuth();
  // ============================================================================
  // State Management
  // ============================================================================

  const [currency, setCurrencyState] = useState<string>('USD');
  const [groupCurrency, setGroupCurrencyState] = useState<string>('USD');
  const [language, setLanguageState] = useState<string>('en');
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [notifications, setNotificationsState] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [settlementStrategy, setSettlementStrategyState] = useState<
    'pairwise' | 'minimize_transactions'
  >('minimize_transactions');

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    void initializeSettings();
  }, []);

  /**
   * Initialize settings from local storage with validation and migration
   */
  const initializeSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialSettings = await loadInitialSettings();
      setCurrencyState(initialSettings.currency);
      setGroupCurrencyState(initialSettings.groupCurrency);
      setLanguageState(initialSettings.language);
      setThemeState(initialSettings.theme);
      setNotificationsState(initialSettings.notifications);
      setSettlementStrategyState(initialSettings.settlementStrategy);
      setLastSyncTime(initialSettings.lastSyncTime);
    } catch (error) {
      logger.error('Initialization failed', error);
      setError('Failed to load settings');

      // Fall back to safe defaults
      const safeDefaults = sanitizeSettings(null);
      setCurrencyState(safeDefaults.currency);
      setLanguageState(safeDefaults.language);
      setThemeState(safeDefaults.theme);
      setNotificationsState(safeDefaults.notifications);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // ============================================================================
  // Settings Operations
  // ============================================================================

  const {updateCurrency, updateGroupCurrency, updateLanguage, updateTheme, updateNotifications} =
    useSettingsOperations({
      currency,
      groupCurrency,
      language,
      theme,
      notifications,
      userId: user?.uid,
      setCurrencyState,
      setGroupCurrencyState,
      setLanguageState,
      setThemeState,
      setNotificationsState,
    });

  // ============================================================================
  // Memoized Formatting Utilities
  // ============================================================================

  const formatCurrency = useMemo(() => createCurrencyFormatter(currency), [currency]);

  const formatCurrencyExact = useMemo(() => createExactCurrencyFormatter(currency), [currency]);

  const formatDate = useMemo(() => createDateFormatter(language), [language]);

  // ============================================================================
  // Sync Operations
  // ============================================================================

  const syncSettings = useCallback(async (): Promise<void> => {
    const remoteSettings = await syncSettingsFromRemote(user?.uid);
    if (!remoteSettings) return;

    if (remoteSettings.currency) setCurrencyState(remoteSettings.currency);
    if (remoteSettings.groupCurrency) setGroupCurrencyState(remoteSettings.groupCurrency);
    if (remoteSettings.language) setLanguageState(remoteSettings.language);
    if (remoteSettings.theme) setThemeState(remoteSettings.theme);
    if (remoteSettings.notifications) setNotificationsState(remoteSettings.notifications);
  }, [user?.uid]);

  /**
   * Sync settings when authentication state changes
   */
  useEffect(() => {
    if (isInitialized && isAuthenticated && user?.uid) {
      logger.info('User authenticated, syncing settings from remote');
      void syncSettings();
    }
  }, [isAuthenticated, isInitialized, syncSettings, user?.uid]);

  // Keep the balance engine strategy aligned with persisted app settings.
  useEffect(() => {
    setDefaultSettlementStrategy(settlementStrategy);
  }, [settlementStrategy]);

  // ============================================================================
  // Memoized Context Value
  // ============================================================================

  const contextValue = useMemo(
    () => ({
      // Settings state
      currency,
      groupCurrency,
      language,
      theme,
      notifications,
      settlementStrategy,

      // Settings operations
      updateCurrency,
      updateGroupCurrency,
      updateLanguage,
      updateTheme,
      updateNotifications,

      // Formatting utilities (already memoized)
      formatCurrency,
      formatCurrencyExact,
      formatDate,

      // Sync and state
      syncWithRemote: syncSettings,
      isLoading,
      error,
      lastSyncTime,
      isInitialized,
    }),
    [
      currency,
      groupCurrency,
      language,
      theme,
      notifications,
      settlementStrategy,
      updateCurrency,
      updateGroupCurrency,
      updateLanguage,
      updateTheme,
      updateNotifications,
      formatCurrency,
      formatCurrencyExact,
      formatDate,
      syncSettings,
      isLoading,
      error,
      lastSyncTime,
      isInitialized,
    ],
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

/**
 * useSettings Hook
 *
 * Custom hook to access SettingsContext.
 * Throws error if used outside SettingsProvider.
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
