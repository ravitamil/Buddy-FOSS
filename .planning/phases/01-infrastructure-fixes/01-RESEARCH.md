# Phase 1: Infrastructure Fixes and Quick Wins - Research

**Researched:** 2026-04-28
**Domain:** TanStack Query v5 configuration, MMKV persistence, gifted-charts migration, offline queuing
**Confidence:** HIGH

## Summary

This phase addresses foundational infrastructure issues before feature work begins. The codebase already uses TanStack Query v5 with MMKV persistence and gifted-charts, but the configuration has critical gaps: uniform gcTime/staleTime across all entity types, indiscriminate mutation persistence, weak encryption key generation, and six mock setTimeout calls that simulate unimplemented sync operations. Eight screens still import from `react-native-chart-kit` (being removed) while five working gifted-charts wrapper components already exist in `src/components/charts/`.

The chart migration is straightforward because the existing gifted-charts wrappers demonstrate every pattern needed (PieChart donut, LineChart area, BarChart with gradients). The data format conversion from chart-kit's `{labels, datasets}` to gifted-charts' `[{value, label, color}]` is mechanical. Offline mutation queuing requires a custom layer since TanStack Query v5's PersistQueryClientProvider persists queries but does not natively queue mutations for offline replay.

**Primary recommendation:** Fix QueryClient defaults and persister first (everything depends on it), then build the query key factory, migrate charts, remove mocks, and add offline mutation queuing last (it depends on the key factory for invalidation).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Keep gifted-charts, remove react-native-chart-kit and @shopify/react-native-skia
- Migrate all 8 chart-kit screens to gifted-charts in this phase (don't defer)
- Existing gifted-charts wrapper components in src/components/charts/: Claude decides whether to keep wrappers or import directly during planning
- Array-based keys (TanStack Query standard pattern)
- Domain + operation granularity: e.g., `['transactions', 'list']`, `['transactions', 'detail', id]`
- Single central file at `src/lib/query-keys.ts` with all domain key families
- Key families for all 10 domains: transactions, budgets, groups, loans, investments, savings, subscriptions, categories, wallets, analytics
- Structure enables invalidating all queries for a domain (`['transactions']`) or just a specific operation (`['transactions', 'list']`)

### Claude's Discretion

- Whether to keep gifted-charts wrapper components or import directly
- Exact QueryClient gcTime/staleTime values per entity type
- MMKV persistence configuration details (maxAge, dehydration rules)
- How to handle the chart-kit to gifted-charts migration for each screen (direct replacement or wrapper adaptation)
- Offline mutation queue implementation details (conflict resolution, retry strategy)

### Deferred Ideas (OUT OF SCOPE)

None
</user_constraints>

## Standard Stack

### Core

| Library                              | Version     | Purpose                     | Why Standard                                                     |
| ------------------------------------ | ----------- | --------------------------- | ---------------------------------------------------------------- |
| @tanstack/react-query                | ^5.90.21    | Server state management     | Already installed; v5 stable API with PersistQueryClientProvider |
| @tanstack/react-query-persist-client | ^5.90.22    | Query persistence adapter   | Already installed; provides persister interface for MMKV         |
| react-native-mmkv-storage            | ^12.0.1     | Encrypted key-value storage | Already installed; fast synchronous reads, encryption support    |
| react-native-gifted-charts           | ^1.4.63     | Chart rendering             | Already installed; PieChart, LineChart, BarChart with rich API   |
| @react-native-community/netinfo      | (installed) | Online/offline detection    | Already integrated in QueryPersistenceProvider                   |

### Supporting

| Library             | Version     | Purpose            | When to Use                                         |
| ------------------- | ----------- | ------------------ | --------------------------------------------------- |
| expo-secure-store   | (installed) | Secure key storage | Storing MMKV encryption key (already in use)        |
| dayjs               | (installed) | Date formatting    | Used in chart data preparation, settlement grouping |
| currency-symbol-map | (installed) | Currency symbols   | Used in chart Y-axis labels                         |

### Removals

| Package                    | Version | Why Remove                                  |
| -------------------------- | ------- | ------------------------------------------- |
| react-native-chart-kit     | ^6.12.0 | Replaced by gifted-charts per decision      |
| @shopify/react-native-skia | 2.2.12  | Unused; was only a chart-kit transitive dep |

### Potentially Unused (Verify Before Removing)

| Package                      | Why Suspect Unused                            |
| ---------------------------- | --------------------------------------------- |
| zustand ^5.0.8               | All state uses React Context + TanStack Query |
| react-native-easing-gradient | Not found in any imports                      |
| react-native-web             | Web platform out of scope per CLAUDE.md       |
| bootstrap-icons              | No web usage in RN project                    |
| react-day-picker             | No date picker component found                |
| text-encoding                | Polyfill not needed in RN runtime             |
| prop-types                   | TypeScript project, no PropTypes usage        |

**Installation:**
No new packages needed. All removals via `npm uninstall`.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── query-keys.ts          # Central query key factory (NEW)
├── services/
│   ├── QueryPersistenceProvider.tsx  # Fix defaults
│   ├── MMKVPersister.ts              # Fix encryption, add maxAge
│   └── OfflineMutationQueue.ts       # NEW: offline mutation queuing
├── components/
│   └── charts/                # Keep wrappers, add new ones as needed
└── context/
    ├── BudgetContext.tsx       # Remove 3 mock setTimeouts
    ├── CoordinationContext.tsx  # Remove 2 mock setTimeouts
    └── WalletContext.tsx       # Remove 1 mock setTimeout
```

### Pattern 1: Query Key Factory

**What:** Centralized array-based query keys with domain + operation granularity
**When to use:** Every useQuery, useMutation, and invalidateQueries call
**Example:**

```typescript
// src/lib/query-keys.ts
// Source: TanStack Query v5 docs - Query Keys pattern

export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: TransactionFilters) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeys.budgets.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.budgets.all, 'detail', id] as const,
    active: () => [...queryKeys.budgets.all, 'active'] as const,
  },
  // ... 8 more domains following same pattern
} as const;
```

**Existing key patterns to migrate FROM:**

```typescript
// Current scattered patterns (found in codebase):
['transactions', user?.uid][('groups', user?.uid)][('categories', user?.uid)][ // TransactionContext // EnhancedGroupContext // CategoryContext
  ('investments', user?.uid)
][('investment_categories', user?.uid)]; // InvestmentContext // InvestmentContext
```

**Key insight:** The current keys include `user?.uid` which is valid for scoping but breaks the `['transactions']` prefix matching needed for domain-wide invalidation. The factory should either include UID in a nested level or rely on queryClient context scoping. Given the codebase uses a single shared QueryClient, include UID as part of the key: `['transactions', 'list', uid]` still matches `['transactions']` for prefix invalidation.

### Pattern 2: Entity-Type-Specific gcTime/staleTime

**What:** Different cache durations for different entity change frequencies
**When to use:** QueryClient defaultOptions and per-query overrides
**Example:**

```typescript
// Recommended tiers (Claude's discretion area - these are recommendations):

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Safe defaults - overridden per entity type
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (down from 7 days)
      staleTime: 1000 * 60 * 2, // 2 minutes (down from 5 min)
      retry: 2,
    },
  },
});

