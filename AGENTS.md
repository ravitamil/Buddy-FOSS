# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Buddy is a personal finance and expense-sharing mobile app built with React Native + Expo. It tracks transactions, budgets, loans, investments, savings goals, and group expense splitting. The project is in active development with no production users, so aggressive refactoring is acceptable and no backward compatibility is required.

## Commands

```bash
# Type checking (run before concluding any changes)
npx tsc --noEmit

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Full quality gate (type-check + lint)
npm run lint:all

# Testing
npm test                              # all tests
npm run test:unit                     # unit tests only
npm run test:integration              # integration tests only
npm run test:performance              # performance tests only
npm run test:ci                       # CI mode with coverage

# Dependencies (always use expo install, never npm install or yarn add directly)
npx expo install <package>
```

## Architecture

### Stack

- **Framework**: React Native 0.86.0 with Expo SDK 57 (managed workflow, new architecture enabled)
- **Language**: TypeScript 6.0 (strict mode)
- **UI**: Tamagui v2 (2.7.7) with @tamagui/config/v5, custom design tokens, light/dark themes, and v5 shorthands (bg, br, p, m, etc.)
- **Navigation**: Expo Router v6 (`expo-router` package `~57.0.2`) with file-based routes in `app/`
- **Backend**: Supabase (Auth, PostgreSQL with RLS, Storage) — Firebase used secondarily for Google Sign-In
- **State**: React Context API with domain-specific modular contexts; TanStack React Query for server state with MMKV-encrypted persistence
- **Lists**: `@shopify/flash-list` for performant list rendering
- **Monetization**: RevenueCat + Superwall

### Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json and babel-plugin-module-resolver)

### Directory Layout

- `app/` — expo-router file-based routes. `(tabs)/` for 4-tab navigation (Home, Trackers, Groups, Settings). Dynamic routes like `groups/[id]/` for group screens. All screen headers hidden; `CustomNavigationHeader` used instead.
- `src/screens/` — Screen component implementations (~65 screens)
- `src/services/` — Business logic service layer (~50 services). `SupabaseDatabaseService.ts` is the primary data persistence layer.
- `src/context/` — React Context providers in a layered hierarchy (see `AppProviders.tsx`). Each context is domain-focused and exports a domain-specific hook (e.g., `useGroups`, `useBudget`, `useLoan`). All hooks re-exported from `src/context/index.ts`.
- `src/components/` — Reusable UI components organized by domain (`auth/`, `charts/`, `group/`, `loan/`, `ui/`, etc.)
- `src/workers/` — Web Worker for off-main-thread debt/split calculations (`debtCalculation.worker.ts`)
- `src/lib/supabase.ts` — Single Supabase client instance
- `src/types/` — TypeScript type definitions
- `src/utils/` — Utility functions
- `src/hooks/` — Custom hooks (~16)
- `supabase/` — Database schema (`schema.sql`), migrations, and edge functions

### Context Provider Hierarchy

Defined in `src/context/AppProviders.tsx`, providers are layered:

1. **Infrastructure**: QueryPersistenceProvider (TanStack Query + MMKV)
2. **Coordination**: CoordinationProvider (cross-context event bus)
3. **Auth/Identity**: EnhancedAuthProvider, UserProvider, SettingsProvider, MembershipProvider
4. **UI System**: TamaguiProvider, PortalProvider, SafeArea, BottomSheet, Toast, Alert
5. **Data**: WalletProvider, CategoryProvider, TransactionProvider
6. **Domain**: BudgetProvider, EnhancedGroupProvider, LoanProvider, SubscriptionProvider, InvestmentProvider, SavingsProvider
7. **Analytics**: FinancialAnalyticsProvider

### Key Patterns

- **Visual language** — Buddy uses the semi-translucent Fluid Surface system documented in
  `docs/fluid-surface-design-system.md`; do not describe or implement it as generic frosted glass.
- **Surface ownership** — `ScreenContainer` owns the background and blur target; `GlassSurface`
  owns standard Fluid Surface translucent tint, edge, radius, and depth. Feature components must compose these
  primitives instead of creating new blur/RGBA/shadow recipes.
- **No default React Native headers** — always use `CustomNavigationHeader`
- **No `Alert.alert`** — use `ConfirmationDialog` via the `useAlert` hook
- **No raw React Native components** when Tamagui equivalents exist
- **No monolithic contexts** — keep contexts focused on a single domain
- **No backward compatibility code** — delete old code immediately after refactoring
- `detachInactiveScreens: false` and `removeClippedSubviews: false` are set as safety guards for the React Native new architecture (Fabric)

