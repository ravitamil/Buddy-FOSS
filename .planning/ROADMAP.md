# Roadmap: BuddyIO Architecture Overhaul

## Overview

Transform BuddyIO from a vibecoded prototype with 20 context providers, 53 services, and fragile data persistence into a production-quality architecture with TanStack Query as the sole server-state manager, 5 providers, ~15 domain services, and feature-first directory structure. The app builds and runs after every phase. No production users exist, so each phase merges to main with type-check gates as the safety net.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Infrastructure Fixes and Quick Wins** - Fix QueryClient defaults, build query key factory, remove artificial delays, clean dead dependencies
- [ ] **Phase 2: Logging and Error Handling Consolidation** - Merge three logging systems into one, unify error boundary pattern
- [ ] **Phase 3: Financial Core Migration** - Migrate categories, wallets, and transactions to TanStack Query with optimistic updates
- [x] **Phase 4: Budget and Group Migration** - Migrate budget and group contexts with cross-entity cache invalidation
- [x] **Phase 5: Remaining Domain Contexts** - Migrate loans, investments, savings, and subscriptions to TanStack Query
- [x] **Phase 6: Analytics, Coordination Cleanup, and Service Consolidation** - Convert analytics to derived queries, delete CoordinationContext, reorganize services into feature modules
- [x] **Phase 7: Screen Decomposition and Code Quality** - Decompose all screens to under 400 lines, eliminate any types, remove console statements, clean legacy code
- [ ] **Phase 8: Clean Structure Hardening** - Reconcile roadmap completion with live code by finishing screen module decomposition, retiring domain context bridges, consolidating feature-owned services, and restoring lint/format/unit quality gates

## Phase Details

### Phase 1: Infrastructure Fixes and Quick Wins

**Goal**: The foundation for all subsequent migrations is correct, and the most obvious code defects are removed
**Depends on**: Nothing (first phase)
**Requirements**: DATA-02, DATA-07, DATA-08, DATA-10, ARCH-08, DEPS-01, DEPS-02, DEPS-03, DEPS-04
**Success Criteria** (what must be TRUE):

1. QueryClient has `networkMode: 'offlineFirst'`, entity-appropriate gcTime values, and `shouldDehydrateMutation` only persists pending mutations -- app cold-starts from MMKV cache without stale 7-day data
2. Centralized hierarchical query key factory exists at `src/lib/query-keys.ts` with key families for every domain (transactions, budgets, groups, loans, investments, savings, subscriptions, categories, wallets, analytics)
3. All 16 mock `setTimeout` implementations in production code are replaced with real logic or removed -- no artificial delays remain anywhere in the codebase
4. Unused packages removed: zustand, bootstrap-icons, react-day-picker, prop-types, react-native-web, text-encoding, duplicate charting library, duplicate gradient library, Playwright dependencies
5. MMKV mutation persistence queues offline writes and replays them on reconnect; AsyncStorage is no longer used as a persistence layer for any domain data
   **Plans**: 5 plans in 2 waves

Plans:

- [ ] 01-01-PLAN.md -- Fix QueryClient defaults (gcTime, networkMode, selective mutation persistence) and MMKV encryption key
- [ ] 01-02-PLAN.md -- Create centralized query key factory and migrate 4 existing TanStack Query contexts
- [ ] 01-03-PLAN.md -- Remove all mock setTimeout from BudgetContext, WalletContext, CoordinationContext
- [ ] 01-04-PLAN.md -- Migrate 8 chart-kit screens to gifted-charts and remove unused packages
- [ ] 01-05-PLAN.md -- Create offline mutation queue and replace AsyncStorage with MMKV in domain services

### Phase 2: Logging and Error Handling Consolidation

**Goal**: The codebase has a single logging system and a single error boundary pattern, so all subsequent phases log and report errors consistently
**Depends on**: Phase 1
**Requirements**: ARCH-06, ARCH-07
**Success Criteria** (what must be TRUE):

1. EnhancedLoggerService is the sole logging system -- LoggerService and ExpoErrorReportingService are deleted with no remaining imports
2. Single error boundary pattern (EnhancedErrorBoundary) handles all error states -- the other three competing implementations are removed
3. Console.log/warn/error/debug statements are removed from all production code; all logging flows through the single logger
   **Plans**: TBD

Plans:

- [ ] 02-01: Consolidate to single logging system
- [ ] 02-02: Unify error boundary pattern

### Phase 3: Financial Core Migration

**Goal**: Categories, wallets, and transactions are managed entirely by TanStack Query, providing the stable foundation that budgets, groups, and analytics depend on
**Depends on**: Phase 1, Phase 2
**Requirements**: DATA-01 (categories, wallets, transactions slice), DATA-03, DATA-04, ARCH-09
**Success Criteria** (what must be TRUE):

