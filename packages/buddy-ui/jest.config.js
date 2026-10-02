module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {presets: ['babel-preset-expo']}],
  },
  transformIgnorePatterns: ['/node_modules/'],
};