// Per-query overrides at useQuery call sites:
// - Transactions: staleTime 1 min (frequent changes), gcTime 1 hour
// - Categories: staleTime 30 min (rarely change), gcTime 24 hours
// - Analytics: staleTime 5 min (computed), gcTime 1 hour
// - Budgets: staleTime 5 min, gcTime 4 hours
// - Groups: staleTime 5 min, gcTime 4 hours
```

### Pattern 3: Selective Mutation Persistence

**What:** Only persist mutations that are safe to replay (idempotent operations)
**When to use:** PersistQueryClientProvider dehydrateOptions
**Example:**

```typescript
// Current (BROKEN - persists ALL mutations):
shouldDehydrateMutation: () => true;

// Fixed - only persist mutations with explicit opt-in:
shouldDehydrateMutation: (mutation) => {
  // Only persist mutations tagged as offline-safe
  return mutation.meta?.offlineSafe === true;
};
```

### Pattern 4: Gifted-Charts Data Format

**What:** Array-of-objects data format vs chart-kit's labels/datasets format
**When to use:** Every chart migration

**chart-kit (OLD):**

```typescript
<LineChart
  data={{
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{ data: [100, 200, 150] }],
  }}
  chartConfig={{ ... }}
/>
<PieChart
  data={[{ name: 'Food', amount: 500, color: '#FF6B6B' }]}
  accessor="amount"
  backgroundColor="transparent"
/>
```

**gifted-charts (NEW):**

```typescript
<LineChart
  data={[
    { value: 100, label: 'Jan' },
    { value: 200, label: 'Feb' },
    { value: 150, label: 'Mar' },
  ]}
  areaChart
  curved
