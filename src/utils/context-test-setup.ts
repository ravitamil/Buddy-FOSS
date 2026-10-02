/**
 * Context Test Setup
 *
 * This file provides setup utilities specifically for context testing,
 * including mock services and test environment configuration.
 */

import {jest} from '@jest/globals';

type TestStorageState = Record<string, unknown>;
type TestFirestoreData = Record<string, unknown>;

type TestUser = {
  uid: string;
  phoneNumber?: string;
  email?: string;
  isAnonymous: boolean;
};

type AuthResult = {
  user: TestUser | null;
};

type PerformanceMeasurement = {
  renderCount: number;
  duration: number;
  averageRenderTime: number;
};

type MemoryMeasurement = {
  initial: number;
  current: number;
  difference: number;
  percentage: number;
};

const emptyList = (): unknown[] => [];

// ============================================================================
// Mock Services Setup
// ============================================================================

/**
 * Mock AsyncStorage for testing
 */
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

/**
 * Mock Authentication for testing
 */
export const mockAuthService = {
  currentUser: null,
  signInWithEmail: jest.fn<(email: string) => Promise<AuthResult>>(),
  signInWithPhoneNumber: jest.fn<(phoneNumber: string) => Promise<AuthResult>>(),
  signInWithCredential: jest.fn<() => Promise<AuthResult>>(() =>
    Promise.resolve({user: {uid: 'test-uid', isAnonymous: false}}),
  ),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn().mockReturnValue(() => {}),
};

/**
 * Mock Firestore for testing
 */
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(() =>
    Promise.resolve({
      exists: true,
      data: () => ({}),
      docs: [],
    }),
  ),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  add: jest.fn(() => Promise.resolve({id: 'test-id'})),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  onSnapshot: jest.fn().mockReturnValue(() => {}),
};

/**
 * Mock Storage Service for testing
 */
export const createMockStorageService = () => {
  let storage: TestStorageState = {};

  return {
    // Transaction storage
    saveTransactions: jest.fn<(transactions: unknown[]) => Promise<void>>((transactions) => {
      storage.transactions = transactions;
      return Promise.resolve();
    }),
    loadTransactions: jest.fn<() => Promise<unknown[]>>(() => {
      return Promise.resolve(
        Array.isArray(storage.transactions) ? storage.transactions : emptyList(),
      );
    }),

    // Category storage
    saveCategories: jest.fn<(categories: unknown[]) => Promise<void>>((categories) => {
      storage.categories = categories;
      return Promise.resolve();
    }),
    loadCategories: jest.fn<() => Promise<unknown[]>>(() => {
      return Promise.resolve(Array.isArray(storage.categories) ? storage.categories : emptyList());
    }),

    // Budget storage
    saveBudgets: jest.fn<(budgets: unknown[]) => Promise<void>>((budgets) => {
      storage.budgets = budgets;
      return Promise.resolve();
    }),
    loadBudgets: jest.fn<() => Promise<unknown[]>>(() => {
      return Promise.resolve(Array.isArray(storage.budgets) ? storage.budgets : emptyList());
    }),

    // Savings goals storage
    saveSavingsGoals: jest.fn<(goals: unknown[]) => Promise<void>>((goals) => {
      storage.savingsGoals = goals;
      return Promise.resolve();
    }),
    loadSavingsGoals: jest.fn<() => Promise<unknown[]>>(() => {
      return Promise.resolve(
        Array.isArray(storage.savingsGoals) ? storage.savingsGoals : emptyList(),
      );
    }),

    // Groups storage
    saveGroups: jest.fn<(groups: unknown[]) => Promise<void>>((groups) => {
      storage.groups = groups;
      return Promise.resolve();
    }),
    loadGroups: jest.fn<() => Promise<unknown[]>>(() => {
      return Promise.resolve(Array.isArray(storage.groups) ? storage.groups : emptyList());
    }),

    // Settings storage
    saveSettings: jest.fn<(settings: TestStorageState) => Promise<void>>((settings) => {
      storage.settings = settings;
      return Promise.resolve();
    }),
    loadSettings: jest.fn<() => Promise<TestStorageState>>(() => {
      return Promise.resolve(isRecord(storage.settings) ? storage.settings : {});
    }),

    // Generic storage
    save: jest.fn<(key: string, data: unknown) => Promise<void>>((key, data) => {
      storage[key] = data;
      return Promise.resolve();
    }),
    load: jest.fn<(key: string) => Promise<unknown>>((key) => {
      return Promise.resolve(storage[key] ?? null);
    }),

    // Clear storage
    clear: jest.fn<() => Promise<void>>(() => {
      storage = {};
      return Promise.resolve();
    }),

    // Get current storage state (for testing)
    getStorage: () => ({...storage}),
    setStorage: (newStorage: TestStorageState) => {
      storage = {...newStorage};
    },
  };
};

