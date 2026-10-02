process.env.EXPO_OS ??= 'ios';

const sharedProjectConfig = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|react-native-svg|tamagui|@tamagui))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ravitamil/buddy-ui$': '<rootDir>/packages/buddy-ui/src/index.ts',
    '^@ravitamil/buddy-ui/(.*)$': '<rootDir>/packages/buddy-ui/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['<rootDir>/.kilo/'],
};

module.exports = {
  preset: 'jest-expo',
  modulePathIgnorePatterns: ['<rootDir>/.kilo/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,jsx,ts,tsx}',
    '!src/test-setup.ts',
    '!src/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/.storybook/', '/coverage/', '/dist/', '/build/'],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|react-native-svg|tamagui|@tamagui))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ravitamil/buddy-ui$': '<rootDir>/packages/buddy-ui/src/index.ts',
    '^@ravitamil/buddy-ui/(.*)$': '<rootDir>/packages/buddy-ui/src/$1',
  },
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  maxWorkers: '50%',
  projects: [
    {
      ...sharedProjectConfig,
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/packages/buddy-ui/src/**/*.test.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '.*\\.integration\\.test\\.(js|jsx|ts|tsx)$',
        '.*\\.performance\\.test\\.(js|jsx|ts|tsx)$',
        '/src/__tests__/production/',
      ],
    },
    {
      ...sharedProjectConfig,
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/*.integration.test.{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: ['/src/__tests__/production/'],
    },
    {
      ...sharedProjectConfig,
      displayName: 'performance',
      testMatch: ['<rootDir>/src/**/*.performance.test.{js,jsx,ts,tsx}'],
    },
    {
      ...sharedProjectConfig,
      displayName: 'production',
      testMatch: ['<rootDir>/src/__tests__/production/**/*.test.{js,jsx,ts,tsx}'],
    },
  ],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
