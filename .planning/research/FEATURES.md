# Feature Research

**Domain:** React Native finance app architecture (data layer, infrastructure, not UI)
**Researched:** 2026-04-28
**Confidence:** HIGH (based on codebase analysis + established React Native ecosystem patterns)

## Current State Diagnosis

Before defining target features, understanding what exists and what is broken:

| Area              | Current State                                                                                                       | Problem                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Server state      | TanStack Query used in ~5 contexts, but 21 contexts still hold server data in useState                              | Server data duplicated across Context and Query cache                           |
| Local persistence | AsyncStorage (StorageService) + MMKV (QueryPersister) compete as persistence layers                                 | Two sources of truth; StorageService has full CRUD for every entity             |
| Logging           | LoggerService, EnhancedLoggerService, ExpoErrorReportingService (3 systems)                                         | All 3 used simultaneously in error boundaries; circular references between them |
| Error handling    | 4 error boundary classes, ErrorMessageService, ContextError, withErrorHandling wrapper                              | No consistent pattern; error boundaries log to all 3 logging systems            |
| Offline           | OfflineNotice banner + QueryPersistenceProvider; StorageService reads locally                                       | No offline write queue; offline banner blocks entire screen                     |
| Validation        | formValidation.ts, groupValidation.ts, settings-validation.ts (ad hoc)                                              | No schema validation at Supabase boundary or service boundary                   |
| Realtime          | Supabase realtime subscriptions in EnhancedGroupContext only                                                        | Realtime invalidates entire query key on every postgres_changes event           |
| Background sync   | BackgroundTaskService for recurring transactions only                                                               | No general-purpose background data sync                                         |
| Services          | 53 services, many are static method collections                                                                     | No consistent pattern (singleton vs static vs function collection)              |
| Mock timeouts     | 16 setTimeout calls in production code (CoordinationContext, WalletContext, BudgetContext, AuthGuard, signOutUtils) | Race conditions and flaky behavior                                              |

## Table Stakes (Architecture Must-Haves)

Without these, the app is fragile, hard to debug, or silently loses data. These are not optional for a finance app.

### 1. Single Source of Truth for Server State

| Aspect       | Detail                                                                                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature      | TanStack Query as the sole server state manager; contexts store only UI state                                                                                                                                   |
| Why Expected | Finance apps cannot have stale or duplicated data. Every entity (transactions, groups, budgets, loans) must have exactly one cache                                                                              |
| Complexity   | HIGH (requires migrating ~16 contexts from useState server data to pure TanStack Query hooks)                                                                                                                   |
| Current Gap  | TransactionContext partially uses TanStack Query but still exposes sync methods. BudgetContext, LoanContext, InvestmentContext, SavingsContext, WalletContext, CategoryContext all hold server data in useState |

**What changes:** Contexts become thin UI wrappers. Server data lives in custom hooks backed by TanStack Query. `StorageService` is eliminated as a persistence layer (MMKV + TanStack Query persistence replaces it).

**Dependencies:** None (foundational; other features build on this)

### 2. Consolidated Logging System

| Aspect       | Detail                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature      | One logger with severity levels, context tags, and a single error reporting pipeline                                                                                                     |
| Why Expected | Three logging systems that reference each other is worse than one good one. Debugging production issues in a finance app requires reliable, non-circular logging                         |
| Complexity   | MEDIUM (straightforward deletion and consolidation)                                                                                                                                      |
| Current Gap  | LoggerService, EnhancedLoggerService, ExpoErrorReportingService all used. Error boundaries log to all three. EnhancedLoggerService wraps LoggerService and also replaces console methods |

**What changes:** Keep EnhancedLoggerService as the single API surface (it already wraps LoggerService). Remove the indirection. Merge ExpoErrorReportingService's error capture into the single logger. Remove LoggerService as a standalone import.

**Dependencies:** None (standalone fix)

### 3. Unified Error Boundary Pattern

