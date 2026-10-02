# GEMINI.md

This file provides project standards, guidelines, and commands for Google Antigravity when working in this repository.

> See [AGENTS.md](file:///f:/prj/Buddy/AGENTS.md) and [.agent/rules/development-workflow.md](file:///f:/prj/Buddy/.agent/rules/development-workflow.md) for the complete guidelines.

## Project Overview

Buddy is a personal finance and expense-sharing mobile app built with React Native + Expo. It tracks transactions, budgets, loans, investments, savings goals, and group expense splitting. The project is in active development with no production users, so aggressive refactoring is acceptable and no backward compatibility is required.

## Essential Commands

```powershell
# Type checking (MANDATORY: must pass with 0 errors before concluding)
npx tsc --noEmit

# Linting and Formatting
npm run lint
npm run lint:fix
npm run format
npm run lint:all

# Testing
npm test
npm run test:unit
npm run test:integration

# Dependency Installation (ALWAYS use expo install)
npx expo install <package>
```

## Fast Android Build Path

```powershell
$env:GRADLE_USER_HOME = 'F:\.gradle'
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\ravik\AppData\Local\Android\Sdk'
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a
```

## Core Rules & Architecture

1. **Strict TypeScript**: Run `npx tsc --noEmit` and resolve all TypeScript errors before completing any task.
2. **No Backward Compatibility**: Delete dead code immediately; do not maintain deprecated shims or feature flags.
3. **Tamagui & Buddy UI First**: Use Tamagui v2 (`2.7.7`) with `@tamagui/config/v5` and `@ravitamil/buddy-ui` components (`Button`, `Card`, `FormField`, `Input`, `Text`, `YStack`, `XStack`) and design tokens (`$background`, `$surface`, `$text`, `$borderColor`, `$primary`). Never use raw React Native components when Tamagui/Buddy UI equivalents exist.
4. **Fluid Surface Design System**:
   - `ScreenContainer` owns background and atmosphere/blur.
   - `GlassSurface` owns elevated card styling (translucent tint, light-catching edge, 16–20pt radius).
   - Neutral surface by default; semantic washes only where documented.
5. **Modular Contexts**: Keep contexts domain-specific (`TransactionContext`, `BudgetContext`, `LoanContext`, `EnhancedGroupContext`, etc.). Coordinate via `CoordinationProvider`.
6. **No Raw Logging or Alerts**: Use `EnhancedLoggerService` (no `console.log`) and `ConfirmationDialog` via `useAlert` (no `Alert.alert`).
7. **Conventional Commits**: Format commits as `<type>(<scope>): <imperative description>`.
