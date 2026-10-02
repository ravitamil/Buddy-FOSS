# Requirements: BuddyIO Architecture Overhaul

**Defined:** 2026-04-28
**Core Value:** Every user action must persist reliably to Supabase. No data loss.

## v1 Requirements

Requirements for architecture overhaul. Each maps to roadmap phases.

### Data Layer

- [ ] **DATA-01**: All domain data (transactions, groups, budgets, loans, investments, savings, subscriptions, categories, wallets) syncs to Supabase via TanStack Query
- [ ] **DATA-02**: Query key factory provides centralized cache management for all domains with hierarchical invalidation
- [ ] **DATA-03**: `queryOptions` pattern used for all domain queries (v5 colocated config)
- [ ] **DATA-04**: `mutationOptions` pattern used for all domain mutations with optimistic updates
- [ ] **DATA-05**: Cross-entity cache invalidation wired correctly (transaction mutations invalidate budgets, groups, analytics)
- [ ] **DATA-06**: Budget tracking calculations consume transaction data via TanStack Query, not direct context calls
- [ ] **DATA-07**: Offline-first mutation queuing — writes queue in MMKV and replay on reconnect
- [ ] **DATA-08**: MMKV persistence configured correctly for React Native (networkMode, gcTime, maxAge)
- [ ] **DATA-09**: Supabase realtime subscriptions for group expense changes
- [ ] **DATA-10**: AsyncStorage removed as a persistence layer for all domain data

### Architecture

- [ ] **ARCH-01**: React Context limited to: Auth, User/Settings, Tamagui theme, Toast/Alert, SafeArea/BottomSheet
- [ ] **ARCH-02**: CoordinationContext deleted entirely (event bus, migration manager, rollback data, legacy flags removed)
- [ ] **ARCH-03**: Feature-first directory structure (`src/features/{domain}/` with queries, mutations, service, components, types)
- [ ] **ARCH-04**: Services consolidated from ~53 to ~15-17 focused domain services
- [ ] **ARCH-05**: SupabaseDatabaseService decomposed — domain-specific service functions replace the monolithic class
- [ ] **ARCH-06**: Single logging system (EnhancedLoggerService remains, LoggerService and ExpoErrorReportingService deleted)
- [ ] **ARCH-07**: Single error boundary pattern (unified from 4 competing implementations)
- [ ] **ARCH-08**: All 16 mock setTimeout implementations replaced with real logic or removed
- [ ] **ARCH-09**: Zod runtime validation at service boundaries (Supabase <-> Service)
- [ ] **ARCH-10**: Provider nesting reduced from 16 levels to ~5 (QueryPersistence, Auth, Tamagui, SafeArea, Toast)
- [ ] **ARCH-11**: FinancialAnalyticsContext converted to derived queries (not a separate context/query)

### Code Quality

- [ ] **QUAL-01**: All screens decomposed to <400 lines (extract hooks, subcomponents, container/presentational pattern)
- [ ] **QUAL-02**: HomeScreen consumes <5 hooks via extracted subcomponents instead of 10 contexts
- [ ] **QUAL-03**: Budget tracking 5-minute polling interval removed — replaced with mutation-reactive invalidation
- [ ] **QUAL-04**: All `any` types in screens replaced with proper TypeScript types
- [ ] **QUAL-05**: No backward compatibility code, migration paths, or legacy shims anywhere
- [ ] **QUAL-06**: Console.log/warn/error/debug statements removed from production code (use logger)

### Dependencies

- [ ] **DEPS-01**: Remove unused packages: zustand, bootstrap-icons, react-day-picker, prop-types, react-native-web, text-encoding
- [ ] **DEPS-02**: Consolidate charting libraries to one (evaluate chart-kit vs gifted-charts, remove Skia if only used for charts)
- [ ] **DEPS-03**: Remove duplicate gradient libraries (expo-linear-gradient vs react-native-linear-gradient)
- [ ] **DEPS-04**: Remove Playwright dependencies (no e2e test infrastructure exists)

## Out of Scope

| Feature                         | Reason                                                        |
| ------------------------------- | ------------------------------------------------------------- |
| New user-facing features        | This is purely an architecture overhaul                       |
| UI/UX redesign                  | Keep existing look and feel                                   |
| Database schema changes         | Supabase schema stays as-is                                   |
| CI/CD pipeline changes          | Out of scope for this milestone                               |
| Web platform support            | Already explicitly excluded                                   |
| Full SQLite offline sync engine | Over-engineering — TanStack Query mutation queuing sufficient |
| Event sourcing                  | Over-engineering for current scale                            |
| Micro-frontends                 | Over-engineering for single dev app                           |
| XState for state machines       | Over-engineering — TanStack Query handles state               |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| DATA-01     | 3, 4, 5 | Pending |
| DATA-02     | 1       | Pending |
| DATA-03     | 3       | Pending |
| DATA-04     | 3       | Pending |
| DATA-05     | 4       | Pending |
| DATA-06     | 4       | Pending |
| DATA-07     | 1       | Pending |
| DATA-08     | 1       | Pending |
| DATA-09     | 4       | Pending |
| DATA-10     | 1       | Pending |
| ARCH-01     | 6       | Pending |
| ARCH-02     | 6       | Pending |
| ARCH-03     | 6       | Pending |
| ARCH-04     | 6       | Pending |
| ARCH-05     | 6       | Pending |
| ARCH-06     | 2       | Pending |
| ARCH-07     | 2       | Pending |
| ARCH-08     | 1       | Pending |
| ARCH-09     | 3       | Pending |
| ARCH-10     | 6       | Pending |
| ARCH-11     | 6       | Pending |
| QUAL-01     | 7       | Pending |
| QUAL-02     | 7       | Pending |
| QUAL-03     | 4       | Pending |
| QUAL-04     | 7       | Pending |
| QUAL-05     | 7       | Pending |
| QUAL-06     | 2       | Pending |
| DEPS-01     | 1       | Pending |
| DEPS-02     | 1       | Pending |
| DEPS-03     | 1       | Pending |
| DEPS-04     | 1       | Pending |

**Coverage:**

- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

**Note on DATA-01:** This requirement spans the entire data layer migration and is delivered across Phases 3 (categories, wallets, transactions), 4 (budgets, groups), and 5 (loans, investments, savings, subscriptions). Each phase delivers its slice completely.

---

_Requirements defined: 2026-04-28_
_Last updated: 2026-04-28 after roadmap creation_