| Aspect       | Detail                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature      | One error boundary component hierarchy: App-level (catches everything) -> Screen-level (per-screen recovery) -> Component-level (optional, for isolated crashes) |
| Why Expected | Four error boundary classes with duplicated logic means inconsistent crash recovery. Finance apps need predictable error states                                  |
| Complexity   | LOW (delete 3, keep 1, add screen-level wrapper)                                                                                                                 |
| Current Gap  | ErrorBoundary, EnhancedErrorBoundary, ScreenErrorBoundary, GroupErrorBoundary -- all with slightly different APIs and logging                                    |

**What changes:** Keep EnhancedErrorBoundary (most complete: retry logic, exponential backoff, contextual recovery). Make ScreenErrorBoundary a thin wrapper that adds `screenName`. Delete ErrorBoundary and GroupErrorBoundary.

**Dependencies:** Consolidated Logging System (error boundaries should use the single logger)

### 4. Data Validation at Boundaries

| Aspect       | Detail                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Feature      | Zod schemas at the Supabase response boundary and at the service->UI boundary. Service layer returns validated, typed data                                                                                   |
| Why Expected | Finance data correctness is non-negotiable. A malformed transaction amount or missing group member silently corrupts balances                                                                                |
| Complexity   | MEDIUM (define schemas for all entities, add validation at two boundaries)                                                                                                                                   |
| Current Gap  | No schema validation library in the project. Validation is ad-hoc (formValidation.ts checks strings, groupValidation.ts checks names). Supabase responses are cast with `as Type` with no runtime validation |

**What changes:** Add `zod`. Define schemas for Transaction, EnhancedGroup, Budget, Loan, Investment, SavingsGoal. Validate in `SupabaseDatabaseService` getters (Supabase -> app) and in context/hook setters (before state updates). Not everywhere -- only at boundaries where data crosses trust zones.

**Dependencies:** None (standalone)

### 5. Remove Artificial Delays in Production

| Aspect       | Detail                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature      | Replace all `setTimeout(resolve, N)` in non-UI production code with proper async patterns                                                                                             |
| Why Expected | Mock delays in CoordinationContext (100ms, 500ms), WalletContext (1000ms), BudgetContext (500ms, 1000ms, 1500ms), AuthGuard (1000ms), and signOutUtils (500ms) create race conditions |
| Complexity   | LOW (delete timeouts, use proper event-driven patterns)                                                                                                                               |
| Current Gap  | 16 setTimeout calls in production code that are not UI animations or debounce                                                                                                         |

**What changes:** Replace `await new Promise(resolve => setTimeout(resolve, N))` with proper patterns: wait for a state flag, use a callback, or remove entirely if the delay was defensive.

**Dependencies:** None (standalone)

### 6. Consistent Service Layer Pattern

| Aspect       | Detail                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature      | Services as stateless function modules (not classes with static methods, not singletons), organized by domain                                                                    |
| Why Expected | 53 services with mixed patterns (some singletons, some static classes, some function collections) makes dependency tracking impossible                                           |
| Complexity   | MEDIUM (refactor from classes to exported functions, reorganize directory structure)                                                                                             |
| Current Gap  | No consistent pattern. Some services use `static async method()`, some use `getInstance()`, some export functions. No clear directory structure beyond a flat `services/` folder |

**What changes:**

- Services become `src/services/{domain}/` directories with exported functions
- `SupabaseDatabaseService` becomes `src/services/database/` with separate modules for groups, transactions, budgets, etc.
- No singletons (inject dependencies via function parameters)
- No static classes (just exported functions)

**Dependencies:** Single Source of Truth for Server State (services should not hold state; TanStack Query does)

## Differentiators (Good Architecture That Prevents Future Problems)

### 7. Offline Write Queue with Conflict Resolution

| Aspect            | Detail                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature           | Queue mutations when offline, replay on reconnect with conflict resolution (last-write-wins for most entities, manual merge for group expenses)                |
| Value Proposition | Users can add transactions, split expenses, and record settlements while offline. Current app shows a blocking "No Internet" overlay                           |
| Complexity        | HIGH (requires mutation queue, replay logic, conflict resolution strategy per entity type)                                                                     |
| Current Gap       | OfflineNotice is a full-screen blocking overlay. No mutation queuing exists. TanStack Query's `retry` only works for failed network calls, not offline queuing |

