process.env.EXPO_OS ??= 'ios';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
  SafeAreaView: 'SafeAreaView',
  initialWindowMetrics: {
    frame: {x: 0, y: 0, width: 390, height: 844},
    insets: {top: 0, right: 0, bottom: 0, left: 0},
  },
  useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
}));

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Circle: 'Circle',
  Defs: 'Defs',
  Pattern: 'Pattern',
  Rect: 'Rect',
  Path: 'Path',
  G: 'G',
  Line: 'Line',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  KeyboardAwareScrollView: 'KeyboardAwareScrollView',
  KeyboardProvider: 'KeyboardProvider',
  KeyboardStickyView: 'KeyboardStickyView',
  useReanimatedKeyboardAnimation: () => ({
    progress: {value: 0},
    height: {value: 0},
  }),
}));

jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
  applicationName: 'Buddy',
  applicationId: 'io.buddy.app',
}));

jest.mock('expo-updates', () => ({
  isEnabled: false,
  checkForUpdateAsync: jest.fn(() => Promise.resolve({isAvailable: false})),
  fetchUpdateAsync: jest.fn(() => Promise.resolve()),
  reloadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

const mockExpoContacts = {
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  presentContactPickerAsync: jest.fn(() => Promise.resolve(null)),
  getContactsAsync: jest.fn(() => Promise.resolve({data: []})),
  Fields: {
    PhoneNumbers: 'phoneNumbers',
    Emails: 'emails',
    Image: 'image',
  },
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
};
jest.mock('expo-contacts/legacy', () => mockExpoContacts);
jest.mock('expo-contacts', () => mockExpoContacts);

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationReceivedListener: jest.fn(() => ({remove: jest.fn()})),
  addNotificationResponseReceivedListener: jest.fn(() => ({remove: jest.fn()})),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({status: 'granted', granted: true, canAskAgain: true}),
  ),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));

jest.mock('expo-sms', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  sendSMSAsync: jest.fn(() => Promise.resolve({result: 'sent'})),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({data: null, error: null})),
          })),
        })),
        in: jest.fn(() => ({
          in: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({data: [], error: null})),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

// Jest matchers are automatically extended in @testing-library/react-native v13+
import React, {type ReactNode} from 'react';

const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(globalThis, 'matchMedia', {
  value: matchMediaMock,
  configurable: true,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    configurable: true,
  });
}

type MockComponentProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const passthroughMock = (fallback: string | null = null) =>
  jest.fn(({children}: MockComponentProps): ReactNode => children ?? fallback);

const hostMock = (type: string) =>
  jest.fn(
    ({children, ...props}: MockComponentProps): React.ReactElement =>
      React.createElement(type, props, children),
  );

type StyleableRender<P extends object> = (props: P, ref: React.Ref<unknown>) => React.ReactNode;

type StyledMockComponent = jest.Mock<React.ReactElement, [MockComponentProps]> & {
  styleable: <P extends object>(
    render: StyleableRender<P>,
  ) => React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>>;
};

const mockStyled = jest.fn(
  (Component: React.ComponentType<MockComponentProps>): StyledMockComponent => {
    const StyledComponent = jest.fn(
      ({children, ...props}: MockComponentProps): React.ReactElement =>
        React.createElement(Component, props, children),
    ) as StyledMockComponent;

    StyledComponent.styleable = <P extends object>(render: StyleableRender<P>) =>
      React.forwardRef<unknown, P>((props, ref) =>
        React.createElement(React.Fragment, null, render(props, ref)),
      );

    return StyledComponent;
  },
);

declare global {
  var testUtils: {
    flushPromises: () => Promise<void>;
    waitFor: (condition: () => boolean, timeout?: number) => Promise<boolean>;
    mockComponent: (name: string) => jest.Mock<ReactNode, [MockComponentProps]>;
  };
}

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    MD2: 'MD2',
    MD4: 'MD4',
    MD5: 'MD5',
    SHA1: 'SHA-1',
    SHA256: 'SHA-256',
    SHA384: 'SHA-384',
    SHA512: 'SHA-512',
  },
  CryptoEncoding: {
    BASE64: 'base64',
    HEX: 'hex',
  },
  digest: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  digestStringAsync: jest.fn().mockResolvedValue('mock-digest'),
  getRandomBytes: jest.fn((byteCount: number) => new Uint8Array(byteCount)),
  getRandomBytesAsync: jest.fn((byteCount: number) => Promise.resolve(new Uint8Array(byteCount))),
  getRandomValues: jest.fn(<T extends ArrayBufferView>(values: T): T => values),
  randomUUID: jest.fn(() => '00000000-0000-4000-8000-000000000000'),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      googleWebClientId: 'mock-web-client-id',
      googleIosClientId: 'mock-ios-client-id',
      googleAndroidClientId: 'mock-android-client-id',
    },
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

