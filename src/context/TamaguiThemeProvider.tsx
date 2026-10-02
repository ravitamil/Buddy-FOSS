import {Button, Text} from '@ravitamil/buddy-ui';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Appearance, useColorScheme} from 'react-native';
import {TamaguiProvider, Theme, YStack} from 'tamagui';

import tamaguiConfig from '../../tamagui.config';
import {logger as appLogger} from '../services/LoggerService';
import {StorageService} from '../services/storage';

const logger = appLogger.contextLogger('TamaguiThemeProvider');

interface TamaguiThemeContextType {
  isDarkMode: boolean;
  currentThemeName: string;
  toggleTheme: () => Promise<void>;
  isInitialized: boolean;
}

const TamaguiThemeContext = createContext<TamaguiThemeContextType | undefined>(undefined);

export const useTamaguiTheme = () => {
  const context = useContext(TamaguiThemeContext);
  if (!context) {
    throw new Error('useTamaguiTheme must be used within TamaguiThemeProvider');
  }
  return context;
};

interface TamaguiThemeProviderProps {
  children: React.ReactNode;
}

export const TamaguiThemeProvider: React.FC<TamaguiThemeProviderProps> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [explicitPreference, setExplicitPreference] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const isDarkMode = useMemo(() => {
    if (explicitPreference !== null) return explicitPreference;
    if (systemColorScheme) return systemColorScheme === 'dark';
    return Appearance.getColorScheme() !== 'light';
  }, [explicitPreference, systemColorScheme]);

  const currentThemeName = isDarkMode ? 'dark' : 'light';

  const loadPreferences = useCallback(async () => {
    setConfigError(null);
    try {
      const preferences = await StorageService.getPreferences();
      if (preferences.isDarkMode !== undefined && preferences.isDarkMode !== null) {
        setExplicitPreference(preferences.isDarkMode);
      }
    } catch (error) {
      logger.error('Error loading preferences', error);
      setConfigError(
        `Failed to load theme preferences: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const toggleTheme = useCallback(async () => {
    const nextDarkMode = !isDarkMode;
    setExplicitPreference(nextDarkMode);
    await StorageService.savePreference('isDarkMode', nextDarkMode);
  }, [isDarkMode]);

  const contextValue = useMemo<TamaguiThemeContextType>(
    () => ({isDarkMode, currentThemeName, toggleTheme, isInitialized}),
    [currentThemeName, isDarkMode, isInitialized, toggleTheme],
  );

  let content = children;
  if (!isInitialized) {
    content = (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text color="$textSecondary">Loading your theme…</Text>
      </YStack>
    );
  } else if (configError) {
    content = (
      <YStack
        flex={1}
        gap="$3"
        alignItems="center"
        justifyContent="center"
        padding="$5"
        backgroundColor="$background">
        <Text color="$error" textAlign="center">
          Theme configuration error: {configError}
        </Text>
        <Button
          onPress={() => {
            setIsInitialized(false);
            void loadPreferences();
          }}>
          Retry
        </Button>
      </YStack>
    );
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={currentThemeName}>
      <Theme name={currentThemeName}>
        <TamaguiThemeContext.Provider value={contextValue}>{content}</TamaguiThemeContext.Provider>
      </Theme>
    </TamaguiProvider>
  );
};

export default TamaguiThemeProvider;
