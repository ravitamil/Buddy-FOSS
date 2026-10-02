import {Stack, SuspenseFallback as ExpoRouterSuspenseFallback} from 'expo-router';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {InteractionManager} from 'react-native';
import {useCallback, useEffect, useRef} from 'react';
import {StatusBarManager} from '../src/components/StatusBarManager';
import {useTamaguiTheme} from '../src/context/TamaguiThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import {productionMonitoring} from '../src/services/ProductionMonitoringService';
import {AppProviders} from '../src/context/AppProviders';
import {FeatureRouteGuard} from '../src/features/featureControls/FeatureRouteGuard';
import {AppKeepAwake} from '../src/features/startup/components/AppKeepAwake';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {View} from 'tamagui';
import {logger as appLogger} from '../src/services/LoggerService';
import {markStartupPhase} from '../src/services/StartupTelemetry';
import {checkAndPromptNotificationPermissionOnFirstLaunch} from '../src/utils/permissions';

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

export const SuspenseFallback = ExpoRouterSuspenseFallback;

const modalScreens = [
  {name: 'email-login'},
  {name: 'email-verification'},
  {name: 'phone-input'},
  {name: 'otp-verification'},
  {name: 'create-profile'},
  {name: 'add-transaction'},
  {name: 'add-group'},
  {name: 'add-category'},
  {name: 'add-investment'},
  {name: 'add-savings-goal'},
  {name: 'add-edit-loan'},
  {name: 'add-edit-subscription'},
  {name: 'edit-group'},
  {name: 'edit-category'},
  {name: 'find-group-and-add-transaction'},
  {name: 'paywall'},
  {name: 'customer-center'},
  {name: 'currency-selection'},
  {name: 'group-currency-picker'},
  {name: 'service-unavailable'},
  {name: 'force-upgrade'},
  {name: 'network-unavailable'},
  {name: 'system-error'},
  {name: 'feature-unavailable'},
  {name: 'system-screens-gallery'},
];

function AppContent({onFirstLayout}: {onFirstLayout: () => void}) {
  const {isDarkMode} = useTamaguiTheme();
  const nativeScreensSafetyProps = {
    detachInactiveScreens: false,
  };

  return (
    <View style={{flex: 1, backgroundColor: 'transparent'}} onLayout={onFirstLayout}>
      <StatusBarManager />
      <FeatureRouteGuard>
        <Stack
          {...nativeScreensSafetyProps}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 150,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: isDarkMode ? '#ffffff' : '#000000',
            headerTitleStyle: {
              fontFamily: '$heading',
              color: isDarkMode ? '#ffffff' : '#000000',
            },
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}>
          <Stack.Screen name="(tabs)" />
          {modalScreens.map((screen) => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              options={{
                presentation: 'card',
                animation: 'fade',
                animationDuration: 150,
              }}
            />
          ))}
        </Stack>
      </FeatureRouteGuard>
    </View>
  );
}

export default function RootLayout() {
  const hasHiddenSplash = useRef(false);

  const handleFirstContentLayout = useCallback(() => {
    if (hasHiddenSplash.current) return;
    hasHiddenSplash.current = true;
    markStartupPhase('first_shell');
    void SplashScreen.hideAsync();
    InteractionManager.runAfterInteractions(() => {
      void checkAndPromptNotificationPermissionOnFirstLaunch().catch((error) => {
        appLogger.warn('Initial notification permission prompt failed:', error);
      });
    });
  }, []);

  useEffect(() => {
    void productionMonitoring
      .initializeCritical()
      .catch((error) => appLogger.warn('Failed to initialize critical monitoring:', error));

    const deferredMonitoringTask = InteractionManager.runAfterInteractions(() => {
      void productionMonitoring
        .initializeDeferred()
        .catch((error) => appLogger.warn('Failed to initialize deferred monitoring:', error));
    });

    return () => {
      deferredMonitoringTask.cancel();
      void productionMonitoring.flush().catch(() => undefined);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <AppKeepAwake />
          <AppProviders>
            <AppContent onFirstLayout={handleFirstContentLayout} />
          </AppProviders>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