// Mock Firebase
jest.mock(
  '@react-native-firebase/app',
  () => ({
    __esModule: true,
    default: () => ({
      auth: () => ({
        currentUser: null,
        onAuthStateChanged: jest.fn(() => jest.fn()),
        signOut: jest.fn().mockResolvedValue(undefined),
      }),
      firestore: () => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({exists: false, data: () => null}),
            set: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
          })),
        })),
      }),
    }),
  }),
  {virtual: true},
);

jest.mock(
  '@react-native-firebase/firestore',
  () => ({
    __esModule: true,
    default: () => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({exists: false, data: () => null}),
          set: jest.fn().mockResolvedValue(undefined),
          update: jest.fn().mockResolvedValue(undefined),
        })),
      })),
    }),
  }),
  {virtual: true},
);

jest.mock(
  '@react-native-firebase/auth',
  () => ({
    __esModule: true,
    default: () => ({
      currentUser: null,
      onAuthStateChanged: jest.fn(() => jest.fn()),
      signOut: jest.fn().mockResolvedValue(undefined),
    }),
  }),
  {virtual: true},
);

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({isConnected: true, isInternetReachable: true})),
}));

jest.mock('react-native-mmkv-storage', () => {
  const store = new Map<string, string>();
  return {
    MMKVLoader: jest.fn().mockImplementation(() => ({
      withInstanceID: jest.fn().mockReturnThis(),
      setProcessingMode: jest.fn().mockReturnThis(),
      withEncryption: jest.fn().mockReturnThis(),
      initialize: jest.fn().mockReturnValue({
        getString: jest.fn((key: string) => store.get(key) ?? null),
        setString: jest.fn((key: string, value: string) => {
          store.set(key, value);
          return true;
        }),
        setBool: jest.fn((key: string, value: boolean) => {
          store.set(key, String(value));
          return true;
        }),
        getBool: jest.fn((key: string) => store.get(key) === 'true'),
        setInt: jest.fn((key: string, value: number) => {
          store.set(key, String(value));
          return true;
        }),
        getInt: jest.fn((key: string) => Number(store.get(key) ?? 0)),
        getArray: jest.fn((key: string): unknown[] | null => {
          const val = store.get(key);
          return val ? (JSON.parse(val) as unknown[]) : null;
        }),
        setArray: jest.fn((key: string, value: unknown[]) => {
          store.set(key, JSON.stringify(value));
          return true;
        }),
        getMap: jest.fn((key: string): Record<string, unknown> | null => {
          const val = store.get(key);
          return val ? (JSON.parse(val) as Record<string, unknown>) : null;
        }),
        setMap: jest.fn((key: string, value: unknown) => {
          store.set(key, JSON.stringify(value));
          return true;
        }),
        removeItem: jest.fn((key: string) => {
          store.delete(key);
          return true;
        }),
        clearStore: jest.fn(() => {
          store.clear();
          return true;
        }),
      }),
    })),
  };
});

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({canceled: true, assets: []})),
  launchCameraAsync: jest.fn(() => Promise.resolve({canceled: true, assets: []})),
  MediaTypeOptions: {Images: 'Images'},
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({type: 'cancel'})),
  openAuthSessionAsync: jest.fn(() => Promise.resolve({type: 'cancel'})),
  dismissBrowser: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'buddy://auth'),
  AuthRequest: jest.fn(),
  ResponseType: {Token: 'token', Code: 'code'},
}));

// Import context testing setup
import {setupContextTestEnvironment} from './utils/context-test-setup';

// Setup context testing environment
setupContextTestEnvironment();

// Enhanced console mocking for testing
const originalConsole = global.console;
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock React Native components
jest.mock('react-native', () => {
  return {
    View: hostMock('View'),
    Text: hostMock('Text'),
    TextInput: hostMock('TextInput'),
    TouchableOpacity: hostMock('TouchableOpacity'),
    Pressable: hostMock('Pressable'),
    ScrollView: hostMock('ScrollView'),
    SafeAreaView: hostMock('SafeAreaView'),
    Image: hostMock('Image'),
    ActivityIndicator: hostMock('ActivityIndicator'),
    Modal: hostMock('Modal'),
    Switch: hostMock('Switch'),
    FlatList: jest.fn(
      ({
        data,
        renderItem,
      }: {
        data?: unknown[];
        renderItem?: (info: {item: unknown; index: number}) => React.ReactNode;
      }) => data?.map((item, index) => renderItem?.({item, index})) ?? null,
    ),
    SectionList: hostMock('SectionList'),
    StyleSheet: {
      create: jest.fn(<T extends Record<string, unknown>>(styles: T) => styles),
      flatten: jest.fn((style: unknown) => style),
      hairlineWidth: 1,
      absoluteFill: {},
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(
        (obj: {ios?: unknown; android?: unknown; default?: unknown}) => obj.ios ?? obj.default,
      ),
    },
    Dimensions: {
      get: jest.fn(() => ({width: 375, height: 812})),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Keyboard: {
      addListener: jest.fn(() => ({remove: jest.fn()})),
      removeListener: jest.fn(),
      dismiss: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn().mockResolvedValue(true),
      canOpenURL: jest.fn().mockResolvedValue(true),
    },
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => 'interpolated'),
      })),
      timing: jest.fn(() => ({start: jest.fn()})),
      spring: jest.fn(() => ({start: jest.fn()})),
      parallel: jest.fn(() => ({start: jest.fn()})),
      View: hostMock('View'),
      Text: hostMock('Text'),
    },
  };
});