**What changes:**

- Remove the blocking OfflineNotice overlay (replace with a subtle banner)
- Use TanStack Query's `mutationCache` with offline persistence to queue mutations
- On reconnect, replay queued mutations in order
- For group expenses: last-write-wins with `updated_at` timestamp comparison
- For settlements: never auto-resolve; flag for manual review

**Dependencies:** Single Source of Truth (TanStack Query mutations must be the only mutation path)

### 8. Domain-Organized Custom Query Hooks

| Aspect            | Detail                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Feature           | Replace context-based data access with custom hooks: `useTransactions()`, `useGroups()`, `useBudget()`, etc., backed by TanStack Query    |
| Value Proposition | Hooks composable at the component level. No more 20-level provider nesting. Components import only what they need                         |
| Complexity        | MEDIUM (extract query logic from contexts into hooks, contexts become UI-only)                                                            |
| Current Gap       | Data access is through contexts that hold both server state and UI state. TransactionContext has a mix of TanStack Query and manual state |

**What changes:**

```
src/hooks/queries/
  useTransactions.ts      -- useQuery + mutations for transactions
  useGroups.ts            -- useQuery + mutations + realtime subscription
  useBudget.ts            -- useQuery + mutations for budgets
  useLoans.ts             -- useQuery + mutations for loans
  useInvestments.ts       -- useQuery + mutations for investments
  useSavings.ts           -- useQuery + mutations for savings goals
  useCategories.ts        -- useQuery for categories (read-only mostly)
  useWallets.ts           -- useQuery for wallets
```

Each hook encapsulates: query key, fetch function, mutation functions, optimistic update logic. Components call hooks directly. Contexts shrink to UI-only state (selected filters, modal visibility, form state).

**Dependencies:** Single Source of Truth, Consistent Service Layer

### 9. Supabase Realtime Subscription Manager

| Aspect            | Detail                                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature           | Centralized realtime subscription management with reconnection, presence tracking, and targeted invalidation                                                                                          |
| Value Proposition | Group expense splitting is real-time by nature. Current implementation invalidates entire query keys on every postgres_changes event, causing unnecessary refetches                                   |
| Complexity        | MEDIUM (build a subscription manager that maps events to specific query key invalidations)                                                                                                            |
| Current Gap       | Realtime subscriptions live inside EnhancedGroupContext with no abstraction. Invalidation is coarse-grained (invalidates all groups on any change). No reconnection handling beyond Supabase defaults |

**What changes:**

- Create `src/services/realtime/SubscriptionManager.ts`
- Map specific postgres_changes events to fine-grained query invalidations
- E.g., a transaction INSERT in group X invalidates `['groups', userId, 'transactions', groupId]` not all groups
- Handle reconnection by re-subscribing and invalidating stale data
- Track presence for collaborative group expense sessions

**Dependencies:** Domain-Organized Custom Query Hooks, Single Source of Truth

### 10. Structured Error Types with Recovery Hints

| Aspect            | Detail                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature           | Typed error classes (NetworkError, AuthError, ValidationError, SyncError, StorageError) with recovery actions attached to each error instance                                                      |
| Value Proposition | Error boundaries and UI components can show contextual recovery options instead of generic "Something went wrong"                                                                                  |
| Complexity        | MEDIUM (define error taxonomy, replace ad-hoc error throwing across services)                                                                                                                      |
| Current Gap       | ContextError exists in context-foundation.ts but is not used consistently. ErrorMessageService classifies errors by string matching on error messages. No typed error classes at the service layer |

**What changes:**

```
src/types/errors.ts
  AppError (base)
    -> NetworkError (retry, check connection)
    -> AuthError (re-login, session expired)
    -> ValidationError (show field errors, fix input)
    -> SyncError (retry, conflict resolution)
    -> StorageError (clear cache, re-download)
    -> PermissionError (request access, upgrade plan)
```

Each error type carries: user-friendly message, recovery actions, whether it is retryable, severity level. Services throw typed errors. Error boundaries and hooks consume them.

