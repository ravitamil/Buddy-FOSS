module.exports = [
  {
    ignores: [
      'supabase/**',
      'functions/**',
      'android/**',
      'ios/**',
      '.expo/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'lib/**',
      'packages/*/lib/**',
      'tests/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {jsx: true},
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'context-patterns': require('./eslint-rules/context-patterns'),
      'development-quality': require('./eslint-rules/development-quality'),
    },
    rules: {
      ...require('@typescript-eslint/eslint-plugin').configs['recommended-requiring-type-checking']
        .rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',

      // Custom context pattern rules
      'context-patterns/no-app-context-usage': 'error',
      'context-patterns/enforce-context-patterns': 'warn',
      'context-patterns/context-provider-order': 'warn',
      'context-patterns/no-context-anti-patterns': 'error',
      'context-patterns/deprecation-warnings': 'warn',

      // Development quality rules
      'development-quality/enforce-screen-wrapper-usage': 'warn',
      'development-quality/no-console-statements': 'error',
      'development-quality/enforce-tamagui-usage': 'warn',
      'development-quality/enforce-component-ownership': 'error',
      'development-quality/no-raw-overlays': 'error',
      'development-quality/prefer-buddy-ui-components': 'error',
      'development-quality/enforce-keyboard-avoiding-view': 'warn',
      'development-quality/enforce-form-field-usage': 'warn',
    },
  },
  {
    files: ['eslint-rules/**/*.js', 'eslint.config.js', '.eslintrc.context-migration.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/buddy-ui/src/**/*.{ts,tsx}'],
    rules: {
      // These rules enforce BuddyIO application wrappers, not reusable package internals.
      'context-patterns/enforce-context-patterns': 'off',
      'development-quality/enforce-keyboard-avoiding-view': 'off',
      'development-quality/enforce-screen-wrapper-usage': 'off',
    },
  },
  {
    files: ['src/tooling/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
];
