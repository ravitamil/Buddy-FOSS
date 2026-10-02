# BuddyIO — Architecture Overhaul

## What This Is

BuddyIO is a personal finance and expense-sharing mobile app (React Native + Expo + Supabase). It tracks transactions, budgets, loans, investments, savings goals, and group expense splitting. The app is functionally feature-complete but architecturally fragile — vibecoded without consistent patterns, with data loss risks and significant dead weight. This project restructures the entire codebase to production quality while keeping all existing features intact.

## Core Value

Every user action must persist reliably to Supabase. No data loss on app restart, reinstall, or state reset. If the data layer isn't trustworthy, nothing else matters.

## Requirements

### Validated

<!-- Existing capabilities confirmed working in the codebase -->

- ✓ Transaction CRUD with Supabase persistence — existing (TransactionContext + SupabaseDatabaseService)
- ✓ Group expense splitting and settlement — existing (EnhancedGroupContext)
- ✓ Investment portfolio tracking — existing (InvestmentContext)
- ✓ Authentication (email, Google, anonymous, phone OTP) — existing (EnhancedAuthContext)
- ✓ Category management — existing (CategoryContext)
- ✓ Tamagui UI with light/dark themes — existing
- ✓ File-based routing with expo-router — existing

### Active

<!-- Architecture overhaul requirements -->

- [ ] All domain data syncs to Supabase (Wallet, Budget, Savings currently at risk of data loss)
- [ ] TanStack Query as the sole server-state management pattern
- [ ] React Context only for UI/client state (auth session, theme, settings, toast)
- [ ] CoordinationContext deleted entirely
- [ ] Service layer consolidated from ~53 to ~15-20 focused services
- [ ] Single logging system (pick one, delete the other two)
- [ ] All mock setTimeout implementations replaced with real logic or removed
- [ ] Screens decomposed to <400 lines each (extract hooks + subcomponents)
- [ ] HomeScreen re-render problem fixed (no single component consuming 10+ contexts)
- [ ] Unused dependencies removed (zustand, bootstrap-icons, react-day-picker, prop-types, etc.)
- [ ] AsyncStorage replaced by TanStack Query + MMKV persistence for server state
- [ ] Duplicate charting libraries consolidated (pick one of chart-kit/gifted-charts/skia)
- [ ] All `any` types in screens replaced with proper TypeScript types
- [ ] Budget tracking polling replaced with mutation-reactive updates
- [ ] No backward compatibility or migration code — clean break

### Out of Scope

- New features — this is purely an architecture and quality overhaul
- UI/UX redesign — keep existing look and feel
- Performance optimization beyond the re-render and polling fixes
- CI/CD pipeline changes
- Database schema changes (Supabase schema stays as-is)
- Web platform support

## Context

BuddyIO is a pre-launch app with no production users, built rapidly with AI assistance. This means:

- Aggressive refactoring is acceptable — no users to migrate
- No backward compatibility needed — delete old patterns freely
- The codebase is ~40K lines across 61 screens, 53 services, 21 contexts
- Three contexts already use TanStack Query correctly (Transaction, Group, Investment) — these serve as the reference pattern
- TanStack Query + MMKV persistence is already configured via QueryPersistenceProvider
- AsyncStorage is used in 29 files — all of these should migrate to TanStack Query cache

### Key Architecture Issues (from review)

1. **Data loss**: WalletContext, BudgetContext, SavingsContext store data in local state only — app reinstalls lose everything
2. **Dead infrastructure**: CoordinationContext (286 lines) provides event bus, migration manager, rollback data, legacy mode flags — all unused
3. **Inconsistent patterns**: Some contexts use TanStack Query, others use raw useState with manual loading/error state
4. **Service bloat**: 53 services, many are function collections masquerading as classes; 3 competing logging systems
5. **Screen monoliths**: Average 670 lines/screen, worst is 1,894 lines — business logic mixed with rendering
6. **Dependency waste**: ~100 dependencies, multiple unused or redundant ones
7. **Mock implementations**: 16 setTimeout fake syncs in production code

## Constraints

- **Tech stack**: React Native 0.81.5 + Expo SDK 54 + Tamagui v1.141 + Supabase + TypeScript 5.9 — no changes
- **Database**: Supabase schema stays as-is; service layer adapts to it
- **UI framework**: Tamagui exclusively — no raw React Native components
- **Windows environment**: Commands use PowerShell syntax
- **No expo start**: Dev server runs on port 8081 via EAS dev builds

## Key Decisions

| Decision                             | Rationale                                                                                 | Outcome   |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | --------- |
| TanStack Query for all server state  | Already used in 3/12 contexts; provides caching, invalidation, persistence out of the box | — Pending |
| Context API only for UI/client state | Separates concerns — server state from UI state; eliminates manual loading/error patterns | — Pending |
| Delete CoordinationContext           | Unused event bus, migration manager, rollback, legacy flags — pure dead weight            | — Pending |
| Consolidate to 1 logging system      | EnhancedLoggerService, LoggerService, and ExpoErrorReportingService do overlapping work   | — Pending |
| Ruthless service consolidation       | 53 services → 15-20 by merging function collections and deleting unused ones              | — Pending |
| No backward compatibility            | Zero production users means clean break — delete old patterns, no migration paths         | — Pending |

---

_Last updated: 2026-04-28 after codebase review_