**Dependencies:** Consolidated Logging System (logger consumes typed errors)

### 11. Query Key Factory Pattern

| Aspect            | Detail                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Feature           | Centralized query key definitions with factory functions for consistent invalidation                                        |
| Value Proposition | Eliminates magic string query keys scattered across hooks. Enables targeted invalidation from mutations and realtime events |
| Complexity        | LOW (define key factories, update references)                                                                               |
| Current Gap       | Query keys are inline string arrays: `['transactions', user?.uid]`, `['groups', user.uid]`. No centralized definition       |

**What changes:**

```
src/services/queries/keys.ts
  export const queryKeys = {
    transactions: {
      all: (userId: string) => ['transactions', userId] as const,
      byGroup: (userId: string, groupId: string) => ['transactions', userId, 'group', groupId] as const,
      byDateRange: (userId: string, start: string, end: string) => ['transactions', userId, 'dates', start, end] as const,
    },
    groups: {
      all: (userId: string) => ['groups', userId] as const,
      byId: (userId: string, groupId: string) => ['groups', userId, groupId] as const,
    },
    // ... all entities
  }
```

**Dependencies:** Domain-Organized Custom Query Hooks

### 12. Network-Aware Data Freshness

| Aspect            | Detail                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Feature           | Dynamic staleTime based on entity type and network conditions. Aggressive refetching for group data, conservative for historical transactions          |
| Value Proposition | Balances data freshness with battery/bandwidth usage. Critical for group expense splitting where multiple users edit simultaneously                    |
| Complexity        | MEDIUM (configure per-entity staleTime, add network-aware refetch triggers)                                                                            |
| Current Gap       | Global 5-minute staleTime for all queries. No per-entity configuration. No network-aware behavior beyond TanStack Query's default `refetchOnReconnect` |

**What changes:**

```
staleTime configuration:
  groups/group_members:    30 seconds (collaborative, frequently changing)
  transactions:            2 minutes  (moderate change frequency)
  budgets:                 5 minutes  (daily/weekly changes)
  categories:              30 minutes (rarely change)
  user profile:            15 minutes (rarely change)
  investment prices:       1 minute   (market data)
  savings goals:           5 minutes  (user-driven changes)
```

When offline -> online transition: refetch entities with stale data first, prioritized by entity type.

**Dependencies:** Single Source of Truth, Domain-Organized Custom Query Hooks

## Anti-Features (Over-Engineering to Avoid)

### AF-1. Full Offline-First SQLite Sync Engine

| Aspect          | Detail                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Feature    | PowerSync / WatermelonDB / full local SQLite database with automatic bi-directional sync                                                                                                                                                                                |
| Why Requested   | "Finance apps must work offline!" -- the dogmatic version of offline-first                                                                                                                                                                                              |
| Why Problematic | Adds 2-3x complexity to the data layer. Requires conflict resolution for every entity type. Requires a local schema that mirrors Postgres. Requires sync state machines. For an app with no production users and ~10K potential users, this is massive over-engineering |
| Alternative     | TanStack Query persistence + offline mutation queue (Feature 7). This gives 90% of the user benefit at 20% of the complexity. Add full offline-first later IF user data shows it is needed (e.g., users in low-connectivity regions)                                    |

### AF-2. Event-Sourced / CQRS Architecture

| Aspect          | Detail                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anti-Feature    | Store every financial event as an immutable ledger entry; derive current state from event replay                                                                                                                               |
| Why Requested   | "Finance apps need audit trails!" -- true for banking, not for a personal expense tracker                                                                                                                                      |
| Why Problematic | Event sourcing requires event store, projections, snapshots, and saga patterns. The Supabase PostgreSQL database with `created_at` / `updated_at` timestamps already provides sufficient audit capability for this app's scale |
| Alternative     | Supabase `updated_at` timestamps + soft deletes for audit trail. Add a `transaction_history` table for critical entities if audit requirements grow                                                                            |

### AF-3. Micro-Frontend / Module Federation