### Custom ESLint Rules

Located in `eslint-rules/`:

- `context-patterns` — enforces proper context usage, prevents `AppContext` usage, validates provider order
- `development-quality` — enforces Tamagui usage, bans console statements, requires `ScreenWrapper` and `KeyboardAvoidingView`, enforces form field usage

### Testing

Jest 29 with 4 project types (unit, integration, performance, production). Test files use suffixes: `*.test.ts`, `*.integration.test.ts`, `*.performance.test.ts`. Setup in `src/test-setup.ts` mocks Expo, React Native, Firebase, Tamagui, and expo-router. Coverage threshold: 70%.

## Development Rules

- **Windows environment** — use PowerShell syntax for commands
- **Do not run `expo start`** — dev server runs continuously on port 8081 via EAS dev builds
- **Web platform is out of scope** — web bundling failures can be ignored
- **Use `npx expo install`** for all dependency installations
- **Fix all TypeScript errors** before ending a session
- **All components must support dark and light themes**
- **Always use Tamagui theme system** (`useTamaguiTheme`) for colors — never hardcode colors

### Fast Android Build Path

- Keep the user-level `GRADLE_USER_HOME` set to `F:\.gradle`. Buddy is on `F:`, so this allows native Gradle outputs to use same-volume hard links instead of slower cross-drive copies.
- For routine local Android proof, build only the device ABI from `android/`:

  ```powershell
  $env:GRADLE_USER_HOME = 'F:\.gradle'
  $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
  $env:ANDROID_HOME = 'C:\Users\ravik\AppData\Local\Android\Sdk'
  .\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a
  ```

- Target **under one minute** only for a warm, unchanged arm64 build; the verified baseline is about 36 seconds. A clean build, dependency change, Gradle cache miss, or invalidated native/C++ output will take longer and must not be reported as a one-minute build.
- Do not run `gradlew clean`, delete `android/**/build`, or clear `F:\.gradle` before routine builds unless the task specifically requires a clean rebuild. Preserving these outputs is what makes the sub-minute path possible.
- After changing the persistent environment variable, restart Android Studio and the terminal so they inherit `GRADLE_USER_HOME`.

## Version Control

### Commit Convention

Conventional Commits format:

```
<type>(<scope>): <imperative description>
```

- **Types**: `feat`, `fix`, `refactor`, `style`, `perf`, `test`, `docs`, `chore`, `build`
- **Scope**: domain area (`group`, `auth`, `budget`, `ui`, `db`, `navigation`, `context`, etc.)
- **Description**: lowercase, no period, imperative mood ("add" not "added"), max 50 chars
- **Body** (optional): wrap at 72 chars, explain _why_ not _what_
- No co-author trailer unless explicitly requested

### Branching

- `main` — stable, only receives merges from feature branches
- Feature branches: `<type>/<short-description>` (e.g., `fix/group-crash`, `feat/budget-filters`)
- Delete branches after merge

### Commit Discipline

- One logical change per commit — no dumping unrelated fixes together
- Commit after each meaningful unit of work (not once at end of session)
- Run `npx tsc --noEmit` before committing; fix all errors
- Never use `--no-verify` to skip hooks (unless committing pre-hook legacy code)
- Review the diff before staging — stage specific files, never `git add -A`
- Pre-commit hook runs lint-staged (ESLint + Prettier) automatically
- Commit message hook validates conventional commit format

<claude-mem-context>
# Memory Context

# [BuddyIO] recent context, 2026-09-04 12:35am GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (12,611t read) | 0t work

### Jun 21, 2026

S28 Phase 2 dependency upgrade: Complete Expo SDK 56 installation using pnpm package manager (Jun 21, 9:34 PM)
S25 Phase 2 dependency upgrade: Switch package manager from yarn to pnpm to resolve installation blockers (Jun 21, 9:34 PM)
S29 Phase 2 dependency upgrade: Verify pnpm installation completion and validate SDK 56 package versions (Jun 21, 9:34 PM)
S30 Phase 2 dependency upgrade: Fix pnpm-workspace.yaml configuration and complete installation (Jun 21, 9:36 PM)
S31 Codebase architecture audit and cleanup: remove redundant code, ensure proper organization, follow strict development patterns (Jun 21, 9:37 PM)