/**
 * Mock Database Service for testing
 */
export const createMockDatabaseService = () => {
  let firestoreData: TestFirestoreData = {};
  let shouldFail = false;

  return {
    // Firestore operations
    syncTransactionsToFirestore: jest.fn<(transactions: unknown[]) => Promise<void>>(
      (transactions) => {
        if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
        firestoreData.transactions = transactions;
        return Promise.resolve();
      },
    ),
    syncCategoriesToFirestore: jest.fn<(categories: unknown[]) => Promise<void>>((categories) => {
      if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
      firestoreData.categories = categories;
      return Promise.resolve();
    }),
    syncBudgetsToFirestore: jest.fn<(budgets: unknown[]) => Promise<void>>((budgets) => {
      if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
      firestoreData.budgets = budgets;
      return Promise.resolve();
    }),
    syncSavingsGoalsToFirestore: jest.fn<(goals: unknown[]) => Promise<void>>((goals) => {
      if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
      firestoreData.savingsGoals = goals;
      return Promise.resolve();
    }),
    syncGroupsToFirestore: jest.fn<(groups: unknown[]) => Promise<void>>((groups) => {
      if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
      firestoreData.groups = groups;
      return Promise.resolve();
    }),
    syncSettingsToFirestore: jest.fn<(settings: TestFirestoreData) => Promise<void>>((settings) => {
      if (shouldFail) return Promise.reject(new Error('Firestore sync failed'));
      firestoreData.settings = settings;
      return Promise.resolve();
    }),

    // Load operations
    loadTransactionsFromFirestore: jest.fn<() => Promise<unknown[]>>(() => {
      if (shouldFail) return Promise.reject(new Error('Firestore load failed'));
      return Promise.resolve(
        Array.isArray(firestoreData.transactions) ? firestoreData.transactions : emptyList(),
      );
    }),
    loadCategoriesFromFirestore: jest.fn<() => Promise<unknown[]>>(() => {
      if (shouldFail) return Promise.reject(new Error('Firestore load failed'));
      return Promise.resolve(
        Array.isArray(firestoreData.categories) ? firestoreData.categories : emptyList(),
      );
    }),

    // Control methods for testing
    setShouldFail: (fail: boolean) => {
      shouldFail = fail;
    },
    getFirestoreData: () => ({...firestoreData}),
    setFirestoreData: (data: TestFirestoreData) => {
      firestoreData = {...data};
    },
    clearFirestoreData: () => {
      firestoreData = {};
    },
  };
};

/**
 * Mock Auth Service for testing
 */