/>
<PieChart
  data={[
    { value: 500, color: '#FF6B6B', label: 'Food' },
  ]}
  showText
  donut
  innerRadius={40}
/>
```

**Key differences:**

1. chart-kit uses separate `labels` and `datasets` arrays; gifted-charts uses a single `data` array of objects with `value`, `label`, `color` properties
2. chart-kit PieChart uses `accessor` prop to specify which field is the value; gifted-charts PieChart uses `value` directly
3. chart-kit uses `chartConfig` callback for colors/styling; gifted-charts uses direct props on each data object and chart component
4. gifted-charts LineChart requires `areaChart` prop for filled area (chart-kit uses `filled`)

### Anti-Patterns to Avoid

- **Uniform gcTime/staleTime for all entities:** Transactions change frequently; categories rarely do. Same defaults waste memory on stale data or cause unnecessary refetches.
- **`shouldDehydrateMutation: () => true`:** Persists ALL mutations including non-idempotent ones like "create transaction" which could duplicate on replay.
- **`Math.random()` for encryption keys:** Use `expo-crypto` or `expo-secure-store` for key generation. Current code stores in SecureStore but generates with Math.random().
- **Mock setTimeout as sync stubs:** Fake delays that mask missing implementation. Either implement the sync or remove the function entirely.
- **Inline query keys:** Scattered string arrays like `['transactions', user?.uid]` make it impossible to reliably invalidate by domain prefix.

## Don't Hand-Roll

| Problem                        | Don't Build                           | Use Instead                                     | Why                                                               |
| ------------------------------ | ------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Query key management           | Ad-hoc string arrays                  | Centralized query-keys.ts factory               | Prefix matching for invalidation, type safety, discoverability    |
| Mutation persistence filtering | `shouldDehydrateMutation: () => true` | Mutation.meta-based opt-in                      | Prevents duplicate creates on offline replay                      |
| Encryption key generation      | `Math.random().toString(36)`          | `expo-crypto` `getRandomBytes()` or SecureStore | Math.random() is not cryptographically secure                     |
| Online/offline detection       | Custom NetInfo polling                | `onlineManager.setEventListener` with NetInfo   | Already integrated; TanStack Query pauses mutations automatically |

**Key insight:** TanStack Query v5's `onlineManager` already handles pausing mutations when offline and resuming when online (via `resumePausedMutations()`). The custom part is only persisting queued mutations to disk so they survive app restarts.

## Common Pitfalls

### Pitfall 1: Query Key Prefix Matching With UID

**What goes wrong:** Keys like `['transactions', user?.uid]` do NOT match prefix invalidation for `['transactions']` because TanStack Query does exact-prefix matching and `user?.uid` is a separate element
**Why it happens:** Developers assume `queryClient.invalidateQueries({ queryKey: ['transactions'] })` matches any key starting with `['transactions']` -- it does, BUT only because TanStack Query uses `startsWith` semantics for partial keys. The UID at index 1 is fine.
**How to avoid:** Test invalidation with `queryClient.invalidateQueries({ queryKey: ['transactions'] })` after migrating each context. The factory structure `['transactions', 'list', uid]` ensures `['transactions']` matches all transaction queries.
**Warning signs:** After a mutation, stale data remains visible; queries don't refetch.

### Pitfall 2: Persisting Non-Idempotent Mutations

**What goes wrong:** A "create transaction" mutation is persisted, app goes offline, user force-quits, app restarts and replays the mutation, creating a duplicate transaction.
**Why it happens:** `shouldDehydrateMutation: () => true` persists everything indiscriminately.
**How to avoid:** Only persist mutations with `meta.offlineSafe: true`. Reserve this for updates and deletes (which are idempotent with IDs), not creates (which can duplicate).
**Warning signs:** Duplicate records appearing after app restart following an offline period.

### Pitfall 3: MMKV maxAge Not Set

**What goes wrong:** Cached query data from months ago persists indefinitely, growing storage and potentially containing very stale data that doesn't match current schema.
**Why it happens:** MMKVPersister.ts has no `maxAge` option in `persistOptions`.
**How to avoid:** Set `maxAge` in PersistQueryClientProvider's `persistOptions` (e.g., 24 hours). TanStack's persist layer handles expiry automatically.
**Warning signs:** App shows outdated data after long periods of no use; storage grows unbounded.

### Pitfall 4: Chart Migration Dropping Features

**What goes wrong:** Migrated chart loses gradient fills, animations, or touch interactions that existed in chart-kit version.
**Why it happens:** chart-kit and gifted-charts have different prop names for similar features (e.g., `bezier` vs `curved`, `filled` vs `areaChart`).
**How to avoid:** For each migrated screen, document the chart-kit props, then map each to gifted-charts equivalent. The CONTEXT.md says "functional equivalence is sufficient" so visual pixel-perfection is not required, but interactions and data display must match.
**Warning signs:** Charts render but look flat (no gradients), or don't animate on load.

### Pitfall 5: Removing Mock setTimeout Breaks Context API

**What goes wrong:** Removing mock setTimeout calls in BudgetContext/WalletContext breaks components that call `syncWithRemote()` and expect `setIsLoading` state transitions.
**Why it happens:** The mock functions still set loading/error/sync states. Removing the setTimeout but keeping the state management logic is correct; removing the entire function breaks callers.
**How to avoid:** Replace mock functions with actual Supabase sync calls, OR remove both the function AND all call sites if sync is handled by TanStack Query. Check all consumers before deleting.
**Warning signs:** TypeScript compile errors on removed functions, or runtime "not a function" errors.

### Pitfall 6: CoordinationContext Initialization Timing

**What goes wrong:** Removing the 100ms initialization delay in CoordinationContext causes race conditions where contexts aren't ready when coordination events fire.
**Why it happens:** The delay was added as a workaround for initialization ordering. Removing it without understanding dependencies may break startup.
**How to avoid:** The delay is artificial; replace with a proper readiness check (e.g., verify auth state is resolved) or remove entirely since individual contexts manage their own initialization as the code comment states.
**Warning signs:** White screen on app launch, contexts reporting uninitialized state.

## Code Examples

### Example 1: Query Key Factory (Full 10-Domain Structure)

```typescript
// src/lib/query-keys.ts
// Source: TanStack Query v5 docs - Query Keys pattern

