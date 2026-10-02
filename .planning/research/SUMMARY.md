# Project Research Summary

**Project:** BuddyIO
**Domain:** Personal finance / expense-sharing React Native app -- architecture overhaul of data layer
**Researched:** 2026-04-28
**Confidence:** HIGH

## Executive Summary

BuddyIO is a personal finance and expense-sharing mobile app (React Native + Expo + Supabase) that has grown to 20 context providers, 53 services, and 65 screens without a consistent data layer architecture. The primary technical debt is that 16 of 20 React Context providers hold server-fetched data in `useState`/`useReducer` instead of using TanStack Query v5, which is already installed and partially configured. This creates dual sources of truth (context state vs TanStack Query cache), race conditions from 16 artificial `setTimeout` delays in production code, and a 1356-line monolithic `SupabaseDatabaseService` that handles persistence for all 8 financial domains. The app has no production users, making aggressive refactoring safe.

The recommended approach is a phased migration from Context-based server state to TanStack Query as the sole server state manager, using `queryOptions` as the primary data abstraction, hierarchical query key factories for cache invalidation, and optimistic updates with `onMutate`/`onError`/`onSettled` for all mutations. The architecture shifts from 20 providers to 5, from a flat service directory to feature-first domain modules, and from giant screen files (1894 lines max) to 300-line screen containers composed from feature components. Zod validation is added at the Supabase-to-app boundary to guarantee data integrity for financial data.

Key risks center on cross-entity dependencies: BudgetContext reads live transaction state, FinancialAnalyticsContext consumes three other contexts, and EnhancedGroupContext creates transactions without invalidating the transaction query cache. The mitigation is migrating contexts in dependency-order vertical slices (categories/wallets first, then transactions, then budget+group together, analytics last) and wiring cross-entity invalidation in every mutation's `onSettled`. The biggest single risk is data loss during AsyncStorage-to-MMKV migration for BudgetContext, requiring a one-time migration script.

## Key Findings

### Recommended Stack

All core dependencies are already installed. No new runtime packages are required except Zod for data validation.

**Core technologies:**

- **@tanstack/react-query ^5.90.21**: Sole server state manager -- replaces `useState`/`useReducer` for server data in 16 contexts. Provides caching, background refetch, optimistic updates, and offline persistence out of the box.
- **@tanstack/react-query-persist-client ^5.90.22**: Persists query cache to encrypted MMKV storage for offline-first behavior and instant cold-start hydration.
- **react-native-mmkv-storage ^12.0.1**: Encrypted key-value storage for persisted query cache. ~30x faster than AsyncStorage. Already wired with encryption.
- **zod**: Schema validation at Supabase response boundary. Finance data correctness requires runtime validation, not just TypeScript casts.
- **@react-native-community/netinfo ^11.x**: Network status detection for TanStack Query's `onlineManager`. Already wired in `QueryPersistenceProvider`.

**Critical configuration fix needed:** Add `networkMode: 'offlineFirst'` to QueryClient defaults and reduce `gcTime` from 7 days to per-entity values (30 min to 24 hours). Change `shouldDehydrateMutation` to only persist pending mutations, not all completed ones.

### Expected Features

**Must have (table stakes -- architecture integrity):**

- Single source of truth for server state (TanStack Query replaces `useState` server data in all 16 contexts)
- Consolidated logging system (merge 3 logging services into 1)
- Unified error boundary pattern (keep EnhancedErrorBoundary, delete 3 others)
- Data validation at Supabase boundary (Zod schemas for Transaction, Group, Budget, Loan, etc.)
- Remove 16 artificial `setTimeout` delays in production code (eliminates race conditions)
- Consistent service layer pattern (stateless function modules, not mixed singletons/static classes)
- Query key factory (centralized hierarchical keys for surgical cache invalidation)

**Should have (differentiators -- reliability and UX):**

- Domain-organized custom query hooks replacing context-based data access
- Offline write queue with conflict resolution (mutation persistence + replay on reconnect)
- Supabase realtime subscription manager (fine-grained invalidation, not coarse-grained)
- Structured error types with recovery hints (NetworkError, AuthError, ValidationError, etc.)
- Network-aware data freshness (per-entity staleTime based on change frequency)