export const createMockAuthService = () => {
  let currentUser: TestUser | null = null;
  let isAuthenticated = false;

  return {
    getCurrentUser: jest.fn<() => TestUser | null>(() => currentUser),
    isUserAuthenticated: jest.fn<() => boolean>(() => isAuthenticated),
    signInWithEmail: jest.fn<(email: string) => Promise<{verificationId: string}>>((email) => {
      currentUser = {uid: 'test-uid', email, isAnonymous: false};
      isAuthenticated = true;
      return Promise.resolve({verificationId: email});
    }),
    signInWithPhone: jest.fn<(phoneNumber: string) => Promise<{verificationId: string}>>(
      (phoneNumber) => {
        currentUser = {uid: 'test-uid', phoneNumber, isAnonymous: false};
        isAuthenticated = true;
        return Promise.resolve({verificationId: phoneNumber});
      },
    ),
    signInWithGoogle: jest.fn<() => Promise<TestUser>>(() => {
      currentUser = {uid: 'test-uid', email: 'test@example.com', isAnonymous: false};
      isAuthenticated = true;
      return Promise.resolve(currentUser);
    }),
    signOut: jest.fn<() => Promise<void>>(() => {
      currentUser = null;
      isAuthenticated = false;
      return Promise.resolve();
    }),
    verifyOTP: jest.fn<(phoneNumber: string, otp: string) => Promise<AuthResult>>(
      (phoneNumber, otp) => {
        void phoneNumber;
        if (otp === '123456') {
          return Promise.resolve({user: currentUser});
        }
        return Promise.reject(new Error('Invalid OTP'));
      },
    ),
    verifyEmailOTP: jest.fn<(email: string, otp: string) => Promise<AuthResult>>((email, otp) => {
      void email;
      if (otp === '123456') {
        return Promise.resolve({user: currentUser});
      }
      return Promise.reject(new Error('Invalid OTP'));
    }),
    resendEmailOTP: jest.fn<(email: string) => Promise<void>>((email) => {
      void email;
      return Promise.resolve();
    }),
    resendOTP: jest.fn<(phoneNumber: string) => Promise<void>>((phoneNumber) => {
      void phoneNumber;
      return Promise.resolve();
    }),

    // Control methods for testing
    setCurrentUser: (user: TestUser | null) => {
      currentUser = user;
      isAuthenticated = !!user;
    },
    setAuthenticated: (authenticated: boolean) => {
      isAuthenticated = authenticated;
    },
  };
};

const isRecord = (value: unknown): value is TestStorageState => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// ============================================================================
// Test Environment Setup
// ============================================================================

/**
 * Sets up the test environment for context testing
 */
export const setupContextTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  const originalConsole = global.console;

  beforeEach(() => {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  afterEach(() => {
    global.console = originalConsole;
    jest.clearAllMocks();
  });

  // Mock timers for testing
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
};

/**
 * Creates a complete mock environment for context testing
 */
export const createMockEnvironment = () => {
  const storageService = createMockStorageService();
  const databaseService = createMockDatabaseService();
  const authService = createMockAuthService();

  return {
    storageService,
    databaseService,
    authService,

    // Convenience methods
    reset: () => {
      storageService.setStorage({});
      databaseService.clearFirestoreData();
      authService.setCurrentUser(null);
      jest.clearAllMocks();
    },

    setAuthenticatedUser: (user: TestUser = {uid: 'test-uid', isAnonymous: false}) => {
      authService.setCurrentUser(user);
    },

    setAnonymousUser: () => {
      authService.setCurrentUser({uid: 'anonymous-uid', isAnonymous: true});
    },

    simulateNetworkFailure: () => {
      databaseService.setShouldFail(true);
    },

    restoreNetwork: () => {
      databaseService.setShouldFail(false);
    },
  };
};

// ============================================================================
// Performance Testing Utilities
// ============================================================================

/**
 * Measures context performance metrics
 */
export const measureContextPerformance = () => {
  let renderCount = 0;
  let startTime = 0;
  let endTime = 0;

  return {
    startMeasurement: () => {
      renderCount = 0;
      startTime = performance.now();
    },

    recordRender: () => {
      renderCount++;
    },

    endMeasurement: (): PerformanceMeasurement => {
      endTime = performance.now();
      return {
        renderCount,
        duration: endTime - startTime,
        averageRenderTime: renderCount > 0 ? (endTime - startTime) / renderCount : 0,
      };
    },
  };
};

/**
 * Memory usage tracker for context testing
 */
export const createMemoryTracker = () => {
  let initialMemory = 0;

  return {
    start: () => {
      if (global.gc) {
        global.gc();
      }
      initialMemory = process.memoryUsage().heapUsed;
    },

    measure: (): MemoryMeasurement => {
      if (global.gc) {
        global.gc();
      }
      const currentMemory = process.memoryUsage().heapUsed;
      return {
        initial: initialMemory,
        current: currentMemory,
        difference: currentMemory - initialMemory,
        percentage: ((currentMemory - initialMemory) / initialMemory) * 100,
      };
    },
  };
};

export default {
  mockAsyncStorage,
  mockAuthService,
  mockFirestore,
  createMockStorageService,
  createMockDatabaseService,
  createMockAuthService,
  setupContextTestEnvironment,
  createMockEnvironment,
  measureContextPerformance,
  createMemoryTracker,
};