### Jul 3, 2026

S32 BuddyIO Phase 8 autonomous clean-structure hardening: audit codebase, remove redundant code, ensure proper organization and strict development patterns (Jul 3, 9:59 AM)
S33 Feature controls implementation complete; database migration blocked by auth issues (Jul 3, 10:01 AM)

### Jul 4, 2026

S35 Deploy feature controls migration to Supabase database (Jul 4, 8:13 PM)
S36 Deploy feature controls migration to Supabase database via Scoq-installed CLI (Jul 4, 8:19 PM)
S34 Deploy feature controls migration to Supabase database (Jul 4, 8:21 PM)

### Jul 5, 2026

504 3:53a 🔄 Additional require cycles identified in feature context providers
505 " 🔄 Systematic fixing of remaining barrel export imports causing require cycles
506 3:54a 🔄 Screen modules and feature context providers updated to complete require cycle elimination
507 " 🔵 Console warnings detected in React Native project
510 " 🔵 featureControls module widely imported across codebase
511 3:55a 🔄 Fixed import paths in authentication screen modules
512 " 🔴 Added explicit Tamagui module resolution to Metro config
508 3:56a 🔵 SafeAreaView search in node_modules times out
509 " 🔵 featureControls not imported in source code
513 3:57a 🔵 SafeAreaView implementation confirmed in react-native-safe-area-context
515 " 🔴 Completed comprehensive import path refactoring and Metro resolver configuration
517 " ✅ Code validation completed successfully
514 3:59a 🟣 Added email authentication with feature control guards
518 " 🔵 Keyboard handling implementation inconsistency across BuddyIO app
519 4:13a 🔵 CurrencySelectionScreen redundantly wraps with KeyboardProvider
520 4:14a 🔵 Multiple keyboard handling libraries and inconsistent patterns across screens
521 4:15a 🔵 Five screens use react-native core KeyboardAvoidingView instead of library components
522 " 🔵 Form section components have inconsistent internal ScrollView implementations
524 " 🟣 Centralized keyboard handling wrapper components enhanced with library integration
523 4:16a 🔵 Keyboard handling audit reveals inconsistent implementation across 15+ screens
525 4:17a 🟣 Keyboard handling wrapper implementation completed and verified
526 4:51a 🔵 Feature controls killswitch system discovered
527 " 🔵 Killswitch implementation uses multi-layer feature control system
528 " 🔵 Killswitch system architecture: Database-driven feature controls with multi-layer blocking
529 " 🔵 Cards feature entry points mapped across navigation hierarchy for killswitch testing
530 5:01a 🔄 Converted UI components to Tamagui-styled primitives
531 " 🔴 Fixed TypeScript error with CardProps interface extension
532 " 🔴 Fixed ESLint error in Button component normalizeChildren function
533 " 🔵 Tamagui utilization baseline established for buddy-ui package
534 8:36a 🔵 Discovered legacy React Native patterns requiring Tamagui migration
535 " ⚖️ Planned incremental Tamagui migration strategy for legacy component cleanup
539 8:37a ✅ Migration Slice 3/4 Complete
541 8:45a 🟣 Tamagui Migration Slice Complete
536 8:53a 🔵 Bottom nav bar audit initiated with mobile-first and Tamagui context
537 " 🔵 Mobile design framework loaded for bottom nav bar audit
538 8:54a 🔵 Bottom Navigation Bar Analysis Requested
545 " 🔵 Bottom Navigation Bar Theme and Feature Control System Discovered
547 " 🔵 Bottom Navigation Bar Implementation Completed - Full System Architecture Discovered
540 " 🔵 Bottom Navigation Bar Implementation Discovered
542 8:55a 🔵 DatePickerModal Component Legacy Pattern Analysis
543 " 🟣 Tamagui Migration Slice Validation Complete
544 " 🔵 Legacy Pattern Inventory Update
546 " ✅ DatePickerModal Migration Plan Initiated
548 " 🔵 DatePickerModal Legacy Pattern Count Confirmed
549 " ✅ DatePickerModal Migration Planning Initiated
550 " 🔵 DatePickerModal Migration Planning Research
551 " 🔵 DatePickerModal Migration Research Complete
552 8:56a 🔵 BuddyUI AppIcon Exports Confirmed
553 8:57a 🟣 DatePickerModal Tamagui Migration Complete
554 " 🟣 DatePickerModal Migration Formatted and Verified
</claude-mem-context>