export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (uid: string, filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), uid, filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (uid: string, id: string) => [...queryKeys.transactions.details(), uid, id] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeys.budgets.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.budgets.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.budgets.all, 'detail', uid, id] as const,
    active: (uid: string) => [...queryKeys.budgets.all, 'active', uid] as const,
  },
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.groups.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.groups.all, 'detail', uid, id] as const,
  },
  loans: {
    all: ['loans'] as const,
    lists: () => [...queryKeys.loans.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.loans.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.loans.all, 'detail', uid, id] as const,
  },
  investments: {
    all: ['investments'] as const,
    categories: {
      all: ['investment_categories'] as const,
      list: (uid: string) => [...queryKeys.investments.categories.all, uid] as const,
    },
    lists: () => [...queryKeys.investments.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.investments.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.investments.all, 'detail', uid, id] as const,
  },
  savings: {
    all: ['savings'] as const,
    lists: () => [...queryKeys.savings.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.savings.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.savings.all, 'detail', uid, id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...queryKeys.subscriptions.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.subscriptions.lists(), uid] as const,
    detail: (uid: string, id: string) =>
      [...queryKeys.subscriptions.all, 'detail', uid, id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.categories.lists(), uid] as const,
  },
  wallets: {
    all: ['wallets'] as const,
    lists: () => [...queryKeys.wallets.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.wallets.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.wallets.all, 'detail', uid, id] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: (uid: string) => [...queryKeys.analytics.all, 'summary', uid] as const,
    trends: (uid: string, range: string) =>
      [...queryKeys.analytics.all, 'trends', uid, range] as const,
  },
} as const;
```

### Example 2: Fixed QueryPersistenceProvider Defaults

```typescript
// Source: TanStack Query v5 PersistQueryClientProvider docs
// Source: Existing QueryPersistenceProvider.tsx in codebase

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,  // 24 hours default (down from 7 days)
      staleTime: 1000 * 60 * 2,      // 2 minutes default (down from 5 min)
      retry: 2,
    },
  },
});

// In PersistQueryClientProvider:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 24,  // 24 hours - expire old cache
    dehydrateOptions: {
      shouldDehydrateMutation: (mutation) => {
        // Only persist idempotent mutations (updates, deletes)
        return mutation.meta?.offlineSafe === true;
      },
      shouldDehydrateQuery: (query) => {
        return query.state.data !== undefined;
      },
    },
  }}
  onSuccess={() => {
    queryClient.resumePausedMutations();
  }}