1. CategoryContext, WalletContext, and TransactionContext no longer hold server data in useState/useReducer -- all server state flows through TanStack Query hooks with queryOptions and mutationOptions patterns
2. Creating, editing, and deleting a transaction shows the change instantly via optimistic update, then confirms against Supabase
3. Zod schemas validate Supabase responses at the service boundary for transactions, categories, and wallets -- malformed data throws a validation error instead of silently corrupting app state
4. The app builds, runs, and all existing transaction/category/wallet functionality works identically to before the migration
   **Plans**: TBD

Plans:

- [ ] 03-01: Migrate CategoryContext to TanStack Query
- [ ] 03-02: Migrate WalletContext to TanStack Query
- [ ] 03-03: Migrate TransactionContext to TanStack Query with optimistic updates
- [ ] 03-04: Add Zod validation at Supabase service boundaries

### Phase 4: Budget and Group Migration

**Goal**: Budget tracking and group expense splitting use TanStack Query with correct cross-entity invalidation, so budget data reacts to transaction changes and group expenses appear in the global transaction feed immediately
**Depends on**: Phase 3
**Requirements**: DATA-01 (budget, group slice), DATA-05, DATA-06, DATA-09
**Success Criteria** (what must be TRUE):

1. BudgetContext migrated to TanStack Query -- budget tracking calculations consume transaction data via TanStack Query, not direct context calls; the 5-minute polling interval is gone
2. EnhancedGroupContext migrated to TanStack Query -- group expense mutations invalidate both group queries and transaction queries, so group expenses appear on HomeScreen immediately
3. Cross-entity invalidation map is wired: every transaction mutation invalidates budget and analytics queries; every group expense mutation invalidates transaction queries
4. Supabase realtime subscriptions deliver group expense changes to all group members without manual refresh
5. App builds and runs with budget tracking, group splitting, and the HomeScreen transaction feed all working correctly
   **Plans**: 4 plans

Plans:

- [x] 04-01: Migrate BudgetContext with cross-entity invalidation
- [x] 04-02: Migrate EnhancedGroupContext with transaction invalidation
- [x] 04-03: Add Supabase realtime subscriptions for groups
- [x] 04-04: Integration test cross-entity invalidation

### Phase 5: Remaining Domain Contexts

**Goal**: All remaining domain contexts (loans, investments, savings, subscriptions) are migrated to TanStack Query, completing the transition away from React Context for server state
**Depends on**: Phase 3
**Requirements**: DATA-01 (loans, investments, savings, subscriptions slice)
**Success Criteria** (what must be TRUE):

1. LoanContext, InvestmentContext, SavingsContext, and SubscriptionContext no longer hold server data in useState/useReducer -- all server state flows through TanStack Query hooks
2. All CRUD operations for loans (including EMI calculations), investments, savings goals, and subscriptions show optimistic updates
3. App builds and runs with all domain features (loan tracking, investment portfolio, savings goals, subscription management) working identically to before
4. 6/6 data contexts successfully migrated (Budget, Wallet, User, Loan, Subscription, Savings) ✓
5. Membership, Settings, Toast, Coordination, Auth, Analytics, and UI contexts not migrated (infrastructure/preferences layers, not data contexts)
   **Plans**: TBD

Plans:

- [x] 05-01: Migrate LoanContext to TanStack Query
- [x] 05-02: Migrate InvestmentContext to TanStack Query
- [x] 05-03: Migrate SavingsContext to TanStack Query
- [x] 05-04: Migrate SubscriptionContext to TanStack Query

### Phase 6: Analytics, Coordination Cleanup, and Service Consolidation

**Goal**: The analytics layer is a thin derived hook over other query caches, CoordinationContext is deleted, services are reorganized into feature-first domain modules, and the provider tree is reduced to ~5 levels
**Depends on**: Phase 4, Phase 5
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-10, ARCH-11
**Success Criteria** (what must be TRUE):

1. FinancialAnalyticsContext deleted -- analytics is a derived hook that computes over transaction, category, and budget query caches, not a separate query or context
2. CoordinationContext deleted entirely -- event bus, migration manager, rollback data, and legacy flags removed; all consumers use TanStack Query invalidation and `useIsFetching()`/`useIsMutating()` instead
3. Feature-first directory structure in place at `src/features/{domain}/` with each module owning its queries, mutations, service, types, and components
4. SupabaseDatabaseService decomposed into domain-specific service functions; total services reduced from ~53 to 15-17 focused modules
5. Provider nesting reduced to ~5 levels: QueryPersistence, Auth, Tamagui, SafeArea, Toast -- React Context is limited to auth, user/settings, theme, toast/alert, and navigation infrastructure
   **Plans**: 6 plans in 3 waves

Plans:

- [x] 06-01-PLAN.md -- Convert FinancialAnalyticsContext to derived hooks and delete provider (Wave 1)
- [x] 06-02-PLAN.md -- Delete CoordinationContext, migrate BackupSyncScreen to queryClient.invalidateQueries, delete support utilities (Wave 1)
- [x] 06-03-PLAN.md -- Decompose SupabaseDatabaseService into 11 domain-specific database service modules (Wave 1)
- [x] 06-04-PLAN.md -- Create feature-first directory structure at src/features/{domain}/ with queries, mutations, service, types (Wave 2, depends on 06-03)
- [x] 06-06-PLAN.md -- Create feature modules for loans, savings, subscriptions, investments (Wave 2, depends on 06-03, 06-04)
- [x] 06-05-PLAN.md -- Verify provider tree cleanup, document reduced hierarchy (Wave 3, depends on 06-01, 06-02)

### Phase 7: Screen Decomposition and Code Quality

**Goal**: Every screen is under 400 lines, HomeScreen consumes fewer than 5 hooks, all `any` types are gone, and no backward compatibility code remains
**Depends on**: Phase 6
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05
**Success Criteria** (what must be TRUE):

1. Every screen file is under 400 lines -- business logic extracted into hooks, UI sections extracted into subcomponents within their feature module's components directory
2. HomeScreen consumes fewer than 5 hooks via extracted subcomponents instead of directly accessing 10+ contexts
3. Zero `any` types remain in any screen file -- all replaced with proper TypeScript types from domain type definitions
4. Zero backward compatibility code, migration paths, or legacy shims exist anywhere in the codebase
5. Budget tracking uses mutation-reactive invalidation exclusively -- no polling interval remains
   **Plans**: TBD

Plans:

- [x] 07-01-PLAN.md -- Decompose first high-value screen slice: PortfolioAnalyticsScreen
- [x] 07-02: Fix HomeScreen to consume fewer than 5 hooks
- [x] 07-03: Replace all `any` types in screens with proper TypeScript types
- [x] 07-04: Remove all backward compatibility code and legacy shims
- [x] 07-05-PLAN.md -- Decompose investment and savings screens over 400 lines
- [x] 07-06-PLAN.md -- Decompose subscription and loan screens over 400 lines
- [x] 07-07-PLAN.md -- Decompose group screens over 400 lines
- [x] 07-08-PLAN.md -- Decompose remaining transaction, category, budget, settings, support, onboarding, notification, and diagnostic screens

### Phase 8: Clean Structure Hardening

**Goal**: The live repository matches the intended clean architecture instead of only satisfying route-wrapper metrics: screen implementation bodies are small, domain state no longer flows through context bridges, domain services are owned by feature modules, old compatibility paths are removed, and lint/format/unit gates are usable again.
**Depends on**: Phase 7
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, DEPS-01
**Success Criteria** (what must be TRUE):

1. No implementation file in `src/screens` or `src/screenModules` exceeds 400 lines unless documented as an intentional exception
2. `AppProviders` contains only infrastructure and user-preference providers; domain server state flows through TanStack Query hooks
3. Domain database/service ownership lives under `src/features/{domain}`; root `src/services` contains only infrastructure/integration services
4. Full type, integration, lint, format, and unit gates are either green or remaining failures are tracked with explicit owner and reason
5. Legacy compatibility comments, AppContext references, obsolete migration shims, and unused dependencies are removed
   **Plans**: 7 waves

Plans:

- [x] 08-BASELINE.md -- Capture dirty-tree, validation, screen-size, and lint-debt baseline
- [ ] 08-01 -- Repair tooling and test gates
- [ ] 08-02 -- Retire domain context bridges
- [ ] 08-03 -- Move domain services into feature ownership
- [ ] 08-04 -- Decompose remaining screen modules
- [ ] 08-05 -- Burn down type-aware ESLint debt
- [ ] 08-06 -- Remove legacy/storage compatibility leftovers

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase                                                         | Plans Complete | Status   | Completed  |
| ------------------------------------------------------------- | -------------- | -------- | ---------- |
| 1. Infrastructure Fixes and Quick Wins                        | 0/5            | Planned  | -          |
| 2. Logging and Error Handling Consolidation                   | 2/2            | Complete | 2026-05-01 |
| 3. Financial Core Migration                                   | 4/4            | Complete | 2026-05-01 |
| 4. Budget and Group Migration                                 | 4/4            | Complete | 2026-05-02 |
| 5. Remaining Domain Contexts                                  | 4/4            | Complete | 2026-05-02 |
| 6. Analytics, Coordination Cleanup, and Service Consolidation | 6/6            | Complete | 2026-05-02 |
| 7. Screen Decomposition and Code Quality                      | 8/8            | Complete | 2026-05-03 |
| 8. Clean Structure Hardening                                  | 1/7            | Active   | -          |