**Defer (v2+ or when data warrants):**

- Full offline-first SQLite sync engine (PowerSync/WatermelonDB) -- TanStack Query persistence gives 90% benefit at 20% complexity
- Event-sourced/CQRS architecture -- Supabase timestamps + soft deletes suffice for this scale
- XState machines for every entity lifecycle -- only justified for group settlement workflow
- Realtime subscriptions on every table -- only collaborative features (group expenses) need it

### Architecture Approach

The target architecture is feature-first domain modules (`src/features/{domain}/`) where each module owns its queries, mutations, types, service functions, and UI components. Screens remain separate as route-level composites that import from feature modules. Five providers replace 20: QueryClient (with MMKV persistence), Auth (Supabase session), Theme (Tamagui), Navigation infrastructure (SafeArea/BottomSheet/Toast/Alert), and Settings (user preferences). All server state flows through TanStack Query hooks; contexts hold only genuine client state.

**Major components:**

1. **Feature modules** (`src/features/{domain}/`) -- each domain (transactions, groups, loans, budgets, savings, investments, subscriptions, categories, wallets, analytics) owns its `queries.ts`, `mutations.ts`, `types.ts`, `service.ts`, and `components/`
2. **Query key factory** (`src/lib/query-keys.ts`) -- centralized hierarchical keys enabling surgical invalidation across domain boundaries
3. **Domain services** -- thin async functions per domain replacing the monolithic `SupabaseDatabaseService.ts` (1356 lines, 40+ methods)
4. **Screen containers** (`src/screens/`) -- max 300 lines, compose feature components and call query/mutation hooks directly
5. **Provider layer** (`src/providers/`) -- 5 providers: Query, Auth, Theme, Navigation, Settings

### Critical Pitfalls

1. **Budget-Transaction cross-entity dependency** -- BudgetContext's 300-line `calculateTrackingData` reads live transaction state. If they migrate in separate phases, budget tracking shows zeros or stale data. Migrate both in the same phase with explicit cross-invalidation in every transaction mutation's `onSettled`.

2. **Group expenses invisible in global transaction feed** -- EnhancedGroupContext creates Transaction objects but only invalidates group queries, not transaction queries. After migration, group expenses disappear from HomeScreen for up to 5 minutes. Fix by adding `invalidateQueries(transactionKeys.all())` to every group expense mutation.

3. **AsyncStorage-to-MMKV data loss** -- BudgetContext stores data at `@BuddyApp:budgets` in AsyncStorage. TanStack Query's MMKV persister stores serialized query cache, not raw domain data. Without a one-time migration script, users lose budget data on update. Must read AsyncStorage, populate query cache, then clear AsyncStorage key.

4. **Removing CoordinationContext too early** -- It provides global loading state and event bus used by BackupSyncScreen, AutoTransactionInitializer, and several contexts. Remove only after all consumers are migrated to TanStack Query invalidation and `useIsFetching()`/`useIsMutating()` replace global loading.

5. **gcTime of 7 days causing memory pressure** -- Current 7-day default keeps all query results in memory for a week, plus `shouldDehydrateMutation: () => true` persists every completed mutation. On low-end devices this causes sluggish startup and growing MMKV files. Set per-entity gcTime (30 min to 24 hours) and only persist pending mutations.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Infrastructure Fixes and Quick Wins

**Rationale:** Zero-risk changes that fix bugs (race conditions, memory pressure, security) and create the foundation all later phases depend on. These have no cross-dependencies and can be merged immediately.
**Delivers:** Corrected QueryClient defaults, centralized query key factory, one-time data migration safety net, removed artificial delays
**Addresses:** Features F5 (remove delays), F4 (Zod validation), F11 (query key factory)
**Avoids:** Pitfalls P5 (AsyncStorage data loss), P6 (gcTime memory pressure)

### Phase 2: Logging and Error Handling Consolidation