| Aspect          | Detail                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Feature    | Split the app into independently deployable modules (budget module, group module, loan module)                                                                                                                                        |
| Why Requested   | "53 services and 65 screens is too big for one team"                                                                                                                                                                                  |
| Why Problematic | React Native does not have mature module federation. The overhead of module boundaries, inter-module communication, and independent deployments far exceeds the complexity of a well-organized monolith for a solo/small-team project |
| Alternative     | Clean domain boundaries within a monolith (Feature 6). Organize by domain folder, not by technical layer                                                                                                                              |

### AF-4. Custom State Machine for Every Entity

| Aspect          | Detail                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Feature    | XState machines for every entity lifecycle (transaction states, group states, loan states)                                                                                                                                                   |
| Why Requested   | "State machines prevent impossible states"                                                                                                                                                                                                   |
| Why Problematic | XState adds significant learning curve and boilerplate. Most entities in this app have 2-3 states (loading, loaded, error). TanStack Query already handles this. Only group settlement workflow has enough states to justify a state machine |
| Alternative     | Use TanStack Query's built-in loading/error/success states. Add an XState machine ONLY for the group settlement workflow if it proves error-prone                                                                                            |

### AF-5. Real-Time Everything

| Aspect          | Detail                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Feature    | Supabase realtime subscriptions on every table (transactions, budgets, loans, investments, savings, categories)                                                                                                                 |
| Why Requested   | "Data should always be fresh!"                                                                                                                                                                                                  |
| Why Problematic | Each realtime subscription maintains a WebSocket connection. Subscribing to 8+ tables means 8+ channels, each consuming battery and bandwidth. Most data changes are user-initiated and can be handled by mutation invalidation |
| Alternative     | Realtime only for collaborative features (group expenses, shared budgets). Everything else uses TanStack Query's `refetchOnWindowFocus` and mutation invalidation. Feature 9 covers this                                        |

### AF-6. Generic CRUD Framework / Admin Panel Generator

| Aspect          | Detail                                                                                                                                                                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Feature    | Build a generic CRUD factory that auto-generates service + hook + context for any entity from a schema definition                                                                                                                                                                              |
| Why Requested   | "53 services all do the same CRUD -- just generate them!"                                                                                                                                                                                                                                      |
| Why Problematic | The current context-foundation.ts `createCRUDOperations` factory already tries this and it adds more abstraction than value. Each entity has enough domain-specific logic (balance calculations, settlement algorithms, FX conversions) that a generic CRUD factory creates leaky abstractions |
| Alternative     | Shared utility functions for common patterns (optimistic updates, retry logic, error wrapping) + domain-specific hooks that compose these utilities. No code generation, no reflection, no generic factory                                                                                     |

## Feature Dependencies

```
[Single Source of Truth (F1)]
    |
    +--required-by--> [Domain Query Hooks (F8)]
    |                       |
    |                       +--required-by--> [Query Key Factory (F11)]
    |                       |
    |                       +--required-by--> [Network-Aware Freshness (F12)]
    |
    +--required-by--> [Offline Write Queue (F7)]
    |
    +--required-by--> [Realtime Subscription Manager (F9)]
    |
    +--required-by--> [Consistent Service Layer (F6)]

[Consolidated Logging (F2)]
    |
    +--required-by--> [Unified Error Boundary (F3)]
    |
    +--required-by--> [Structured Error Types (F10)]

[Data Validation (F4)] -- standalone
[Remove Artificial Delays (F5)] -- standalone

[F8: Domain Query Hooks]
    +--required-by--> [F9: Realtime Manager]
    +--required-by--> [F11: Query Key Factory]
    +--required-by--> [F12: Network-Aware Freshness]

[F6: Service Layer] --enhances--> [F8: Domain Query Hooks]
```

### Dependency Notes

- **F1 (Single Source of Truth) is the critical path:** Almost every other feature depends on server state living in TanStack Query, not in context useState. This must happen first.
- **F2 (Consolidated Logging) and F5 (Remove Delays) are independent quick wins:** They can happen in parallel with F1 or before it.
- **F7 (Offline Write Queue) requires F1:** Cannot queue mutations properly when mutations are split between TanStack Query and manual fetch calls.
- **F9 (Realtime) requires F8 (Domain Query Hooks):** Cannot do fine-grained invalidation without fine-grained query keys.
- **F6 (Service Layer) enhances F8 but is not strictly required:** Services can be refactored incrementally as hooks are created.

