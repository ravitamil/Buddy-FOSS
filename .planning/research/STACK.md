# Stack Research

**Domain:** Server State Management — TanStack Query v5 as sole server state layer in a React Native + Expo finance app
**Researched:** 2026-04-28
**Confidence:** HIGH (official TanStack docs, TkDodo blog, codebase audit)

## Recommended Stack

### Core Technologies

| Technology                           | Version  | Purpose                                                                     | Why Recommended                                                                                                                                                                                |
| ------------------------------------ | -------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @tanstack/react-query                | ^5.90.21 | Server state management, caching, background refetching, optimistic updates | Single source of truth for all async data. Eliminates useState/useReducer for server state. v5 drops `isLoading` for `isPending`, uses `queryOptions` for colocated config. Already installed. |
| @tanstack/react-query-persist-client | ^5.90.22 | Persistent query cache across app restarts                                  | Wraps QueryClient with `PersistQueryClientProvider`. Dehydrates cache to storage on mutations, rehydrates on launch. Already installed and wired up in `QueryPersistenceProvider.tsx`.         |
| react-native-mmkv-storage            | ^12.0.1  | Encrypted key-value storage for persisted query cache                       | ~30x faster than AsyncStorage. Supports encryption via SecureStore key. Already used in `MMKVPersister.ts` with `withEncryption()`.                                                            |
| @react-native-community/netinfo      | ^11.x    | Network status detection for onlineManager                                  | Required for `onlineManager.setEventListener`. Powers `networkMode: 'offlineFirst'`. Already wired in `QueryPersistenceProvider.tsx`.                                                          |

### Supporting Libraries

| Library                        | Version | Purpose                                                      | When to Use                                                                                                                    |
| ------------------------------ | ------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| expo-crypto                    | ^14.x   | `Crypto.randomUUID()` for generating entity IDs in mutations | Used in TransactionContext for new entity IDs. Required for offline mutation ID generation before server round-trip.           |
| expo-secure-store              | ^14.x   | Storing MMKV encryption key                                  | Used in `MMKVPersister.ts` to store/generate the encryption key for the MMKV instance. Only needed once at persister creation. |
| @tanstack/react-query-devtools | ^5.x    | Query inspector overlay for debugging                        | Development only. Shows query states, cache contents, stale timers. Do NOT ship to production.                                 |

### Development Tools

| Tool                 | Purpose                                     | Notes                                                                                                         |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| React Query Devtools | Visual query state inspector                | Add inside `QueryPersistenceProvider` with `<ReactQueryDevtools initialIsOpen={false} />`. Only in `__DEV__`. |
| `npx tsc --noEmit`   | Type-safe query keys and mutation variables | Catches mismatched queryKey types across factory functions, mutations, and invalidation calls.                |

## Installation

```bash
# Already installed — no action needed
# @tanstack/react-query@^5.90.21
# @tanstack/react-query-persist-client@^5.90.22
# react-native-mmkv-storage@^12.0.1
# @react-native-community/netinfo

# Dev-only (optional, for query inspector)
npx expo install @tanstack/react-query-devtools
```

## Alternatives Considered

| Recommended                  | Alternative                      | When to Use Alternative                                                                                                                                                                                      |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TanStack Query               | Zustand                          | Only if you need client-side state that is NOT derived from server data. Zustand is for UI state, not server state. Using it for server state duplicates caching logic.                                      |
| TanStack Query               | Redux Toolkit Query              | If the project already has Redux for other reasons and team is proficient. Overkill for this project — adds a store, actions, reducers for something TanStack handles with hooks alone.                      |
| TanStack Query               | SWR                              | Lighter alternative from Vercel. Missing: offline mutations, `scope` for serial mutations, `queryOptions` colocated config, devtools parity. TanStack Query is more complete for React Native offline-first. |
| MMKV persister               | SQLite persister                 | If cache exceeds ~2MB. MMKV is key-value and loads entire cache into memory. For this app's data volume (finance transactions, groups, budgets), MMKV is faster and simpler.                                 |
| `PersistQueryClientProvider` | Manual `persistQueryClient` call | If you need fine-grained control over when persistence starts/stops. The Provider wrapper is simpler and handles lifecycle automatically.                                                                    |