// Mock Tamagui components
jest.mock('tamagui', () => {
  const Card = hostMock('View') as jest.Mock & {
    Header: jest.Mock;
    Footer: jest.Mock;
  };
  const Sheet = hostMock('View') as jest.Mock & {
    Overlay: jest.Mock;
    Handle: jest.Mock;
    Frame: jest.Mock;
  };
  const Switch = hostMock('Switch') as jest.Mock & {
    Thumb: jest.Mock;
  };
  const Dialog = hostMock('View') as jest.Mock & {
    Close: jest.Mock;
    Content: jest.Mock;
    Description: jest.Mock;
    Overlay: jest.Mock;
    Portal: jest.Mock;
    Title: jest.Mock;
    Trigger: jest.Mock;
  };
  const Adapt = hostMock('View') as jest.Mock & {Contents: jest.Mock};
  Card.Header = hostMock('View');
  Card.Footer = hostMock('View');
  Sheet.Overlay = hostMock('View');
  Sheet.Handle = hostMock('View');
  Sheet.Frame = hostMock('View');
  Switch.Thumb = hostMock('View');
  Dialog.Close = hostMock('View');
  Dialog.Content = hostMock('View');
  Dialog.Description = hostMock('Text');
  Dialog.Overlay = hostMock('View');
  Dialog.Portal = hostMock('View');
  Dialog.Title = hostMock('Text');
  Dialog.Trigger = hostMock('View');
  Adapt.Contents = hostMock('View');

  return {
    createTokens: jest.fn(<T extends object>(tokens: T): T => tokens),
    createTamagui: jest.fn(<T extends object>(config: T): T => config),
    TamaguiProvider: passthroughMock(),
    Theme: passthroughMock(),
    YStack: hostMock('View'),
    XStack: hostMock('View'),
    View: hostMock('View'),
    Stack: hostMock('View'),
    Card,
    H2: hostMock('Text'),
    H4: hostMock('Text'),
    Paragraph: hostMock('Text'),
    Separator: hostMock('View'),
    Spinner: hostMock('ActivityIndicator'),
    Switch,
    Dialog,
    Adapt,
    Sheet,
    Text: hostMock('Text'),
    Label: hostMock('Text'),
    Button: hostMock('Pressable'),
    Input: hostMock('TextInput'),
    ScrollView: hostMock('ScrollView'),
    VisuallyHidden: hostMock('View'),
    styled: mockStyled,
    useTheme: jest.fn(() => ({
      background: {val: '#ffffff'},
      borderColor: {val: '#dddddd'},
      green8: {val: '#16a34a'},
      gray11: {val: '#333333'},
    })),
  };
});

jest.mock('expo-blur', () => ({
  BlurView: hostMock('View'),
  BlurTargetView: hostMock('View'),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: hostMock('View'),
}));

// Mock Expo vector icons without loading the native vector-icons module.
jest.mock('@expo/vector-icons', () => ({
  Ionicons: passthroughMock(),
  MaterialIcons: passthroughMock(),
  MaterialCommunityIcons: passthroughMock(),
  FontAwesome: passthroughMock(),
  FontAwesome5: passthroughMock(),
  AntDesign: passthroughMock(),
  Feather: passthroughMock(),
  Entypo: passthroughMock(),
}));

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: passthroughMock(),
}));

// Performance testing utilities
global.performance =
  global.performance ||
  ({
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  } as unknown as Performance);

// Define __DEV__ global for React Native
Object.defineProperty(globalThis, '__DEV__', {
  value: process.env.NODE_ENV !== 'production',
  configurable: true,
});

// Default to real timers so React Native Testing Library cleanup can complete.
// Individual tests can still opt into fake timers when they own timer behavior.
beforeEach(() => {
  jest.useRealTimers();
});

// Global test utilities
global.testUtils = {
  flushPromises: () => new Promise((resolve) => setImmediate(resolve)),
  waitFor: (condition: () => boolean, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  },
  mockComponent: () => passthroughMock(),
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

// Restore console after all tests
afterAll(() => {
  global.console = originalConsole;
});
