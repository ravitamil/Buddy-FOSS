import {Platform, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {PermissionStatus as NotificationPermissionStatus} from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import * as Contacts from 'expo-contacts/legacy';
import * as SMS from 'expo-sms';
import {logger as appLogger} from '../services/LoggerService';

const logger = appLogger.serviceLogger('Permissions');

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export const getNotificationPermissions = async (): Promise<PermissionStatus> => {
  try {
    const {status, canAskAgain} = await Notifications.getPermissionsAsync();
    return {
      granted: status === NotificationPermissionStatus.GRANTED,
      canAskAgain,
      status,
    };
  } catch (error) {
    logger.error('Error reading notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<PermissionStatus> => {
  try {
    const {status} = await Notifications.requestPermissionsAsync();
    return {
      granted: status === NotificationPermissionStatus.GRANTED,
      canAskAgain: status !== NotificationPermissionStatus.DENIED,
      status,
    };
  } catch (error) {
    logger.error('Error requesting notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

const INITIAL_NOTIFICATION_PROMPT_KEY = '@BuddyApp:hasPromptedInitialNotification';

/**
 * Check and prompt for notification permissions on initial app launch / installation.
 * On first launch, triggers the OS permission request dialog.
 * Persists a flag so subsequent launches do not re-prompt if already decided.
 */
export const checkAndPromptNotificationPermissionOnFirstLaunch =
  async (): Promise<PermissionStatus> => {
    try {
      const current = await getNotificationPermissions();
      if (current.granted) {
        await AsyncStorage.setItem(INITIAL_NOTIFICATION_PROMPT_KEY, 'true');
        return current;
      }

      const hasPrompted = await AsyncStorage.getItem(INITIAL_NOTIFICATION_PROMPT_KEY);
      if (hasPrompted === 'true' && !current.canAskAgain) {
        return current;
      }

      const result = await requestNotificationPermissions();
      await AsyncStorage.setItem(INITIAL_NOTIFICATION_PROMPT_KEY, 'true');
      return result;
    } catch (error) {
      logger.error('Error checking/prompting initial notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  };

/**
 * Request media library permissions for profile images
 */
export const requestMediaLibraryPermissions = async (): Promise<PermissionStatus> => {
  try {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    const permissionStatus: string = status;
    return {
      granted: permissionStatus === 'granted',
      canAskAgain: permissionStatus !== 'denied',
      status: permissionStatus,
    };
  } catch (error) {
    logger.error('Error requesting media library permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

/**
 * Check if SMS is available on the device
 */
export const checkSMSAvailability = async (): Promise<boolean> => {
  try {
    return await SMS.isAvailableAsync();
  } catch (error) {
    logger.error('Error checking SMS availability:', error);
    return false;
  }
};

/**
 * Request all necessary permissions at once
 */
export const requestAllPermissions = async (): Promise<{
  notifications: PermissionStatus;
  mediaLibrary: PermissionStatus;
  smsAvailable: boolean;
}> => {
  const [notifications, mediaLibrary, smsAvailable] = await Promise.all([
    requestNotificationPermissions(),
    requestMediaLibraryPermissions(),
    checkSMSAvailability(),
  ]);

  return {
    notifications,
    mediaLibrary,
    smsAvailable,
  };
};

/**
 * Show permission denied alert with option to go to settings
 */
export const showPermissionDeniedAlert = (
  permissionType: string,
  showAlert: (config: {
    title: string;
    message: string;
    actions?: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }) => void,
) => {
  showAlert({
    title: `${permissionType} Permission Required`,
    message: `Please enable ${permissionType.toLowerCase()} permission in your device settings to use this feature.`,
    actions: [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            void Linking.openURL('app-settings:');
          } else {
            void Linking.openSettings();
          }
        },
      },
    ],
  });
};

/**
 * Request contacts permission contextually with user rationale alert if denied.
 */
export const requestContactsPermissionWithRationale = async (
  showAlert?: (config: {
    title: string;
    message: string;
    actions?: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }) => void,
): Promise<PermissionStatus> => {
  try {
    const isAvailable = await Contacts.isAvailableAsync();
    if (!isAvailable) {
      if (showAlert) {
        showAlert({
          title: 'Not Supported',
          message: 'Contacts integration is not supported on this device.',
          actions: [{text: 'OK'}],
        });
      }
      return {granted: false, canAskAgain: false, status: 'unavailable'};
    }

    const {status: existingStatus, canAskAgain} = await Contacts.getPermissionsAsync();
    if (existingStatus === Contacts.PermissionStatus.GRANTED) {
      return {granted: true, canAskAgain: true, status: existingStatus};
    }

    if (canAskAgain || existingStatus === Contacts.PermissionStatus.UNDETERMINED) {
      const {status: requestedStatus, canAskAgain: nextCanAsk} =
        await Contacts.requestPermissionsAsync();
      const granted = requestedStatus === Contacts.PermissionStatus.GRANTED;
      if (!granted && showAlert && !nextCanAsk) {
        showPermissionDeniedAlert('Contacts', showAlert);
      }
      return {
        granted,
        canAskAgain: nextCanAsk,
        status: requestedStatus,
      };
    }

    if (showAlert) {
      showPermissionDeniedAlert('Contacts', showAlert);
    }

    return {
      granted: false,
      canAskAgain: false,
      status: existingStatus,
    };
  } catch (error) {
    logger.error('Error requesting contacts permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

/**
 * Configure notification handlers
 */
export const configureNotifications = () => {
  // Set the notification handler to show notifications in foreground
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
  });
};