## What NOT to Use

| Avoid                                      | Why                                                                                                                                                                                                                                                            | Use Instead                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `useState` for server data                 | No caching, no background refetch, no offline support, no deduplication. Requires manual loading/error states. Current codebase has 5 contexts still doing this: SubscriptionContext, SavingsContext, WalletContext, BudgetContext, FinancialAnalyticsContext. | `useQuery` with a query key factory                                               |
| `useReducer` for server state              | LoanContext currently uses `useReducer` + manual dispatch for CRUD. No caching, no optimistic updates built-in, no retry, no persistence.                                                                                                                      | `useMutation` + `useQuery` with optimistic update pattern                         |
| `onSuccess` in mutations for cache updates | Deprecated pattern. `onSuccess` runs AFTER the server responds, causing a flash of stale data. Does not handle race conditions with concurrent queries. CategoryContext currently does this.                                                                   | Optimistic updates via `onMutate` + `onError` rollback + `onSettled` invalidation |
| `setQueryData` without `onMutate` snapshot | CategoryContext uses `onSuccess` + `setQueryData` but has no rollback on error. If the server call fails, the cache is already updated with wrong data.                                                                                                        | Full optimistic pattern with snapshot in `onMutate`, rollback in `onError`        |
| Flat query keys `['transactions', userId]` | Current pattern. Cannot invalidate by filter, by detail view, or by relationship. Requires exact key match for invalidation.                                                                                                                                   | Hierarchical query key factory (see patterns below)                               |
| `enabled: false` + manual `refetch`        | Imperative anti-pattern. Loses caching, deduplication, and stale-while-revalidate benefits.                                                                                                                                                                    | `enabled: !!user` (dependency-based) or `useQuery` with proper queryKey           |
| AsyncStorage for query persistence         | ~100x slower than MMKV for reads. Sequential API blocks JS thread during hydration.                                                                                                                                                                            | MMKV with encryption (already implemented)                                        |
| Zustand/Redux for server state             | Duplicates what TanStack Query already provides (caching, invalidation, loading states). Creates two sources of truth.                                                                                                                                         | TanStack Query as the single server state layer                                   |

## Stack Patterns by Variant

### Pattern 1: Query Key Factory (ALL contexts must adopt)

**Confidence: HIGH** — Official TanStack recommendation, TkDodo "Effective React Query Keys" blog post.

Query keys must be hierarchical: most generic to most specific. This enables surgical invalidation.

```typescript
// src/services/queryKeys.ts

// Design principle: [entity, ...filters, ...identifiers]
// More generic = higher in the array, more specific = later

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  byMonth: (yearMonth: string) => [...transactionKeys.all, 'month', yearMonth] as const,
} as const;

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters: GroupFilters) => [...groupKeys.lists(), filters] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  members: (groupId: string) => [...groupKeys.detail(groupId), 'members'] as const,
  expenses: (groupId: string) => [...groupKeys.detail(groupId), 'expenses'] as const,
  settlements: (groupId: string) => [...groupKeys.detail(groupId), 'settlements'] as const,
} as const;

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters: BudgetFilters) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
} as const;

export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters: LoanFilters) => [...loanKeys.lists(), filters] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
} as const;

export const investmentKeys = {
  all: ['investments'] as const,
  lists: () => [...investmentKeys.all, 'list'] as const,
  list: (filters: InvestmentFilters) => [...investmentKeys.lists(), filters] as const,
  details: () => [...investmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...investmentKeys.details(), id] as const,
} as const;

export const savingsKeys = {
  all: ['savings'] as const,
  lists: () => [...savingsKeys.all, 'list'] as const,
  list: (filters: SavingsFilters) => [...savingsKeys.lists(), filters] as const,
  details: () => [...savingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...savingsKeys.details(), id] as const,
} as const;

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (filters: SubscriptionFilters) => [...subscriptionKeys.lists(), filters] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
} as const;

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
} as const;

export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: (filters: WalletFilters) => [...walletKeys.lists(), filters] as const,
  details: () => [...walletKeys.all, 'detail'] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
} as const;
```

