import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {TamaguiProvider, Theme} from 'tamagui';
import config from '../../../tamagui.config';
import {ServiceUnavailableScreen} from '../ServiceUnavailableScreen';
import {ForceUpgradeScreen} from '../ForceUpgradeScreen';
import {NetworkUnavailableScreen} from '../NetworkUnavailableScreen';
import {SystemErrorScreen} from '../SystemErrorScreen';
import {FeatureUnavailableScreen} from '../FeatureUnavailableScreen';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({isConnected: true, isInternetReachable: true})),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: true,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/features/systemStatus/AppSystemStatusProvider', () => ({
  useAppSystemStatus: () => ({
    service: {
      isAvailable: false,
      status: 'maintenance',
      title: 'We’re Under Scheduled Maintenance',
      message: 'System upgrade in progress',
      estimatedEndTime: '~15 mins',
    },
    upgrade: {
      isUpgradeRequired: true,
      currentVersion: '1.0.0',
      minRequiredVersion: '1.2.0',
      latestVersion: '1.2.0',
      releaseNotes: ['Feature 1', 'Feature 2'],
      storeUrl: 'https://store.url',
      hasPendingOtaUpdate: false,
    },
    network: {
      isConnected: false,
      isInternetReachable: false,
      hasLocalCache: true,
    },
    isChecking: false,
    checkStatus: jest.fn(),
    applyOtaUpdate: jest.fn(),
    setOfflineBypass: jest.fn(),
    isOfflineBypassed: false,
  }),
}));

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <TamaguiProvider config={config}>
    <Theme name="dark">{children}</Theme>
  </TamaguiProvider>
);

describe('System and Error Screens', () => {
  describe('ServiceUnavailableScreen', () => {
    it('renders maintenance title and check again button', () => {
      const onRetry = jest.fn();
      const {getByText} = render(<ServiceUnavailableScreen onRetry={onRetry} />, {
        wrapper: TestWrapper,
      });

      expect(getByText(/We’re Under Scheduled Maintenance/i)).toBeTruthy();
      const checkButton = getByText(/Check Again/i);
      fireEvent.press(checkButton);
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('ForceUpgradeScreen', () => {
    it('renders mandatory update badge and update button', () => {
      const onUpdate = jest.fn();
      const {getByText} = render(<ForceUpgradeScreen onUpdatePress={onUpdate} />, {
        wrapper: TestWrapper,
      });

      expect(getByText(/Update Required/i)).toBeTruthy();
      expect(getByText(/Mandatory Update/i)).toBeTruthy();
      expect(getByText(/v1.0.0/)).toBeTruthy();
      expect(getByText(/v1.2.0/)).toBeTruthy();
    });
  });

  describe('NetworkUnavailableScreen', () => {
    it('renders offline title and retry button', () => {
      const onRetry = jest.fn();
      const {getByText} = render(<NetworkUnavailableScreen onRetry={onRetry} />, {
        wrapper: TestWrapper,
      });

      expect(getByText(/You’re Offline/i)).toBeTruthy();
      expect(getByText(/No Connection/i)).toBeTruthy();
      const retryButton = getByText(/Try Again/i);
      fireEvent.press(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('SystemErrorScreen', () => {
    it('renders something went wrong and restart button', () => {
      const onRestart = jest.fn();
      const {getByText} = render(
        <SystemErrorScreen onRestart={onRestart} error={new Error('Test explosion')} />,
        {wrapper: TestWrapper},
      );

      expect(getByText(/Something went wrong/i)).toBeTruthy();
      const restartButton = getByText(/Restart App/i);
      fireEvent.press(restartButton);
      expect(onRestart).toHaveBeenCalled();
    });
  });

  describe('FeatureUnavailableScreen', () => {
    it('renders feature status and go back button', () => {
      const onGoBack = jest.fn();
      const {getByText} = render(
        <FeatureUnavailableScreen
          title="Investments Restricted"
          status="maintenance"
          onGoBack={onGoBack}
        />,
        {wrapper: TestWrapper},
      );

      expect(getByText(/Investments Restricted/i)).toBeTruthy();
      expect(getByText(/Under Maintenance/i)).toBeTruthy();
      const backButton = getByText(/Go Back/i);
      fireEvent.press(backButton);
      expect(onGoBack).toHaveBeenCalled();
    });
  });
});