>
```

### Example 3: Fixed MMKV Encryption Key Generation

```typescript
// Source: expo-crypto docs / expo-secure-store docs
// Current (WEAK): Math.random().toString(36).substring(2) + Date.now().toString(36)
// Fixed:

import * as Crypto from 'expo-crypto';

let encryptionKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
if (!encryptionKey) {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  encryptionKey = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, encryptionKey);
}
```

### Example 4: Chart Migration Pattern (chart-kit to gifted-charts)

```typescript
// BEFORE (chart-kit - BudgetAnalytics.tsx daily spending trend):
<LineChart
  data={{
    labels: analytics.dailyTrend
      .filter((_, i) => i % 5 === 0)
      .map(d => d.date.toString()),
    datasets: [{ data: analytics.dailyTrend.map(d => d.amount) }],
  }}
  width={screenWidth - 32}
  height={180}
  chartConfig={chartConfig}
  bezier
  withDots={false}
/>

// AFTER (gifted-charts):
<LineChart
  data={analytics.dailyTrend.map(d => ({
    value: d.amount,
    label: d.date.toString(),
  }))}
  width={screenWidth - 32}
  height={180}
  color={isDarkMode ? '#4ECDC4' : '#2196F3'}
  thickness={3}
  startFillColor={isDarkMode ? 'rgba(78, 205, 196, 0.3)' : 'rgba(33, 150, 243, 0.3)'}
  endFillColor={isDarkMode ? 'rgba(78, 205, 196, 0.05)' : 'rgba(33, 150, 243, 0.05)'}
  areaChart
  curved
  hideDataPoints
  yAxisTextStyle={{ color: isDarkMode ? '#8E8E93' : '#3C3C43', fontSize: 10 }}
  xAxisLabelTextStyle={{ color: isDarkMode ? '#8E8E93' : '#3C3C43', fontSize: 10 }}
  noOfSections={4}
/>
```

### Example 5: Mock setTimeout Removal Pattern

```typescript
// BEFORE (BudgetContext.tsx syncWithRemote):
const syncWithRemote = useCallback(async (): Promise<void> => {
  try {
    setIsLoading(true);
    setError(null);
    // Mock sync - in real implementation, this would sync with Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSyncTime(new Date());
    logger.info('Budgets synced with remote successfully');
  } catch (error) { ... }
}, []);

// AFTER (Option A - Replace with TanStack Query invalidation):
// Delete syncWithRemote entirely. TanStack Query handles refetching.
// Call sites use: queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all })

