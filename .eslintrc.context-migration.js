/**
 * ESLint Configuration for Context Migration
 * 
 * This configuration can be used during the context architecture migration
 * to gradually enforce new patterns while allowing legacy code to exist.
 */

module.exports = [
  // Base configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'context-patterns': require('./eslint-rules/context-patterns'),
    },
    rules: {
      ...require('@typescript-eslint/eslint-plugin').configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      
      // During migration phase - warnings only
      'context-patterns/no-app-context-usage': 'warn',
      'context-patterns/enforce-context-patterns': 'warn',
      'context-patterns/context-provider-order': 'warn',
      'context-patterns/no-context-anti-patterns': 'warn',
      'context-patterns/deprecation-warnings': 'warn',
    },
  },
  
  // Stricter rules for new context files
  {
    files: ['src/context/**/*.tsx', 'src/context/**/*.ts'],
    rules: {
      'context-patterns/no-app-context-usage': 'error',
      'context-patterns/enforce-context-patterns': 'error',
      'context-patterns/context-provider-order': 'error',
      'context-patterns/no-context-anti-patterns': 'error',
    },
  },
  
  // Allow legacy patterns in existing AppContext file during migration
  {
    files: ['src/context/AppContext.tsx'],
    rules: {
      'context-patterns/no-app-context-usage': 'off',
      'context-patterns/enforce-context-patterns': 'off',
      'context-patterns/no-context-anti-patterns': 'warn',
    },
  },
  
  // Stricter rules for test files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'context-patterns/no-app-context-usage': 'error',
      'context-patterns/enforce-context-patterns': 'error',
    },
  },
];