**Rationale:** Logging and error boundaries are standalone systems used by every other layer. Consolidating them before the data layer overhaul means the new architecture starts clean, and error boundaries can consume structured errors from day one.
**Delivers:** Single logger, single error boundary pattern, structured error types
**Addresses:** Features F2 (consolidated logging), F3 (unified error boundary), F10 (structured error types)
**Avoids:** Circular logging references that would complicate debugging during later phases

### Phase 3: Financial Core Migration (Transactions + Categories + Wallets)

**Rationale:** Categories and wallets have no cross-entity dependencies and are the simplest migrations. Transactions are the foundational entity that budgets, groups, and analytics all depend on. Completing this slice first means all dependent features can build on stable transaction queries.
**Delivers:** CategoryContext, WalletContext, and TransactionContext migrated to TanStack Query hooks with optimistic updates
**Addresses:** Feature F1 (single source of truth -- first slice), F8 (domain query hooks -- first slice)
**Avoids:** Pitfall P7 (HomeScreen mixed loading states) by migrating the three most-consumed contexts together

### Phase 4: Budget + Group Migration (Cross-Entity Invalidation)

**Rationale:** BudgetContext reads transaction state; EnhancedGroupContext creates transactions. Both must be migrated with explicit cross-invalidation wired to the transaction query key. This is the highest-risk phase due to the budget-transaction dependency.
**Delivers:** BudgetContext and EnhancedGroupContext migrated; cross-entity invalidation map implemented; group expenses visible in global transaction feed immediately
**Addresses:** Feature F1 (single source of truth -- second slice), F9 (realtime subscription manager foundation)
**Avoids:** Pitfalls P1 (budget-transaction dependency), P3 (group-transaction invalidation gap)

### Phase 5: Remaining Domain Contexts

**Rationale:** LoanContext, InvestmentContext, SavingsContext, and SubscriptionContext are relatively independent CRUD domains. LoanContext is the most complex due to EMI calculations but has no cross-entity dependencies beyond analytics.
**Delivers:** All remaining domain contexts migrated to TanStack Query; 20 providers reduced to 5
**Addresses:** Feature F1 (single source of truth -- final slice), F6 (consistent service layer)

### Phase 6: Analytics, Coordination Cleanup, and Service Consolidation

**Rationale:** FinancialAnalyticsContext is a pure derived view over transactions, categories, and budgets -- it must migrate last after all three sources are stable. CoordinationContext can only be removed after every consumer is off the event bus. Service consolidation is clearer once contexts no longer depend on service methods directly.
**Delivers:** Analytics as derived hook (not a query); CoordinationContext removed; services reorganized into domain modules; `src/context/` directory deleted
**Addresses:** Feature F7 (offline write queue foundation), F12 (network-aware freshness)
**Avoids:** Pitfalls P2 (analytics cascade), P4 (CoordinationContext premature removal), P8 (service consolidation errors)

### Phase 7: Screen Decomposition

**Rationale:** With the data layer stable and feature modules in place, screen decomposition can extract components into their feature module's `components/` directory. Doing this after data layer migration means screens already use the new hooks and don't need a second pass.
**Delivers:** All screens under 400 lines; domain components extracted to feature modules
**Addresses:** Architecture pattern 4 (screen decomposition)

### Phase Ordering Rationale

