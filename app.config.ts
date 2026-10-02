/// <reference types="node" />
import type {ExpoConfig} from 'expo/config';

const config: ExpoConfig = {
  name: 'Buddy',
  slug: 'budget-buddy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/appLogo/coins-logo.png',
  userInterfaceStyle: 'automatic',
  scheme: 'buddy',
  runtimeVersion: '1.0.0',
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
    autolinkingModuleResolution: true,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'io.buddy.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptiveIcons/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: 'io.buddy.app',
    softwareKeyboardLayoutMode: 'pan',
    permissions: [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
      'android.permission.CAMERA',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_CONTACTS',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  assetBundlePatterns: ['**/*'],
  extra: {
    isFossEdition: true,
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          useHermesV1: true,
          usePrecompiledHeaders: true,
        },
        ios: {
          deploymentTarget: '16.4',
          useHermesV1: true,
          ccacheEnabled: true,
          usePrecompiledModules: true,
        },
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/SFPRODISPLAYREGULAR.otf',
          './assets/fonts/SFPRODISPLAYBOLD.otf',
          './assets/fonts/SFPRODISPLAYMEDIUM.otf',
        ],
      },
    ],
    'expo-asset',
    'expo-image',
    [
      'expo-image-picker',
      {
        photosPermission: 'The app needs access to your photos to set profile pictures.',
        cameraPermission: 'The app needs access to your camera to take profile pictures.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'Allow Buddy to access photos used in your profile and receipts.',
        savePhotosPermission: 'Allow Buddy to save exported images to your photo library.',
        granularPermissions: ['photo'],
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/appLogo/coins-logo.png',
        color: '#000000',
      },
    ],
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Production',
      },
    ],
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/splash/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#000000',
      },
    ],
    'expo-status-bar',
    'expo-mail-composer',
    'expo-web-browser',
    'expo-router',
    'expo-background-task',
    [
      'expo-contacts',
      {
        contactsPermission:
          'Allow Buddy to access your contacts to easily add friends to expenses.',
      },
    ],
    './plugins/withMainActivitySavedInstanceStateFix.js',
    './plugins/withBlockedAndroidPermissions.js',
  ],
};

export default config;