## MVP Definition

### Phase 1: Foundation (Must Do First)

These form the critical path. Everything else builds on these.

- [ ] **F5: Remove Artificial Delays** -- Zero-risk change that eliminates race conditions. Can be done in one pass.
- [ ] **F2: Consolidated Logging** -- Merge 3 systems into 1. Quick win that unblocks error boundary cleanup.
- [ ] **F4: Data Validation at Boundaries** -- Add zod, define schemas for core entities (Transaction, Group, Budget, Loan). Validate at Supabase -> Service boundary.
- [ ] **F3: Unified Error Boundary** -- Keep EnhancedErrorBoundary, delete the other 3. Wire to consolidated logger.

### Phase 2: Data Layer Overhaul (The Big Rewrite)

This is the core architecture change. Plan carefully.

- [ ] **F1: Single Source of Truth** -- Migrate all server data out of contexts into TanStack Query. Delete StorageService as a persistence layer.
- [ ] **F6: Consistent Service Layer** -- Refactor services from classes to function modules organized by domain.
- [ ] **F11: Query Key Factory** -- Define centralized query keys as the hooks are built.
- [ ] **F8: Domain Query Hooks** -- Extract query logic from contexts into composable hooks. Contexts shrink to UI-only state.

### Phase 3: Enhanced Reliability (Add After Core Is Stable)

These are valuable but depend on Phase 2 being complete.

- [ ] **F10: Structured Error Types** -- Define error taxonomy, replace ad-hoc error throwing.
- [ ] **F9: Realtime Subscription Manager** -- Centralize realtime logic, fine-grained invalidation.
- [ ] **F12: Network-Aware Data Freshness** -- Per-entity staleTime, prioritized refetch on reconnect.
- [ ] **F7: Offline Write Queue** -- Mutation queuing, replay on reconnect, conflict resolution for group expenses.

## Feature Prioritization Matrix

| Feature                           | User Value                         | Implementation Cost                         | Priority |
| --------------------------------- | ---------------------------------- | ------------------------------------------- | -------- |
| F5: Remove Artificial Delays      | HIGH (eliminates race conditions)  | LOW (delete code)                           | P1       |
| F2: Consolidated Logging          | HIGH (debugging production)        | LOW-MEDIUM (merge 3 into 1)                 | P1       |
| F4: Data Validation               | HIGH (data integrity)              | MEDIUM (define schemas, add validation)     | P1       |
| F3: Unified Error Boundaries      | MEDIUM (consistent crash recovery) | LOW (delete 3, keep 1)                      | P1       |
| F1: Single Source of Truth        | HIGH (eliminates data duplication) | HIGH (rewrite 16 contexts)                  | P2       |
| F6: Consistent Service Layer      | MEDIUM (developer experience)      | MEDIUM (refactor 53 services)               | P2       |
| F11: Query Key Factory            | LOW-MEDIUM (code quality)          | LOW (define key factories)                  | P2       |
| F8: Domain Query Hooks            | HIGH (composable data access)      | MEDIUM-HIGH (extract from contexts)         | P2       |
| F10: Structured Error Types       | MEDIUM (error recovery UX)         | MEDIUM (define taxonomy + migrate)          | P3       |
| F9: Realtime Subscription Manager | MEDIUM (group expense UX)          | MEDIUM (build manager + migrate)            | P3       |
| F12: Network-Aware Freshness      | MEDIUM (battery/performance)       | LOW-MEDIUM (configure staleTime)            | P3       |
| F7: Offline Write Queue           | HIGH (offline usability)           | HIGH (queue + replay + conflict resolution) | P3       |

**Priority key:**

- P1: Must do first (foundation, unblocks everything else)
- P2: Core architecture change (the big rewrite)
- P3: Enhanced reliability (build on stable foundation)

## Context Reduction Target