- Infrastructure first because incorrect gcTime and missing `networkMode: 'offlineFirst'` affect every query added later
- Financial core (transactions) before budget and group because both depend on transaction query cache
- Budget and group in the same phase because budget tracking reads live transaction data and group mutations create transactions
- Analytics last because it is a pure consumer of transaction + category + budget query results
- Screen decomposition last because screens should only be refactored once, against the stable data layer
- CoordinationContext removed late because it has the broadest consumer surface area

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (Budget + Group):** Cross-entity invalidation map is sketched but needs exact mutation-to-query-key mapping. Budget tracking as a derived computation over two TanStack Query caches has no canonical pattern in TanStack docs.
- **Phase 6 (Offline Write Queue):** TanStack Query offline mutation persistence with `setMutationDefaults` is documented but the replay-on-reconnect + conflict resolution for group expenses is a novel composition.
- **Phase 7 (Screen Decomposition):** Decomposition strategy is clear, but individual screen analysis (which sections to extract) benefits from screen-by-screen review during planning.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Infrastructure):** QueryClient config, query key factory, Zod schemas are all well-documented.
- **Phase 2 (Logging/Error):** Straightforward consolidation, no novel patterns.
- **Phase 3 (Financial Core):** Standard TanStack Query CRUD migration with optimistic updates. TransactionContext already partially implements the correct pattern.
- **Phase 5 (Remaining Domains):** Same CRUD migration pattern as Phase 3, applied to simpler domains.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                               |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | All packages already installed and partially wired. TanStack Query v5 docs and TkDodo blog are authoritative. QueryPersistenceProvider already functional.          |
| Features     | HIGH       | Feature list derived from direct codebase analysis (20 contexts, 53 services, 65 screens audited). Priority matrix based on dependency chains in actual code.       |
| Architecture | HIGH       | Feature-first structure and queryOptions pattern are well-documented. MEDIUM on specific directory layout details which are team-preference decisions.              |
| Pitfalls     | HIGH       | All pitfalls identified from codebase-specific analysis with line number references. Cross-entity dependency chain verified by reading actual context source files. |

**Overall confidence:** HIGH

### Gaps to Address

- **Budget tracking as derived computation:** No canonical TanStack Query pattern for a query that computes over two other query caches. During Phase 4 planning, decide between: (a) `useMemo` over two `useQuery` results, (b) a dedicated query with `queryFn` that reads from `queryClient.getQueryData()`, or (c) a server-side computed view via Supabase Edge Function. Option (a) is simplest and recommended for this scale.

- **Migration rollback strategy:** Research covers per-pitfall recovery but does not define a global rollback plan. During roadmap planning, decide: feature-flag per phase? Branch-per-phase? The app has no production users, so main-branch merges with type-check gates may suffice.

- **Performance baselines:** Research identifies traps (calculateTrackingData on every transaction change, MMKV serialization at scale) but does not include benchmark measurements. During Phase 3, add timing logs to `calculateTrackingData` and `calculateAnalytics` to validate that the migration improves or maintains performance.

- **Test coverage for cross-entity invalidation:** The "looks done but isn't" checklist notes that cross-query invalidation is the most commonly missed step. During Phase 4, integration tests should verify: add transaction -> budget tracking updates; add group expense -> HomeScreen shows it; edit category -> transactions referencing it update.

## Sources

### Primary (HIGH confidence)

- **TanStack Query v5 Official Docs** (tanstack.com/query/latest) -- queryOptions, mutations, optimistic updates, persistence, network mode, scope
- **TkDodo Blog -- "Effective React Query Keys"** (tkdodo.eu/blog/effective-react-query-keys) -- hierarchical query key factory pattern
- **TkDodo Blog -- "React Query and React Native"** (tkdodo.eu/blog/react-query-and-react-native) -- networkMode offlineFirst, NetInfo integration
- **TkDodo Blog -- "React Query Common Mistakes"** (tkdodo.eu/blog/react-query-common-mistakes) -- anti-patterns from the library maintainer
- **Codebase audit** -- 20 contexts, 53 services, 16 hooks, 65 screens, error boundaries, logging services, persistence layers, QueryPersistenceProvider, MMKVPersister, SupabaseDatabaseService

### Secondary (MEDIUM confidence)

- **Feature-first architecture for React apps** -- organizational pattern for 5+ domain apps; specific directory layout varies by team preference
- **TanStack Query Persistence GitHub Discussions** -- gcTime memory considerations for React Native (#6214, #3284)
- **Supabase Realtime docs** -- channel subscriptions, postgres_changes events

### Tertiary (LOW confidence)

- **@supabase-cache-helpers** -- potential future tooling at 100k+ user scale; library maturity still evolving
- **RevenueCat + Supabase Edge Function integration** -- not researched in depth; subscription flow presumed to continue working with current pattern

---

_Research completed: 2026-04-28_
_Ready for roadmap: yes_