**Why this matters for BuddyIO:**

- `invalidateQueries({ queryKey: transactionKeys.all })` invalidates ALL transaction queries (list, detail, byMonth).
- `invalidateQueries({ queryKey: transactionKeys.lists() })` invalidates only list queries, not detail views.
- `invalidateQueries({ queryKey: transactionKeys.detail('tx-123') })` invalidates a single transaction.
- Adding a group expense can invalidate `groupKeys.expenses(groupId)` without touching unrelated group queries.

### Pattern 2: `queryOptions` for Colocated Config (v5 feature)

**Confidence: HIGH** — Official TanStack v5 API, replaces scattered queryKey + queryFn duplication.

```typescript
// src/services/queries/transactionQueries.ts
import {queryOptions} from '@tanstack/react-query';
import {transactionKeys} from '../queryKeys';
import {SupabaseDatabaseService} from '../SupabaseDatabaseService';

export const transactionQueries = {
  list: (userId: string, filters?: TransactionFilters) =>
    queryOptions({
      queryKey: transactionKeys.list({userId, ...filters}),
      queryFn: () => SupabaseDatabaseService.getTransactions(userId, filters),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (userId: string, transactionId: string) =>
    queryOptions({
      queryKey: transactionKeys.detail(transactionId),
      queryFn: () => SupabaseDatabaseService.getTransactionById(userId, transactionId),
      staleTime: 5 * 60 * 1000,
    }),
};

// Usage in components:
// const { data } = useQuery(transactionQueries.list(user.uid));
```

**Benefit:** Single source of truth for each query's key + function + options. No more mismatched keys between `useQuery` and `invalidateQueries`.

### Pattern 3: Standardized Optimistic Update for CRUD

**Confidence: HIGH** — TransactionContext already implements this correctly. Must be the standard for ALL contexts.

Every mutation that modifies a list MUST use this three-callback pattern:

```typescript
const addMutation = useMutation({
  mutationFn: async (data: Omit<Entity, 'id'>) => {
    const newEntity = {...data, id: Crypto.randomUUID()} as Entity;
    await SupabaseDatabaseService.save(userId, [newEntity]);
    return newEntity;
  },
  onMutate: async (newData) => {
    // 1. Cancel any outgoing refetches (prevent overwrite)
    await queryClient.cancelQueries({queryKey: entityKeys.lists()});

    // 2. Snapshot the previous value (for rollback)
    const previousData = queryClient.getQueryData(entityKeys.list({userId}));

    // 3. Optimistically update to the new value
    const optimisticEntity = {...newData, id: 'temp-' + Date.now()} as Entity;
    queryClient.setQueryData(entityKeys.list({userId}), (old: Entity[] = []) => [
      optimisticEntity,
      ...old,
    ]);

    // 4. Return context with snapshot
    return {previousData};
  },
  onError: (err, newData, context) => {
    // Rollback to snapshot on error
    if (context?.previousData) {
      queryClient.setQueryData(entityKeys.list({userId}), context.previousData);
    }
    logger.error('Mutation failed, rolled back', err);
  },
  onSettled: () => {
    // Always refetch after error or success to ensure server truth
    queryClient.invalidateQueries({queryKey: entityKeys.lists()});
  },
});
```

**Common mistake to avoid:** Do NOT use `onSuccess` to call `setQueryData`. The optimistic update in `onMutate` already updates the cache. `onSettled` + `invalidateQueries` ensures eventual consistency with the server.

### Pattern 4: Cross-Entity Mutation Invalidation

**Confidence: HIGH** — Standard TanStack Query pattern for relational data.

When a mutation in one domain affects queries in another domain, invalidate the related keys in `onSettled`:

```typescript
// Deleting a category must invalidate transactions that reference it
const deleteCategoryMutation = useMutation({
  mutationFn: (id: string) => SupabaseDatabaseService.deleteCategory(userId, id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({queryKey: categoryKeys.lists()});
    const previous = queryClient.getQueryData(categoryKeys.list({userId}));
    queryClient.setQueryData(categoryKeys.list({userId}), (old: Category[] = []) =>
      old.filter((c) => c.id !== id),
    );
    return {previous};
  },
  onError: (_err, _id, context) => {
    if (context?.previous) {
      queryClient.setQueryData(categoryKeys.list({userId}), context.previous);
    }
  },
  onSettled: () => {
    // Invalidate categories
    queryClient.invalidateQueries({queryKey: categoryKeys.lists()});
    // Cross-entity: transactions reference categories
    queryClient.invalidateQueries({queryKey: transactionKeys.lists()});
  },
});
```

**Cross-entity invalidation map for BuddyIO:**

| Mutation in...    | Must also invalidate...                                                              | Reason                                                   |
| ----------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| transactions      | categories (totals), budgets (spent amounts), groups (expenses), financial_analytics | Transactions are the core data that feeds all aggregates |
| groups (expenses) | transactions (if linked), group members (balances)                                   | Group expenses affect balances                           |
| budgets           | financial_analytics (budget utilization)                                             | Budget changes affect analytics                          |
| loans (payments)  | financial_analytics (debt metrics)                                                   | Loan payments affect overall financial picture           |
| investments       | financial_analytics (portfolio value)                                                | Investment changes affect net worth                      |
| savings           | financial_analytics (goal progress)                                                  | Savings changes affect financial goals                   |
| categories        | transactions (category data may be denormalized)                                     | Category renames/deletes affect transaction display      |
| wallets           | transactions (wallet balance), financial_analytics (net worth)                       | Wallet changes propagate                                 |

### Pattern 5: MMKV Persistence (Already Working, Minor Improvements)

**Confidence: HIGH** — Already implemented and functional. Based on official `@tanstack/react-query-persist-client` docs.

Current setup in `QueryPersistenceProvider.tsx` is correct. Recommended improvements:

1. **Add `networkMode: 'offlineFirst'`** to QueryClient defaults. This is the critical missing piece for React Native:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days — keep persisted data long
      staleTime: 1000 * 60 * 5, // 5 minutes — avoid over-fetching
      retry: 2,
      networkMode: 'offlineFirst', // KEY ADDITION: queries succeed from cache even when offline
    },
    mutations: {
      networkMode: 'offlineFirst', // Mutations pause when offline, resume when back online
    },
  },
});
```

2. **Add `maxAge` to persistOptions** to prevent restoring extremely stale cache:

```typescript
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days — same as gcTime
    dehydrateOptions: {
      shouldDehydrateMutation: () => true,
      shouldDehydrateQuery: (query) => {
        return query.state.data !== undefined;
      },
    },
  }}
  // ... rest unchanged