// AFTER (Option B - Replace with actual Supabase sync):
const syncWithRemote = useCallback(async (): Promise<void> => {
  try {
    setIsLoading(true);
    setError(null);
    await queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    setLastSyncTime(new Date());
    logger.info('Budgets synced with remote successfully');
  } catch (error) { ... }
}, [queryClient]);
```

## State of the Art

| Old Approach                  | Current Approach                  | When Changed                       | Impact                                              |
| ----------------------------- | --------------------------------- | ---------------------------------- | --------------------------------------------------- |
| react-native-chart-kit        | react-native-gifted-charts        | chart-kit unmaintained since 2022  | Must migrate; chart-kit has RN new arch issues      |
| Math.random() encryption keys | expo-crypto getRandomBytesAsync   | Always best practice               | Current code is insecure but functional             |
| Uniform QueryClient defaults  | Per-entity-type gcTime/staleTime  | TanStack Query v5 best practice    | Reduces memory usage, improves UX                   |
| Persist all mutations         | Meta-tagged selective persistence | TanStack Query v5 pattern          | Prevents data duplication on offline replay         |
| Inline query key arrays       | Centralized query key factory     | TanStack Query docs recommendation | Enables reliable domain-wide invalidation           |
| AsyncStorage for domain data  | TanStack Query + MMKV persistence | Modern RN best practice            | Faster reads, encrypted, automatic cache management |

**Deprecated/outdated:**

- `react-native-chart-kit`: Unmaintained, last publish 2022. Has issues with React Native new architecture (Fabric). Being removed per decision.
- `@shopify/react-native-skia`: Installed but unused. Heavy native dependency that increases build time and binary size. Being removed per decision.
- `AsyncStorage` for domain data: Slower than MMKV, unencrypted. Keep for legitimate uses (settings, auth tokens, notification prefs) but domain data should live in TanStack Query cache.

## Open Questions

1. **Should existing gifted-charts wrappers be kept or should screens import directly?**
   - What we know: 5 working wrappers exist in `src/components/charts/` (CategorySpendingChart, ExpenseDistributionChart, SpendingTrendsChart, ComparisonMetricsChart, SettlementTimelineChart). Only CircularProgressChart is exported from `index.ts`.
   - What's unclear: Whether the wrappers provide enough value vs direct imports. They handle data aggregation (groupBy, filter, sort) which is useful logic.
   - Recommendation: Keep wrappers. They encapsulate data transformation logic that would otherwise pollute screen components. Update `index.ts` to export all chart wrappers. For migrated screens, either adapt existing wrappers or create new ones following the same pattern.

2. **How should mock sync functions be replaced in contexts that don't yet use TanStack Query?**
   - What we know: BudgetContext and WalletContext have mock syncWithRemote with setTimeout. Neither uses TanStack Query currently.
   - What's unclear: Whether to (a) convert these contexts to TanStack Query now, or (b) just remove the mock delays and keep current state management, deferring full TanStack Query migration.
   - Recommendation: Minimal change -- replace mock setTimeout with immediate state updates. Full TanStack Query migration for Budget/Wallet is a larger effort that could be Phase 2 work. The mock delays serve no purpose and should be removed regardless.

3. **What is the offline mutation conflict resolution strategy?**
   - What we know: TanStack Query v5 auto-pauses mutations when offline (via onlineManager). resumePausedMutations() already fires after hydration.
   - What's unclear: What happens when a mutation is queued offline but the server state has changed by the time it replays? (e.g., editing a budget whose amounts were updated by another device)
   - Recommendation: Start simple -- optimistic updates with rollback on error, 3 retries with exponential backoff, and a toast notification on permanent failure. Server-side conflict resolution (timestamps, versioning) is Phase 2+ work.

4. **Is zustand actually used anywhere?**
   - What we know: Listed as dependency ^5.0.8 in package.json.
   - What's unclear: No imports found via grep. May be a leftover from earlier prototyping.
   - Recommendation: Verify with `npm ls zustand` before removing. If no dependents, safe to remove.

## Sources

### Primary (HIGH confidence)

- Codebase analysis of `src/services/QueryPersistenceProvider.tsx` -- current QueryClient configuration, persister setup, dehydrateOptions
- Codebase analysis of `src/services/MMKVPersister.ts` -- MMKV instance config, encryption key generation
- Codebase analysis of `src/components/charts/*.tsx` -- working gifted-charts wrapper patterns (5 components)
- Codebase analysis of `src/context/*.tsx` -- existing query key patterns across 5 contexts (Transaction, Group, Category, Investment, EnhancedGroup)
- Codebase analysis of `src/components/BudgetAnalytics.tsx` -- chart-kit LineChart/PieChart/BarChart usage with `{labels, datasets}` format
- TanStack Query v5 installed version ^5.90.21 -- API verified against codebase usage patterns

### Secondary (MEDIUM confidence)

- TanStack Query v5 docs patterns for query key factory structure and prefix invalidation behavior
- react-native-gifted-charts npm README (^1.4.63) -- API surface verified against working codebase components
- react-native-mmkv-storage docs -- MMKVLoader API, encryption configuration, withInstanceID pattern
- expo-crypto docs -- getRandomBytesAsync for secure key generation
- @tanstack/react-query-persist-client -- PersistQueryClientProvider maxAge option, shouldDehydrateMutation API

### Tertiary (LOW confidence)

- gifted-charts documentation site (gifted-charts.web.app) -- SPA that doesn't render server-side; could not scrape for API details. Worked around by analyzing existing working components.
- react-native-chart-kit deprecation status -- npm shows last publish 2022, but no formal deprecation announcement found. Flagged as unmaintained based on activity.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all libraries already installed and in use in the codebase; verified by direct code analysis
- Architecture: HIGH - query key factory pattern is well-documented by TanStack; existing codebase already demonstrates the pattern partially
- Chart migration: HIGH - 8 chart-kit screens identified, 5 working gifted-charts wrappers already demonstrate all needed patterns (PieChart donut, LineChart area, BarChart gradient)
- Pitfalls: MEDIUM - offline mutation queuing edge cases (conflict resolution, duplicate creates) are based on TanStack Query v5 behavior and community patterns, not yet tested in this specific codebase
- Dependency cleanup: MEDIUM - "potentially unused" packages need runtime verification before removal

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (stable domain - query patterns and chart APIs don't change frequently)

---

_Phase: 01-infrastructure-fixes_
_Research gathered: 2026-04-28_
