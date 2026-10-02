# Pitfalls Research

**Domain:** React Native architecture overhaul — Context/useState to TanStack Query migration, service consolidation, screen decomposition, event bus removal
**Researched:** 2026-04-28
**Confidence:** HIGH (codebase-specific analysis + TanStack Query official patterns + TkDodo's documented mistakes)

## Critical Pitfalls

### Pitfall 1: Budget-Transaction Cross-Entity Dependency Breaks During Migration

**What goes wrong:**
BudgetContext directly calls `useTransaction()` to read `transactions`, `getTransactionsByDateRange`, `getTotalIncome`, and `getTotalExpenses`. When both move to TanStack Query, two failure modes emerge:

1. **Race condition on hydration**: Budget query fires before transaction query finishes. Budget calculations run against an empty `[]` array, producing zeroed-out tracking data that briefly flashes on screen.
2. **Lost reactivity**: Currently, BudgetContext re-runs `calculateTrackingData` via a `useEffect` that depends on `transactions` from TransactionContext. When both are TanStack queries, invalidating transactions does NOT automatically invalidate the budget tracking derived data. The budget shows stale tracking until its own query is separately invalidated.

This is the single most dangerous pitfall in this codebase because BudgetContext has a 300+ line `calculateTrackingData` function that deeply depends on live transaction state (lines 238-337 of `src/context/BudgetContext.tsx`).

**Why it happens:**
Developers treat each context migration as independent. The TanStack Query mental model is "one query = one entity", but budget tracking is a _computed view over two entities_. There is no `useQuery` that naturally represents this.

**How to avoid:**

- Do NOT migrate BudgetContext and TransactionContext in separate phases.
- Create the budget tracking as a _derived query_ that uses `useQuery` with a `queryFn` that reads from both the budget and transaction query caches via `queryClient.getQueryData()`, or better, use TanStack Query's `useQueries` / dependent query pattern.
- Alternatively, compute budget tracking data in a `useMemo` or `select` option that subscribes to both query results — this is the simpler pattern since tracking is pure client-side computation over server data.
- After any transaction mutation, invalidate both `['transactions']` AND `['budgets']` (or a dedicated `['budget-tracking']`) query key in the mutation's `onSettled`.

**Warning signs:**

- Budget tracking shows zeros or stale data after adding/editing a transaction.
- `trackingData` in BudgetContext is null immediately after app launch.
- Tests show budget calculations pass in isolation but fail when transaction query is loading.

**Phase to address:**
Phase where TransactionContext and BudgetContext are both migrated. These MUST be in the same phase, or BudgetContext migration must come immediately after TransactionContext with explicit cross-invalidation wiring.

---

### Pitfall 2: FinancialAnalyticsContext Pulls from Three Contexts — Creates a Cascade

**What goes wrong:**
FinancialAnalyticsContext consumes `useTransaction()`, `useCategory()`, AND `useBudget()` simultaneously (lines 100-102 of `src/context/FinancialAnalyticsContext.tsx`). It gates recalculation on `!isTransactionsLoading && !isCategoriesLoading && !isBudgetLoading`.

When migrating to TanStack Query:

1. Each context has independent loading/error states. The current "wait for all three" pattern becomes fragile — if one query fails, analytics silently never updates.
2. The current pattern recalculates on every `transactions` change. With TanStack Query, `transactions` is a new array reference on every fetch (even if data is identical), triggering unnecessary recalculations. The `calculateAnalytics` function iterates ALL transactions every time.
3. FinancialAnalyticsContext does NOT use TanStack Query at all currently — it's pure derived state from other contexts. Migrating it to its own query creates a three-way dependent query chain that is hard to reason about.

**Why it happens:**
Analytics is treated as "just another context" when it's actually a pure computed view. It should be a derived computation, not a separate data-fetching entity.

**How to avoid:**

- FinancialAnalyticsContext should NOT have its own `useQuery`. It should be a custom hook that subscribes to transaction, category, and budget query results and derives analytics via `useMemo`.
- Use TanStack Query's `useQueries` to subscribe to all three simultaneously, then compute analytics in a `useMemo` keyed on the query data.
- Do NOT gate on loading states individually — use `isPending` from the combined query results.

**Warning signs:**

- Analytics shows stale data after budget or category changes.
- Analytics recalculates on every render (performance regression).
- Analytics never loads because one of three queries is stuck in error state.

**Phase to address:**
Analytics should be migrated LAST, after all three source contexts (transactions, categories, budgets) are on TanStack Query. It is a pure consumer, not a data owner.

---

### Pitfall 3: EnhancedGroupContext Creates Transactions Without Invalidating Transaction Query

**What goes wrong:**
`addGroupExpense` in EnhancedGroupContext (line ~61 of `src/context/EnhancedGroupContext.tsx`) saves a Transaction to Supabase via `SupabaseDatabaseService.saveGroup()` but only invalidates `['groups', user.uid]`. It does NOT invalidate `['transactions', user?.uid]`.

Currently this works because EnhancedGroupContext does NOT use `useTransaction()` — it stores transactions inside the group object. But the TransactionContext ALSO fetches all transactions. This means:

- Group expenses appear in the group detail screen immediately.
- Group expenses do NOT appear in the HomeScreen transaction list or budget tracking until the transaction query naturally refetches (on staleTime expiry or app refocus).

After migration, if this invalidation gap isn't fixed, group expenses will be invisible in the global transaction feed for up to 5 minutes (current staleTime).

**Why it happens:**
EnhancedGroupContext was designed as a self-contained module that happens to create Transaction objects. The developer didn't think about the TransactionContext query cache because groups "own" their transactions in the current mental model.

**How to avoid:**

- In every mutation that creates/modifies a Transaction inside EnhancedGroupContext, add `queryClient.invalidateQueries({ queryKey: ['transactions', user.uid] })` alongside the group invalidation.
- Create a shared query key constant file so invalidation targets are type-safe and discoverable.
- Alternatively, create a `useInvalidateRelatedQueries()` helper that transaction-creating mutations call.

**Warning signs:**

- Group expenses don't appear on HomeScreen after creation.
- Budget tracking doesn't update after adding a group expense.
- Transaction count mismatch between GroupDetailScreen and HomeScreen.

**Phase to address:**
The phase where cross-query invalidation is established (after both GroupContext and TransactionContext are on TanStack Query). Create a query key registry as part of the migration infrastructure.

---

### Pitfall 4: Removing CoordinationContext Before All Consumers Are Migrated

**What goes wrong:**
The CoordinationContext provides three things that TanStack Query does NOT replace:

1. **Global loading state** (`useGlobalLoadingState`) — tracks which contexts are loading and what operations are active.
2. **Event bus** (`coordinationEventBus`) — emits `coordination:refresh-all` and `coordination:reload-data` events.
3. **Migration/rollback support** — `storeRollbackData`, `legacyMode`, `featureFlags`.

If CoordinationContext is removed before all consumers stop using it:

- `BackupSyncScreen.tsx` imports `useCoordination` and will crash.
- Any context using `useCoordinationRefresh` to register refresh callbacks will silently stop refreshing.
- The `AutoTransactionInitializer` component relies on the coordination layer for its initialization flow.

**Why it happens:**
The coordination layer looks like "legacy infrastructure" that TanStack Query makes unnecessary. But the global loading state and event bus serve cross-cutting concerns that individual queries don't address.

**How to avoid:**

- Remove CoordinationContext in two stages:
  1. First, replace `coordinationEventBus` with direct `queryClient.invalidateQueries()` calls in each context. Remove `useCoordinationRefresh` usage.
  2. Then, replace `globalLoadingState` with TanStack Query's `useIsFetching()` and `useIsMutating()` hooks at the app level.
- Keep the CoordinationContext file as a thin wrapper during migration, but have each consumer stop using it individually.
- Remove it only when `Grep` for `useCoordination` and `coordinationEventBus` returns zero results outside the context file itself.

**Warning signs:**

- "must be used within a CoordinationProvider" runtime errors.
- Global loading indicator stops showing.
- Backup/sync screen crashes on mount.

**Phase to address:**
Late phase — CoordinationContext should be one of the last things removed, after all contexts are on TanStack Query and all event bus subscriptions are replaced with query invalidation.

---

### Pitfall 5: AsyncStorage-to-MMKV Data Loss During Persistence Migration

**What goes wrong:**
BudgetContext still uses AsyncStorage directly for persistence (lines 132-206 of `src/context/BudgetContext.tsx`), storing budgets at `@BuddyApp:budgets`. SettingsContext also uses AsyncStorage. The app already has TanStack Query persistence via MMKV (`src/services/QueryPersistenceProvider.tsx`), but BudgetContext bypasses it.

When BudgetContext migrates to TanStack Query:

1. Old AsyncStorage data is NOT automatically loaded into TanStack Query's MMKV persister. The persister stores serialized query cache, not raw entity data.
2. Users with existing budget data in AsyncStorage will see empty budgets after migration.
3. The MMKV persister currently persists ALL mutations (`shouldDehydrateMutation: () => true`), which is dangerous — it can replay stale mutations on next launch, creating duplicate records.

**Why it happens:**
TanStack Query persistence stores the _query cache_ (serialized), not the _domain data_ in its original format. AsyncStorage stores domain objects directly. These are incompatible serialization formats.

**How to avoid:**

- Before removing BudgetContext's AsyncStorage code, write a one-time migration that reads `@BuddyApp:budgets` from AsyncStorage, writes it to Supabase (or into TanStack Query cache via `queryClient.setQueryData`), then clears the AsyncStorage key.
- For the persister, change `shouldDehydrateMutation` to only persist offline mutations (those with `status === 'pending'`), not completed ones. The current blanket `true` will replay mutations on every app restart.
- Test the migration by: populating AsyncStorage with budget data, running the migration, verifying data appears in the new system, then clearing AsyncStorage.

**Warning signs:**

- Users report missing budgets after app update.
- Duplicate transactions appearing (from replayed persisted mutations).
- MMKV cache grows unbounded (mutations are never pruned).

**Phase to address:**
The phase where BudgetContext and SettingsContext migrate off AsyncStorage. Must include a one-time migration step in the release.

---

### Pitfall 6: gcTime of 7 Days Causes Memory Pressure on Low-End Devices

**What goes wrong:**
`QueryPersistenceProvider` sets `gcTime: 1000 * 60 * 60 * 24 * 7` (7 days) as the default. Combined with `shouldDehydrateMutation: () => true`, this means:

- Every query result stays in memory for 7 days after last use.
- Every completed mutation is persisted to MMKV.
- On a device with 2GB RAM, a user who visits all screens generates 10+ query caches that all persist for a week.
- The MMKV persister stores the ENTIRE query client as a single serialized blob. As this grows, serialization/deserialization on every cache change becomes slow.

**Why it happens:**
The 7-day gcTime was likely copied from a web SSR guide. On mobile, 7 days is excessive — users who close the app and return tomorrow should get fresh data, not week-old cache.

**How to avoid:**

- Set gcTime to 1 hour for most queries, 24 hours max for rarely-changing data (categories, settings).
- Set per-query `gcTime` overrides based on data freshness needs:
  - Transactions: `gcTime: 30 * 60 * 1000` (30 min)
  - Budgets: `gcTime: 60 * 60 * 1000` (1 hour)
  - Categories: `gcTime: 24 * 60 * 60 * 1000` (24 hours)
  - Settings: `gcTime: 24 * 60 * 60 * 1000` (24 hours)
- Change `shouldDehydrateMutation` to only persist mutations that are `status === 'pending'` (offline mutations awaiting network).
- Consider using `maxPersistedQueryCount` to cap the persister size.

**Warning signs:**

- App becomes sluggish after extended use.
- MMKV storage file grows large (>1MB).
- Slow app startup as the entire serialized cache is deserialized.

**Phase to address:**
Early infrastructure phase — adjust QueryPersistenceProvider defaults before migrating contexts onto it. These defaults affect every query in the app.

---

### Pitfall 7: HomeScreen Consumes 10 Contexts — Refactoring Order Creates Breaking Cascades

**What goes wrong:**
HomeScreen imports 10 hooks (lines 26-33 of `src/screens/HomeScreen.tsx`):

```typescript
(useTransaction,
  useCategory,
  useBudget,
  useSavings,
  useFinancialAnalytics,
  useSettings,
  useGroups,
  useAuth,
  useUser,
  useMembership);
```

If contexts are migrated one at a time (e.g., TransactionContext in Phase 1, BudgetContext in Phase 2), then:

- HomeScreen must be partially refactored multiple times.
- Each partial refactor changes the data access pattern for one hook while others remain context-based.
- The mixing of TanStack Query hooks and traditional context hooks in the same screen creates confusing loading state logic — `isPending` from TanStack vs `isLoading` from context.

**Why it happens:**
A "one context at a time" migration strategy seems safe but creates a long period where the app is in a hybrid state. Each screen that consumes multiple contexts gets touched repeatedly.

**How to avoid:**

- Migrate contexts in vertical slices grouped by domain, not one-at-a-time:
  - **Financial Core slice**: TransactionContext + CategoryContext + WalletContext (same phase)
  - **Budget slice**: BudgetContext (depends on Financial Core being done)
  - **Groups slice**: EnhancedGroupContext (depends on Financial Core being done)
  - **Analytics slice**: FinancialAnalyticsContext (depends on Budget + Financial Core)
- Within each slice, migrate all contexts in the slice together, then update all screens that consume only those contexts.
- For cross-slice screens like HomeScreen, do a single pass after all consumed slices are migrated.

**Warning signs:**

- HomeScreen has mixed `isLoading` and `isPending` checks.
- Screens partially refactored with TODO comments.
- Loading states are inconsistent (some data loads instantly from cache, others show spinners).

**Phase to address:**
The overall migration strategy. Define vertical slices before starting any migration work.

---

### Pitfall 8: Service Consolidation Merges Things That Should Stay Separate

**What goes wrong:**
The codebase has ~50 services in `src/services/`. The temptation is to consolidate `SupabaseDatabaseService` (the primary persistence layer) with domain-specific services like `LoanService`, `GroupActivityService`, `GroupMemberService`, etc.

Specific dangers:

1. `SupabaseDatabaseService` is already a god service that handles all entity types. Merging domain services INTO it makes it worse, not better.
2. `GroupActivityService` and `GroupMemberService` likely have group-specific business logic (activity feeds, role-based permissions) that doesn't belong in a general database service.
3. `StorageService` is used by LoanContext and SettingsContext for local persistence. It should NOT be merged with `SupabaseDatabaseService` — they serve different concerns (local vs remote).

**Why it happens:**
"Consolidation" sounds like reducing duplication. But these services have different responsibilities: `SupabaseDatabaseService` = persistence, `LoanService` = business logic (EMI calculation, amortization), `StorageService` = local caching.

**How to avoid:**

- Keep service boundaries aligned with responsibility, not entity type:
  - `SupabaseDatabaseService` — thin persistence layer (already exists, don't grow it).
  - Domain services (`LoanService`, `GroupActivityService`) — business logic that doesn't belong in a context or component.
  - `StorageService` — local persistence adapter (keep separate from remote).
- The correct consolidation target is the CONTEXT layer (removing CRUD boilerplate via TanStack Query), not the SERVICE layer.
- If `SupabaseDatabaseService` methods are one-liners that just call Supabase, those methods can stay. But don't add business logic to them.

**Warning signs:**

- `SupabaseDatabaseService.ts` exceeds 500 lines.
- Domain logic (EMI formulas, split calculations) appears in the database service.
- Circular imports between services.

**Phase to address:**
Service consolidation should happen AFTER context migration. Moving contexts to TanStack Query will naturally reduce the service surface area that contexts use, making consolidation opportunities clearer.

---

## Technical Debt Patterns

| Shortcut                                                          | Immediate Benefit                                     | Long-term Cost                                                                          | When Acceptable                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Keep BudgetContext on AsyncStorage while migrating other contexts | Fewer changes in Phase 1                              | Two persistence systems coexist; data migration later is harder                         | Never — budget tracking depends on transactions, must migrate together |
| Set `staleTime: Infinity` globally to prevent refetches           | No network requests, instant loads                    | Stale data shown until manual refresh; cache never auto-updates                         | Only for truly static data (default categories)                        |
| Use `queryClient.setQueryData` imperatively everywhere            | Quick optimistic updates without mutation boilerplate | Scattered cache manipulation; hard to debug stale data; no error handling               | Only inside `onMutate` callbacks of mutations                          |
| Keep CoordinationContext as a thin wrapper over TanStack Query    | Less code to change                                   | Dual systems for same purpose; confusing for new developers                             | Acceptable during migration transition only                            |
| Persist all mutations via `shouldDehydrateMutation: () => true`   | Offline mutations work                                | Replay on restart; duplicate data risk; growing cache size                              | Never — only persist pending/offline mutations                         |
| Use `useQuery` for analytics (FinancialAnalyticsContext)          | Consistent pattern with other contexts                | Analytics is computed data, not server data; query cache grows; invalidation complexity | Never — analytics should be derived via `useMemo` over query results   |

## Integration Gotchas

| Integration                                       | Common Mistake                                                                           | Correct Approach                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Supabase + TanStack Query                         | Writing Supabase calls directly in `queryFn` everywhere                                  | Create typed query function per entity: `fetchTransactions(userId)` that handles Supabase errors, then use it in `useQuery`     |
| MMKV Persister + SecureStore encryption           | Generating encryption key with `Math.random()` (line 18 of `MMKVPersister.ts`)           | Use `expo-crypto.getRandomValues()` or `expo-secure-store` key generation for cryptographic randomness                          |
| NetInfo + `onlineManager`                         | Not testing offline-to-online transition                                                 | Add integration test that toggles NetInfo state and verifies mutations resume via `resumePausedMutations`                       |
| Group expense creation + Transaction invalidation | Only invalidating group query after group expense mutation                               | Invalidate both `['groups']` and `['transactions']` query keys after any mutation that creates/modifies transactions            |
| Expo Router + TanStack Query                      | Not understanding that screen unmount/remount in tab navigation triggers refetches       | Set `staleTime` appropriately; use `refetchOnMount: 'stale'` (default) rather than `always`                                     |
| `expo-crypto.randomUUID` + optimistic IDs         | Using `Date.now().toString()` for temporary budget IDs (line 390 of `BudgetContext.tsx`) | Use `crypto.randomUUID()` for all IDs; temporary optimistic IDs should use a prefix like `temp-` to distinguish from server IDs |

## Performance Traps

| Trap                                                                                                  | Symptoms                                                     | Prevention                                                                                                                                                 | When It Breaks               |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `calculateTrackingData` runs on every transaction change                                              | Budget screen jank when transaction list is large            | Memoize with `useMemo` keyed on `[activeBudget, transactions.length, lastTransactionDate]` or compute in a Web Worker (the app already has `src/workers/`) | 500+ transactions            |
| `calculateAnalytics` iterates ALL transactions every time                                             | HomeScreen becomes sluggish                                  | Use `select` option on transaction query to pre-filter by period; or compute analytics in the existing Web Worker                                          | 1000+ transactions           |
| HomeScreen re-renders from 10 context subscriptions                                                   | Entire HomeScreen re-renders when any single context updates | Split into smaller components, each subscribing to only one context/query                                                                                  | Always (architectural issue) |
| MMKV persister serializes entire cache on every change                                                | UI freezes during cache persistence                          | Use `persister` with debounced writes; or switch to `@tanstack/query-async-storage-persister` with write throttle                                          | 50+ cached queries           |
| Parallel queries on HomeScreen (transactions + categories + budgets + groups + savings + investments) | Waterfall of network requests on cold start                  | Use `useQueries` for parallel fetching; use `prefetchQuery` in route loaders; set `staleTime` to avoid re-fetching on mount                                | Any cold start               |

## Security Mistakes

| Mistake                                                                 | Risk                                                                       | Prevention                                                                                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Math.random()` for MMKV encryption key (line 18 of `MMKVPersister.ts`) | Predictable key; encrypted data readable by attacker                       | Use `expo-crypto.getRandomValues()` or platform key generation                                                             |
| Persisting mutation payloads that may contain sensitive data            | Transaction amounts, loan details stored unencrypted in query cache        | MMKV persister uses encrypted storage (good), but verify `withEncryption()` is active and the key is stored in SecureStore |
| No cache clearing on logout                                             | Stale user data persists after logout; next user sees previous user's data | Call `queryClient.clear()` and `persister.removeClient()` in logout flow                                                   |
| `Date.now().toString()` for entity IDs                                  | Collisions possible; IDs guessable                                         | Use `crypto.randomUUID()` for all entity IDs                                                                               |

## UX Pitfalls

| Pitfall                                                   | User Impact                                        | Better Approach                                                                            |
| --------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Budget tracking shows zeros during transaction loading    | User thinks budget reset                           | Use `placeholderData: previousTrackingData` or show a skeleton instead of zeroed values    |
| Stale budget tracking after group expense                 | User overspends because tracking didn't update     | Invalidate budget tracking query after any transaction mutation (including group expenses) |
| Offline mutation silently fails with no user feedback     | User thinks action succeeded but it didn't persist | Show pending indicator for offline mutations; use `useIsMutating` to show sync status      |
| Global loading indicator removed with CoordinationContext | User doesn't know if app is loading or broken      | Use TanStack Query's `useIsFetching()` / `useIsMutating()` to drive a global loading bar   |

## "Looks Done But Isn't" Checklist

- [ ] **TanStack Query migration:** Often missing cross-query invalidation — verify that EVERY mutation that touches shared data (transactions) invalidates ALL dependent queries (budgets, analytics, groups)
- [ ] **Context removal:** Often missing consumers — grep for `use[ContextName]` imports across entire `src/` directory before deleting a context file
- [ ] **AsyncStorage migration:** Often missing one-time data migration — verify old AsyncStorage keys are read, migrated, and cleared in a migration script
- [ ] **CoordinationContext removal:** Often missing global loading state replacement — verify `useIsFetching()` is wired to the loading indicator before removing `globalLoadingState`
- [ ] **Service consolidation:** Often missing business logic that lives in services — verify all exported functions from a service being merged are accounted for
- [ ] **MMKV persister:** Often missing mutation replay guard — verify `shouldDehydrateMutation` filters to only pending mutations, not all mutations
- [ ] **Query key consistency:** Often missing query key typos — create a centralized query key factory and ban raw string query keys via ESLint rule

## Recovery Strategies

| Pitfall                                 | Recovery Cost | Recovery Steps                                                                         |
| --------------------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| Budget-transaction dependency break     | HIGH          | Revert BudgetContext to AsyncStorage; fix invalidation; re-migrate                     |
| Stale analytics after partial migration | MEDIUM        | Add manual invalidation calls; refactor to derived state later                         |
| Group expenses not appearing globally   | LOW           | Add `invalidateQueries(['transactions'])` to group mutation callbacks                  |
| CoordinationContext removed too early   | MEDIUM        | Re-add CoordinationContext stub; migrate consumers one by one; remove again            |
| AsyncStorage data lost                  | HIGH          | Restore from Supabase (if synced); add migration script; re-release                    |
| Memory pressure from gcTime             | LOW           | Change gcTime defaults; deploy; caches naturally clear                                 |
| HomeScreen mixed loading states         | MEDIUM        | Standardize on TanStack Query `isPending`/`isFetching`; remove all context `isLoading` |

## Pitfall-to-Phase Mapping

| Pitfall                                    | Prevention Phase                                                         | Verification                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Budget-Transaction dependency (P1)         | Phase where both contexts migrate (same phase or adjacent)               | Add transaction, verify budget tracking updates within 1 second            |
| Analytics cascade (P2)                     | Last phase (after transactions + categories + budgets all migrated)      | Change transaction, verify analytics updates without page reload           |
| Group-Transaction invalidation gap (P3)    | Phase where GroupContext migrates to TanStack Query                      | Add group expense, verify it appears on HomeScreen immediately             |
| CoordinationContext premature removal (P4) | Late phase (after all contexts migrated and all event bus usage removed) | Grep for `useCoordination` and `coordinationEventBus` returns zero results |
| AsyncStorage data loss (P5)                | Phase where BudgetContext/SettingsContext drop AsyncStorage              | Test with pre-populated AsyncStorage, verify data survives migration       |
| gcTime memory pressure (P6)                | First infrastructure phase (before any context migration)                | Monitor MMKV file size; test on low-end device with 2GB RAM                |
| HomeScreen cascade refactoring (P7)        | Define vertical slices before Phase 1 starts                             | No screen has mixed `isLoading`/`isPending` at any point                   |
| Service consolidation errors (P8)          | After all context migrations complete                                    | No circular imports; SupabaseDatabaseService doesn't grow in line count    |

## Refactoring Order Recommendation

Based on the dependency analysis, the correct order is:

```
Phase 0: Infrastructure
  - Fix QueryPersistenceProvider defaults (gcTime, mutation persistence)
  - Create centralized query key factory
  - Fix encryption key generation

Phase 1: Financial Core (no cross-deps)
  - Migrate CategoryContext (standalone, used by TransactionContext)
  - Migrate WalletContext (standalone, no query dependencies)
  - Migrate TransactionContext (depends on auth, standalone data)

Phase 2: Budget + Group (both depend on transactions)
  - Migrate BudgetContext (reads from transactions — MUST have cross-invalidation)
  - Migrate EnhancedGroupContext (creates transactions — MUST invalidate transaction queries)
  - Wire transaction-to-budget and group-to-transaction invalidation

Phase 3: Other Domain Contexts
  - Migrate LoanContext (standalone CRUD via StorageService)
  - Migrate InvestmentContext (already partially on TanStack Query)
  - Migrate SavingsContext
  - Migrate SubscriptionContext

Phase 4: Analytics (depends on everything)
  - Refactor FinancialAnalyticsContext to derived hook (NOT a query)
  - Migrate SettingsContext off AsyncStorage

Phase 5: Cleanup
  - Remove CoordinationContext
  - Remove AsyncStorage migration code
  - Consolidate services (if still needed after context cleanup)
```

Key dependency chain:

```
Auth (always first)
  -> Categories, Wallets (independent of each other)
  -> Transactions (needs auth)
    -> Budgets (needs transactions)
    -> Groups (creates transactions, needs settings for currency)
      -> Analytics (needs transactions + categories + budgets)
```

## Sources

- [TanStack Query Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults) — staleTime and gcTime defaults
- [TanStack Query React Native Guide](https://tanstack.com/query/latest/docs/framework/react/react-native) — platform-specific guidance
- [TanStack Query Dependent Queries](https://tanstack.com/query/v4/docs/framework/react/guides/dependent-queries) — `enabled` pattern for cross-query dependencies
- [TkDodo's Blog — React Query Common Mistakes](https://tkdodo.eu/blog/react-query-common-mistakes) — authoritative list of anti-patterns from TanStack Query maintainer
- [TanStack Query Persistence Discussion — gcTime Memory](https://github.com/TanStack/query/discussions/6214) — memory considerations for React Native
- [TanStack Query Persistence — SSR Memory](https://github.com/TanStack/query/discussions/3284) — cache accumulation patterns
- Codebase analysis: `src/context/BudgetContext.tsx`, `src/context/TransactionContext.tsx`, `src/context/FinancialAnalyticsContext.tsx`, `src/context/EnhancedGroupContext.tsx`, `src/context/CoordinationContext.tsx`, `src/services/QueryPersistenceProvider.tsx`, `src/services/MMKVPersister.ts`

---

_Pitfalls research for: BuddyIO React Native architecture overhaul_
_Researched: 2026-04-28_
