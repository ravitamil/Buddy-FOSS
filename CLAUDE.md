# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