Current state: 20 contexts (18 domain + 2 UI)

Target state: 5 contexts

| Context                  | Role                          | What Changes                                                                     |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------------- |
| QueryPersistenceProvider | Server state infrastructure   | Keep as-is (already correct)                                                     |
| CoordinationContext      | Cross-cutting UI coordination | Simplify: remove setTimeout, remove migration/rollback code, keep event bus only |
| EnhancedAuthContext      | Auth state                    | Keep: auth is genuinely client state (session, loading)                          |
| TamaguiProvider          | Theme/UI infrastructure       | Keep as-is                                                                       |
| SettingsContext          | User preferences              | Keep: settings are client state                                                  |

**What gets removed as contexts (data moves to hooks):**

- TransactionContext, CategoryContext, WalletContext -> `useTransactions()`, `useCategories()`, `useWallets()` hooks
- BudgetContext -> `useBudget()` hook
- EnhancedGroupContext -> `useGroups()` hook
- LoanContext -> `useLoans()` hook
- InvestmentContext -> `useInvestments()` hook
- SavingsContext -> `useSavings()` hook
- SubscriptionContext -> `useSubscriptions()` hook
- FinancialAnalyticsContext -> `useFinancialAnalytics()` hook (derived from other hooks)
- MembershipContext -> `useMembership()` hook
- UserContext -> Merge into EnhancedAuthContext
- SafeAreaProvider, ToastContext -> Keep (UI infrastructure)

## Service Reduction Target

Current state: 53 services in a flat directory

Target state: ~15-20 function modules organized by domain

```
src/services/
  database/              -- Supabase query functions (splits SupabaseDatabaseService)
    groups.ts            -- Group CRUD + member management queries
    transactions.ts      -- Transaction queries
    budgets.ts           -- Budget queries
    loans.ts             -- Loan queries
    investments.ts       -- Investment queries
    savings.ts           -- Savings goal queries
    categories.ts        -- Category queries
    auth.ts              -- Auth queries
    storage.ts           -- Supabase storage (file uploads)
  auth/                  -- Authentication services
    unified-auth.ts      -- Merged auth service
    google-signin.ts     -- Google Sign-In
    token-manager.ts     -- Auth token refresh
  realtime/              -- Realtime subscription management
    subscription-manager.ts
  persistence/           -- Local persistence
    mmkv-persister.ts    -- TanStack Query MMKV persistence
  monitoring/            -- Consolidated monitoring
    logger.ts            -- Single logger (merged from 3)
    error-reporting.ts   -- Error reporting (part of logger)
    performance.ts       -- Performance metrics (simplified)
  notifications/         -- Push notifications
    notification-service.ts
  calculations/          -- Pure calculation services (stateless)
    debt-calculation.ts
    financial-calculations.ts
    settlement.ts
    fx-conversion.ts
  background/            -- Background tasks
    background-task.ts
    recurring-transactions.ts
```

**What gets deleted entirely:**

- `StorageService` (replaced by TanStack Query persistence)
- `EnhancedLoggerService` + `LoggerService` -> merged into single `logger.ts`
- `ExpoErrorReportingService` -> merged into `error-reporting.ts`
- `PerformanceMonitoringService` + `ProductionMonitoringService` + `ProductionConfigService` + `DeploymentService` -> simplified into `monitoring/`
- `CreditCardStorageService`, `LocalProfileService` -> domain-specific, kept if used
- `ErrorMessageService` -> replaced by structured error types
- `SmartBudgetService`, `EnhancedBudgetService` -> merge into single budget service

## Sources

- Codebase analysis: Direct examination of 20 contexts, 53 services, 16 hooks, error boundaries, logging services, and persistence layers
- TanStack Query documentation: Query key patterns, mutation lifecycle, persistence, online manager
- Supabase Realtime documentation: Channel subscriptions, postgres_changes events
- React Native architecture patterns: Context vs hook composition, provider nesting limits
- Domain expertise: Finance app data integrity requirements, offline-first patterns for mobile

---

_Feature research for: React Native finance app architecture (data layer)_
_Researched: 2026-04-28_