/>
```

### Pattern 6: Offline Mutations with `setMutationDefaults`

**Confidence: HIGH** — Official TanStack persistence docs for offline mutation handling.

For mutations to survive app restarts, register mutation defaults so the persister can re-execute them:

```typescript
// After QueryClient creation, before Provider render
queryClient.setMutationDefaults(['saveTransaction'], {
  mutationFn: async (variables: {userId: string; transactions: Transaction[]}) => {
    return await SupabaseDatabaseService.saveTransactions(variables.userId, variables.transactions);
  },
});
```

When a persisted mutation is rehydrated, TanStack Query uses these defaults to replay it. Without `setMutationDefaults`, persisted mutations will fail on re-execution.

### Pattern 7: Serial Mutation Execution with `scope`

**Confidence: HIGH** — TanStack Query v5 feature. Prevents race conditions.

For mutations that must execute in order (e.g., loan payments that depend on previous balance):

```typescript
const paymentMutation = useMutation({
  mutationFn: (payment: PaymentData) => LoanService.recordPayment(payment),
  scope: {id: 'loan-payments'}, // Serializes all mutations with this scope ID
  onMutate: async (payment) => {
    /* ... optimistic update ... */
  },
  onError: (_err, _payment, context) => {
    /* ... rollback ... */
  },
  onSettled: () => {
    /* ... invalidate ... */
  },
});
```

Mutations with the same `scope.id` are queued and execute one at a time, preventing out-of-order writes.

### Pattern 8: Context Migration Path (useState/useReducer -> TanStack Query)

**Confidence: MEDIUM** — Prescriptive guidance based on codebase analysis. No official guide exists for this exact migration.

Migration order (least to most complex):

1. **WalletContext** — Simple CRUD, single entity. Good first migration.
2. **CategoryContext** — Already partially migrated but uses `onSuccess` anti-pattern. Fix to full optimistic pattern.
3. **SubscriptionContext** — Simple CRUD, similar to categories.
4. **BudgetContext** — CRUD + date-range queries. Medium complexity.
5. **SavingsContext** — CRUD + goal progress calculations. Medium complexity.
6. **LoanContext** — Currently useReducer. Most complex due to EMI calculations, amortization schedules, payment history. Migrate last.
7. **FinancialAnalyticsContext** — Derived data (aggregates from other contexts). Pure `useQuery` with no mutations.

**Migration checklist per context:**

1. Create query key factory entries in `queryKeys.ts`
2. Create `queryOptions` in `src/services/queries/<entity>Queries.ts`
3. Replace `useState`/`useReducer` data loading with `useQuery`
4. Replace manual save/load with `useMutation` + optimistic updates
5. Add cross-entity invalidation in `onSettled`
6. Remove all `onSuccess` + `setQueryData` patterns
7. Remove manual `isLoading`, `error` state management (use query/mutation states)
8. Update context interface to remove now-unnecessary methods (e.g., manual `syncWithRemote`)

## Version Compatibility

| Package A                                 | Compatible With                               | Notes                                                                            |
| ----------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| @tanstack/react-query@^5.90.21            | @tanstack/react-query-persist-client@^5.90.22 | Must match major and minor version. Both at ^5.90.x currently.                   |
| @tanstack/react-query@^5.x                | React 18+                                     | v5 requires React 18+. Expo SDK 54 uses React 18.3.1. Compatible.                |
| @tanstack/react-query-persist-client@^5.x | react-native-mmkv-storage@^12.x               | No direct dependency. Persister interface is storage-agnostic. Compatible.       |
| @tanstack/react-query@^5.x                | expo-router@~6.x                              | No conflicts. expo-router manages navigation; TanStack manages data. Compatible. |
| react-native-mmkv-storage@^12.x           | expo-secure-store@^14.x                       | Used together for encrypted MMKV. No known conflicts.                            |
| @tanstack/react-query-devtools@^5.x       | @tanstack/react-query@^5.90.x                 | Must match exact version. Install as devDependency.                              |

## Sources

- **TanStack Query v5 Official Docs** (https://tanstack.com/query/latest) — Query keys, mutations, optimistic updates, network mode, queryOptions, persistQueryClient, setMutationDefaults, scope. Confidence: HIGH.
- **TkDodo Blog — "Effective React Query Keys"** (https://tkdodo.eu/blog/effective-react-query-keys) — Hierarchical query key factory pattern, invalidation strategies. Confidence: HIGH.
- **TkDodo Blog — "React Query and React Native"** (https://tkdodo.eu/blog/react-query-and-react-native) — networkMode offlineFirst, NetInfo integration, mutation persistence. Confidence: HIGH.
- **@tanstack/react-query-persist-client GitHub** (https://github.com/TanStack/query/tree/main/packages/react-query-persist-client) — PersistQueryClientProvider API, dehydration options, maxAge. Confidence: HIGH.
- **Codebase audit** — CategoryContext.tsx, TransactionContext.tsx, EnhancedGroupContext.tsx, InvestmentContext.tsx, LoanContext.tsx, QueryPersistenceProvider.tsx, MMKVPersister.ts, AppProviders.tsx. Confidence: HIGH (primary source).

---

_Stack research for: TanStack Query v5 Server State Management_
_Researched: 2026-04-28_
