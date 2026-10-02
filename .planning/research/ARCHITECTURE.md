# Architecture Research

**Domain:** React Native + Supabase + TanStack Query finance app (post-overhaul target architecture)
**Researched:** 2026-04-28
**Confidence:** HIGH (stack-specific patterns), MEDIUM (feature-first vs layer judgment for this codebase size)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
│  expo-router routes (app/) → Screen composites → Feature UI components  │
├──────────────────────────────────────────────────────────────────────────┤
│                          FEATURE MODULES                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Transac- │ │  Groups  │ │  Loans   │ │ Budgets  │ │ Savings  │       │
│  │  tions   │ │          │ │          │ │          │ │          │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │            │            │              │
│  queryOptions  queryOptions  queryOptions  queryOptions  queryOptions    │
│  mutations     mutations     mutations     mutations     mutations       │
├───────┴────────────┴────────────┴────────────┴────────────┴──────────────┤
│                       DATA ACCESS LAYER                                  │
│  TanStack Query (cache, background refetch, optimistic updates, MMKV)   │
├──────────────────────────────────────────────────────────────────────────┤
│                        SERVICE LAYER                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Supabase  │ │Supabase  │ │Supabase  │ │Currency  │ │Financial │       │
│  │Transac-  │ │  Group   │ │  Loan    │ │  Service │ │  Calc    │       │
│  │ tion Svc │ │  Service │ │  Service │ │          │ │  Svc     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐       │
│  │ QueryClient  │  │ Supabase     │  │ Providers (5 total)      │       │
│  │ + MMKV Pers. │  │ Client       │  │ Auth, Theme, Query,      │       │
│  └──────────────┘  └──────────────┘  │ Navigation infra, Alerts │       │
│                                       └──────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component                                      | Responsibility                                                                 | Typical Implementation                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Feature modules** (`src/features/{domain}/`) | Own all code for one business domain: queries, mutations, types, UI components | Directory per domain with `queries.ts`, `mutations.ts`, `types.ts`, `components/` |
| **queryOptions**                               | Define query configuration (key, fetcher, staleTime) as reusable objects       | `queryOptions({ id })` factories exported from each feature module                |
| **Mutation helpers**                           | Define write operations with optimistic update config                          | `mutationOptions()` exported alongside queryOptions                               |
| **Domain services**                            | Thin Supabase query wrappers; map DB rows to domain types                      | One service per Supabase table group, pure async functions                        |
| **Screen composites**                          | Compose feature components + shared UI into page-level layouts                 | `src/screens/` or `src/features/{domain}/screens/`, max 300 lines                 |
| **Shared components**                          | Domain-agnostic UI primitives (buttons, cards, lists, forms)                   | `src/components/ui/` using Tamagui primitives                                     |
| **App Providers**                              | Top-level React context wrappers (5 providers, not 20)                         | `src/providers/` — QueryClient, Auth, Theme, Navigation, Feedback                 |
| **Query key factory**                          | Centralized query key hierarchy for cache invalidation                         | `src/lib/query-keys.ts` — nested objects with factory functions                   |
| **Shared utilities**                           | Pure functions used across domains (date formatting, currency, validation)     | `src/lib/` for cross-cutting, domain utils live in feature module                 |

---

## Recommended Project Structure

```
src/
├── app/                          # expo-router file-based routes (unchanged)
│   ├── (tabs)/                   # 4-tab navigation
│   ├── groups/[id]/              # Dynamic group routes
│   └── ...
│
├── features/                     # Feature-first domain modules
│   ├── transactions/
│   │   ├── queries.ts            # queryOptions for transaction queries
│   │   ├── mutations.ts          # mutationOptions for transaction writes
│   │   ├── types.ts              # Transaction domain types
│   │   ├── service.ts            # Supabase transaction queries
│   │   ├── components/           # Transaction-specific UI
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   └── TransactionFilters.tsx
│   │   └── index.ts              # Public barrel export
│   │
│   ├── groups/
│   │   ├── queries.ts            # Group + member + expense queries
│   │   ├── mutations.ts          # Group CRUD, member management
│   │   ├── types.ts              # Group, Member, Expense types
│   │   ├── service.ts            # Supabase group queries
│   │   ├── utils/
│   │   │   ├── debt-calculation.ts    # Debt/split algorithms
│   │   │   ├── settlement.ts          # Settlement logic
│   │   │   └── validation.ts          # Group validation rules
│   │   ├── components/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── SettlementView.tsx
│   │   │   └── BalanceSummary.tsx
│   │   └── index.ts
│   │
│   ├── loans/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── utils/
│   │   │   ├── loan-calculations.ts
│   │   │   └── amortization.ts
│   │   ├── components/
│   │   │   ├── LoanCard.tsx
│   │   │   ├── LoanDetailHeader.tsx
│   │   │   ├── PaymentSchedule.tsx
│   │   │   └── LoanMetricsChart.tsx
│   │   └── index.ts
│   │
│   ├── budgets/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── savings/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── investments/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── subscriptions/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── categories/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── wallets/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   │
│   ├── analytics/
│   │   ├── queries.ts            # Computed from transaction/group queries
│   │   ├── utils/
│   │   │   ├── spending-trends.ts
│   │   │   ├── net-worth.ts
│   │   │   └── category-breakdown.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   └── auth/                     # Auth feature (no Supabase service needed)
│       ├── queries.ts            # Session/user queries
│       ├── types.ts
│       └── index.ts
│
├── providers/                    # 5 React context providers (down from 20)
│   ├── AppProviders.tsx          # Thin composition of all providers
│   ├── QueryProvider.tsx         # QueryClient + MMKV persistence
│   ├── AuthProvider.tsx          # Supabase auth state listener
│   ├── ThemeProvider.tsx         # Tamagui + dark/light mode
│   └── NavigationProvider.tsx    # SafeArea, Portals, BottomSheet, Toast, Alerts
│
├── screens/                      # Screen-level composites (max ~300 lines each)
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── transactions/
│   │   ├── TransactionsScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   └── TransactionDetailScreen.tsx
│   ├── groups/
│   │   ├── GroupsScreen.tsx
│   │   ├── GroupDetailScreen.tsx
│   │   └── EditGroupScreen.tsx
│   ├── loans/
│   │   ├── LoansScreen.tsx
│   │   ├── LoanDetailScreen.tsx
│   │   └── AddEditLoanScreen.tsx
│   ├── budgets/
│   │   ├── BudgetSetupScreen.tsx
│   │   └── BudgetDetailsScreen.tsx
│   ├── savings/
│   ├── investments/
│   ├── subscriptions/
│   ├── settings/
│   └── auth/
│
├── components/                   # Shared UI components (domain-agnostic)
│   ├── ui/                       # Primitives: Button, Input, Card, Sheet
│   ├── charts/                   # Reusable chart wrappers
│   ├── forms/                    # Form field components, validation display
│   └── layout/                   # ScreenWrapper, KeyboardAvoidingView, headers
│
├── lib/                          # Cross-cutting infrastructure
│   ├── supabase.ts               # Single Supabase client
│   ├── query-client.ts           # QueryClient instance + config
│   ├── query-keys.ts             # Query key factory (all domains)
│   ├── mmkv-persister.ts         # MMKV persistence adapter
│   ├── auth.config.ts            # Auth configuration
│   └── revenuecat.ts             # RevenueCat config
│
├── hooks/                        # Shared hooks (cross-domain)
│   ├── useFormValidation.ts
│   ├── useProgressiveBlurHeader.ts
│   ├── usePagination.ts
│   └── useLazyComponent.ts
│
├── types/                        # Shared type definitions
│   ├── index.ts                  # Re-exports from all feature types
│   └── shared.ts                 # Common types (Money, DateString, etc.)
│
└── workers/
    └── debt-calculation.worker.ts
```

### Structure Rationale

- **`features/` over separate `services/`, `hooks/`, `utils/` directories:** BuddyIO has 13 distinct financial domains (transactions, groups, loans, budgets, savings, investments, subscriptions, categories, wallets, analytics, auth, debts, retirement). At this scale, feature-first eliminates the "which of 5 directories does this file go in?" problem. Every file for a domain lives in one place. A developer working on loans opens `src/features/loans/` and finds everything they need.

- **`providers/` replacing `context/`:** The current 20 React Context providers are largely redundant wrappers around TanStack Query. TanStack Query already provides caching, background refetching, optimistic updates, and offline persistence. The 5 remaining providers handle genuinely global state that TanStack Query cannot: auth session, theme, navigation infrastructure, and feedback UI (toasts/alerts).

- **`screens/` remain separate from `features/`:** Screens are route-level composites that often pull from multiple features (e.g., HomeScreen uses transactions + budgets + groups). Keeping screens separate avoids circular dependencies between features. Screens import from feature modules; features never import from screens.

- **`lib/query-keys.ts` centralized:** Query keys are the shared contract for cache invalidation. Centralizing them prevents misspelled keys and makes cross-feature invalidation discoverable (e.g., when a transaction is added, budgets and analytics caches need invalidation).

- **`components/` for shared UI only:** Domain-specific components (TransactionCard, GroupMemberList) live inside their feature module. Only truly cross-domain components (Button, Card, charts) go in the shared `components/` directory.

---

## Architectural Patterns

### Pattern 1: queryOptions as Primary Data Abstraction

**What:** Use TanStack Query's `queryOptions()` API as the primary way to define data dependencies, replacing both custom hooks and React Context providers. Each feature module exports queryOptions factories.

**When to use:** For every server-state data dependency. This is the default pattern for data fetching — not a special case.

**Trade-offs:**

- PRO: Works with `useQuery`, `useSuspenseQuery`, `useQueries`, and imperative functions (`queryClient.fetchQuery`) — no lock-in to one hook API
- PRO: TypeScript infers the return type automatically
- PRO: No React Context overhead (no provider nesting, no re-render cascades)
- CON: Requires TanStack Query v5.66+ (current project uses a compatible version)
- CON: Team must learn `queryOptions` API — but it is simpler than the current Context pattern

**Example:**

```typescript
// src/features/transactions/queries.ts
import {queryOptions} from '@tanstack/react-query';
import {transactionService} from './service';
import {transactionKeys} from '@/lib/query-keys';

export const transactionQueries = {
  all: (userId: string) =>
    queryOptions({
      queryKey: transactionKeys.all(userId),
      queryFn: () => transactionService.getByUser(userId),
      staleTime: 5 * 60 * 1000,
    }),

  byId: (userId: string, id: string) =>
    queryOptions({
      queryKey: transactionKeys.detail(userId, id),
      queryFn: () => transactionService.getById(userId, id),
    }),

  byDateRange: (userId: string, start: Date, end: Date) =>
    queryOptions({
      queryKey: transactionKeys.byDateRange(userId, start, end),
      queryFn: () => transactionService.getByDateRange(userId, start, end),
    }),
};
```

**Usage in components:**

```typescript
// In a screen component:
import {useQuery} from '@tanstack/react-query';
import {transactionQueries} from '@/features/transactions';

function TransactionsScreen() {
  const {user} = useAuth();
  const {data: transactions} = useQuery(transactionQueries.all(user.id));
  // ...
}

// In an imperative function (no hook needed):
async function exportTransactions(userId: string) {
  const data = await queryClient.fetchQuery(transactionQueries.all(userId));
  return data;
}
```

### Pattern 2: Query Key Factory Pattern

**What:** A centralized, hierarchical query key structure using factory functions. Keys are organized by domain with `all`, `lists`, `list(filters)`, `details`, `detail(id)` levels.

**When to use:** Always. This is the cache management contract for the entire app.

**Trade-offs:**

- PRO: Granular invalidation — invalidate all transactions, or just one, or all lists
- PRO: Type-safe keys via TypeScript
- PRO: Discoverable — developers find related keys via autocomplete
- CON: One more file to maintain; must be kept in sync with queries

**Example:**

```typescript
// src/lib/query-keys.ts
export const transactionKeys = {
  all: (userId: string) => ['transactions', userId] as const,
  lists: (userId: string) => [...transactionKeys.all(userId), 'list'] as const,
  list: (userId: string, filters: TransactionFilters) =>
    [...transactionKeys.lists(userId), filters] as const,
  details: (userId: string) => [...transactionKeys.all(userId), 'detail'] as const,
  detail: (userId: string, id: string) => [...transactionKeys.details(userId), id] as const,
  byDateRange: (userId: string, start: Date, end: Date) =>
    [...transactionKeys.all(userId), 'date-range', {start, end}] as const,
};

export const groupKeys = {
  all: (userId: string) => ['groups', userId] as const,
  lists: (userId: string) => [...groupKeys.all(userId), 'list'] as const,
  detail: (userId: string, groupId: string) =>
    [...groupKeys.all(userId), 'detail', groupId] as const,
  members: (userId: string, groupId: string) =>
    [...groupKeys.detail(userId, groupId), 'members'] as const,
  expenses: (userId: string, groupId: string) =>
    [...groupKeys.detail(userId, groupId), 'expenses'] as const,
};

export const budgetKeys = {
  all: (userId: string) => ['budgets', userId] as const,
  // ...
};

// Cross-domain invalidation example:
// When a transaction is created, invalidate budgets + analytics
function invalidateAfterTransactionChange(queryClient: QueryClient, userId: string) {
  queryClient.invalidateQueries({queryKey: transactionKeys.all(userId)});
  queryClient.invalidateQueries({queryKey: budgetKeys.all(userId)});
  queryClient.invalidateQueries({queryKey: analyticsKeys.all(userId)});
}
```

### Pattern 3: Mutation Options with Optimistic Updates

**What:** Define mutations using `mutationOptions()` with inline optimistic update logic, replacing the current pattern of wrapping mutations in React Context.

**When to use:** For every write operation (create, update, delete).

**Trade-offs:**

- PRO: Optimistic updates provide instant UI feedback
- PRO: Automatic rollback on error
- PRO: No Context needed — mutations are just objects consumed by `useMutation`
- CON: Must carefully handle optimistic data shape to match real server response

**Example:**

```typescript
// src/features/transactions/mutations.ts
import {mutationOptions} from '@tanstack/react-query';
import {transactionService} from './service';
import {transactionKeys} from '@/lib/query-keys';
import type {Transaction} from './types';

export const transactionMutations = {
  create: (userId: string) =>
    mutationOptions({
      mutationFn: (data: Omit<Transaction, 'id'>) => transactionService.create(userId, data),
      onMutate: async (newTx) => {
        await queryClient.cancelQueries({queryKey: transactionKeys.all(userId)});
        const previous = queryClient.getQueryData(transactionKeys.all(userId));
        queryClient.setQueryData<Transaction[]>(transactionKeys.all(userId), (old = []) => [
          {...newTx, id: 'temp-' + Date.now()} as Transaction,
          ...old,
        ]);
        return {previous};
      },
      onError: (_err, _newTx, context) => {
        queryClient.setQueryData(transactionKeys.all(userId), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({queryKey: transactionKeys.all(userId)});
      },
    }),

  delete: (userId: string) =>
    mutationOptions({
      mutationFn: (id: string) => transactionService.delete(userId, id),
      onMutate: async (deletedId) => {
        await queryClient.cancelQueries({queryKey: transactionKeys.all(userId)});
        const previous = queryClient.getQueryData(transactionKeys.all(userId));
        queryClient.setQueryData<Transaction[]>(transactionKeys.all(userId), (old = []) =>
          old.filter((t) => t.id !== deletedId),
        );
        return {previous};
      },
      onError: (_err, _id, context) => {
        queryClient.setQueryData(transactionKeys.all(userId), context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({queryKey: transactionKeys.all(userId)});
      },
    }),
};
```

**Usage:**

```typescript
function TransactionActions({ transactionId }: { transactionId: string }) {
  const { user } = useAuth();
  const deleteTx = useMutation(transactionMutations.delete(user.id));

  return (
    <Button onPress={() => deleteTx.mutate(transactionId)}>
      Delete
    </Button>
  );
}
```

### Pattern 4: Screen Decomposition (Container/Presentational)

**What:** Break 1500+ line screens into a thin screen container (data fetching, event handlers) and multiple presentational components. The screen file is max ~300 lines.

**When to use:** Every screen over 300 lines. Apply immediately to: LoanDetailScreenNew (1894 lines), BudgetSetupScreen (1591), SettingsScreen (1541), SubscriptionDetailScreen (1434), AddEditLoanScreenNew (1343), AddGroupTransactionScreen (1332), GroupDetailScreen (1307).

**Trade-offs:**

- PRO: Testable components in isolation
- PRO: Reusable UI fragments across screens
- PRO: Clear separation between "what data" and "how to render"
- CON: More files to manage — but each file is understandable in isolation

**Decomposition recipe for a 1500-line screen:**

1. **Identify sections** by scrolling through the JSX — each visually distinct section (header, form, list, summary card, action bar) becomes a component.

2. **Extract inline components** — definitions like `const GlassmorphismCard = (...)` that are inside the screen file move to `src/features/{domain}/components/` or `src/components/ui/`.

3. **Extract data hooks** — `useQuery` / `useMutation` calls move to the feature module's `queries.ts` / `mutations.ts`. The screen only calls `useQuery(transactionQueries.all(userId))`.

4. **Extract business logic** — calculation functions, validation, formatters move to `src/features/{domain}/utils/`.

5. **Result:** Screen becomes a 200-300 line container that imports components, calls queries, and wires them together.

**Example decomposition for LoanDetailScreenNew (1894 lines):**

```
Before: src/screens/LoanDetailScreenNew.tsx (1894 lines)

After:
  src/screens/loans/LoanDetailScreen.tsx           (~250 lines, container)
  src/features/loans/components/LoanDetailHeader.tsx (~150 lines)
  src/features/loans/components/PaymentSchedule.tsx  (~200 lines)
  src/features/loans/components/LoanMetricsChart.tsx (~180 lines)
  src/features/loans/components/LoanActionsBar.tsx   (~100 lines)
  src/features/loans/components/PaymentForm.tsx      (~150 lines)
  src/features/loans/utils/loan-calculations.ts      (extracted calculations)
```

### Pattern 5: Service Layer Decomposition (from Monolith to Domain Services)

**What:** Break the monolithic `SupabaseDatabaseService.ts` (1356 lines, 40+ static methods) into one thin service per domain. Each service is a set of async functions that call Supabase and map rows to domain types.

**When to use:** Immediately. The current monolith is the single most dangerous file in the codebase.

**Trade-offs:**

- PRO: Each service is 100-200 lines, understandable in one read
- PRO: Changes to loans do not risk breaking groups
- PRO: Services can be tested independently
- CON: More files — but each is focused and self-contained

**Decomposition map (current 53 services → 15-20 domain services):**

| New Service            | Source                                                                                            | Methods                                              | Lines (est.) |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------ |
| `transactionService`   | SupabaseDatabaseService                                                                           | save, get, delete, mapTransaction                    | ~200         |
| `groupService`         | SupabaseDatabaseService                                                                           | save, get, delete, saveMembers                       | ~250         |
| `categoryService`      | SupabaseDatabaseService                                                                           | save, get, delete                                    | ~120         |
| `savingsService`       | SupabaseDatabaseService                                                                           | save, get                                            | ~100         |
| `loanService`          | SupabaseDatabaseService + LoanService + LoanStorageService + LoanMetricsService                   | save, get, metrics                                   | ~200         |
| `subscriptionService`  | SupabaseDatabaseService + SubscriptionService                                                     | save, get                                            | ~150         |
| `investmentService`    | SupabaseDatabaseService                                                                           | save/get portfolios, investments, categories, delete | ~200         |
| `budgetService`        | SupabaseDatabaseService + EnhancedBudgetService + SmartBudgetService + GroupBudgetService         | save, get, calculate                                 | ~200         |
| `walletService`        | SupabaseDatabaseService (credit cards) + CreditCardStorageService                                 | save, get cards                                      | ~150         |
| `userService`          | SupabaseDatabaseService (profile) + LocalProfileService                                           | save/get profile                                     | ~100         |
| `debtService`          | SupabaseDatabaseService + DebtPayoffService + debtCalculationWorkerService                        | save/get plans, calculate                            | ~150         |
| `currencyService`      | CurrencyService + CurrencyConversionService                                                       | convert, rates                                       | ~100         |
| `notificationService`  | NotificationService + BudgetNotificationService + GroupNotificationService                        | all notification logic                               | ~200         |
| `authService`          | SupabaseAuthService + UnifiedAuthService + AuthTokenManager                                       | session management                                   | ~150         |
| `analyticsService`     | FinancialCalculationService + FinancialDataService + NetWorthService + InvestmentAnalyticsService | pure computation                                     | ~200         |
| `groupActivityService` | GroupActivityService + GroupMemberService + GroupExportService + GroupNudgeService                | member/activity/export                               | ~200         |
| `backgroundService`    | BackgroundTaskService + RecurringTransactionService + AutoTransactionService                      | scheduled tasks                                      | ~150         |

**Eliminated services** (merged into providers or features):

- `LoggerService` — replaced by `EnhancedLoggerService`
- `ErrorMessageService` — merged into `ExpoErrorReportingService`
- `PerformanceMonitoringService` — evaluate if needed; 728 lines of overhead for pre-production app
- `ProductionConfigService` + `ProductionMonitoringService` + `DeploymentService` — premature for 0 users
- `ImageCacheService` — likely unnecessary with Expo Image
- `SmsService` — domain-specific, lives in feature if needed
- `RetirementPlanningService` — lives in a `retirement` feature if needed
- `GroupNotificationService` — merged into `notificationService`
- `SecuritySignatureService` — merged into auth service or removed

---

## Data Flow

### Request Flow

```
[User taps "Add Transaction"]
    |
    v
[Screen Container]                    # AddTransactionScreen.tsx (~200 lines)
    | useMutation(transactionMutations.create(userId))
    v
[TanStack Query Cache]                # Optimistic update applied immediately
    | mutationFn calls transactionService.create()
    v
[Domain Service]                      # src/features/transactions/service.ts
    | Maps Transaction → Supabase row
    v
[Supabase Client]                     # src/lib/supabase.ts
    | .from('transactions').insert(row)
    v
[Supabase PostgreSQL]                 # Row stored, RLS enforced
    |
    v
[Response flows back]
    | onSettled: invalidateQueries
    v
[TanStack Query refetches]            # Fresh server data replaces optimistic
    |
    v
[UI re-renders with truth]            # Components use useQuery(transactionQueries.all())
```

### State Management

```
┌─────────────────────────────────────────────────────────┐
│                   SERVER STATE                          │
│              (TanStack Query owns this)                 │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Transactions│  │   Groups    │  │   Loans     │     │
│  │   Cache     │  │   Cache     │  │   Cache     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│  Background refetch | Stale-while-revalidate | MMKV     │
└─────────┼────────────────┼────────────────┼────────────┘
          |                |                |
          v                v                v
┌─────────────────────────────────────────────────────────┐
│                  CLIENT STATE                           │
│           (React Context, only these 5)                 │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐ │
│  │   Auth   │  │  Theme   │  │  Navigation Infra     │ │
│  │ Session  │  │ Dark/Lt  │  │  Toast, Alert, Sheet  │ │
│  └──────────┘  └──────────┘  └───────────────────────┘ │
│  ┌──────────────────────────┐                           │
│  │  QueryClient Provider    │                           │
│  │  (persistence + config)  │                           │
│  └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Read flow (most common):** Component calls `useQuery(featureQueries.all(userId))` → TanStack returns cached data if fresh, else fetches via domain service → Supabase → response cached → component renders. No Context, no Provider nesting.

2. **Write flow with optimistic update:** Component calls `useMutation(featureMutations.create(userId))` → TanStack applies optimistic update to cache immediately → mutationFn calls domain service → Supabase persists → on error, rollback to previous cache state → on settled, invalidate to refetch fresh data.

3. **Cross-domain invalidation:** When a transaction is created, `onSettled` invalidates `transactionKeys.all()`, `budgetKeys.all()`, and `analyticsKeys.all()`. TanStack refetches each independently. No CoordinationContext event bus needed.

4. **Offline flow:** Mutation is created while offline → TanStack pauses mutation (via NetInfo integration in `QueryPersistenceProvider`) → when back online, `resumePausedMutations()` fires → queued mutations execute against Supabase → cache reconciled.

5. **Auth-gated flow:** All queryOptions factories accept `userId`. Screens check `useAuth()` for `user.id` and pass it to queries. If `userId` is falsy, `enabled: false` prevents the fetch (pattern already used in current code).

---

## Scaling Considerations

| Scale                | Architecture Adjustments                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-1k users (current) | Feature-first structure is ideal. Single Supabase instance. MMKV cache + 5-min staleTime keeps perceived performance high. No server-side caching needed.                                                                       |
| 1k-100k users        | Add Supabase Edge Functions for expensive aggregations (net worth, spending trends). Consider increasing staleTime to 15-30 min for analytics queries. Add error boundary per feature module.                                   |
| 100k+ users          | Evaluate `@supabase-cache-helpers` for automatic cache normalization. Consider React Native lazy loading (dynamic `import()`) for feature modules not on the home screen. Supabase read replicas if single region is saturated. |

### Scaling Priorities

1. **First bottleneck: Supabase query volume from background refetches.** Fix: Use `placeholderData: keepPreviousData` for paginated lists. Increase `staleTime` for expensive queries (analytics, net worth) to 15-30 min. Use `refetchOnWindowFocus: false` on mobile (not relevant).

2. **Second bottleneck: Bundle size from 65 screens + 53 services.** Fix: expo-router already code-splits by route. Ensure feature modules are imported only by their screens (not barrel-exported from a single `index.ts`). Use `React.lazy()` for heavy chart components.

3. **Third bottleneck: MMKV storage growing with 7-day gcTime.** Fix: Monitor storage size. Reduce `gcTime` to 3 days for large datasets (transactions). Keep 7 days for small datasets (categories, settings). The existing `shouldDehydrateQuery` guard (skip queries with `undefined` data) is already correct.

---

## Anti-Patterns

### Anti-Pattern 1: Wrapping TanStack Query in React Context

**What people do:** Create a `TransactionProvider` that calls `useQuery` internally and passes data down via Context. This is the current codebase pattern (`TransactionContext.tsx`, `LoanContext.tsx`, `BudgetContext.tsx`, etc.).

**Why it's wrong:** TanStack Query IS the state manager for server data. It already handles caching, background refetching, optimistic updates, and offline persistence. Wrapping it in Context adds: (a) unnecessary re-renders (Context value changes propagate to all consumers), (b) provider nesting hell (20 providers in AppProviders), (c) a redundant abstraction layer that obscures the real data flow, (d) impossible to use with `useSuspenseQuery` or `useQueries` because Context forces one hook shape.

**Do this instead:** Export `queryOptions` and `mutationOptions` from feature modules. Components call `useQuery(transactionQueries.all(userId))` directly. No provider, no Context, no indirection.

### Anti-Pattern 2: Monolithic Database Service

**What people do:** Put all database operations in one static class (`SupabaseDatabaseService`, 1356 lines, 40+ methods spanning 8 domains).

**Why it's wrong:** Any change to loan persistence risks breaking group persistence. The file is too large to review. Merge conflicts are guaranteed in team development. No clear ownership boundary.

**Do this instead:** One thin service per domain (`transactionService`, `groupService`, `loanService`). Each is 100-250 lines of pure Supabase query functions. They share the `supabase` client from `src/lib/supabase.ts` but nothing else.

### Anti-Pattern 3: Giant Screen Files with Inline Components

**What people do:** Write 1500+ line screen files with inline component definitions, multiple `useQuery`/`useMutation` calls, inline styles, and business logic all in one file (`LoanDetailScreenNew.tsx` at 1894 lines).

**Why it's wrong:** Impossible to test, impossible to reuse, impossible to review in a PR. Changing one visual section requires reading 1500 lines of unrelated code.

**Do this instead:** Screen container pattern — screen file is max 300 lines, imports pre-built components from the feature module, wires data to UI. Each extracted component is independently testable and reusable.

### Anti-Pattern 4: CoordinationContext for Cross-Domain Events

**What people do:** Use an event bus (`CoordinationContext`) to broadcast events like "transaction created" so other contexts can refresh.

**Why it's wrong:** TanStack Query's `invalidateQueries` already handles this natively. After a mutation settles, invalidating the relevant query keys causes all subscribers to refetch. No event bus needed.

**Do this instead:** In mutation `onSettled`, call `queryClient.invalidateQueries()` with the relevant query keys. Cross-domain invalidation is explicit and type-safe via the query key factory.

### Anti-Pattern 5: Mixing Domain Utilities in Shared `utils/` Directory

**What people do:** Put `groupBalanceUtils.optimized.ts` (30KB), `loanCalculations.ts` (16KB), `groupValidation.ts` (20KB) in a flat `src/utils/` directory alongside general utilities like `dateUtils.ts`.

**Why it's wrong:** Domain utilities are tightly coupled to domain types and logic. When working on groups, the developer must search across `src/utils/`, `src/services/`, `src/hooks/`, and `src/context/` to find all group-related code.

**Do this instead:** Domain utilities live in `src/features/{domain}/utils/`. Only truly cross-domain utilities (date formatting, currency conversion, form validation) live in `src/lib/` or `src/utils/`.

---

## Integration Points

### External Services

| Service                 | Integration Pattern                                          | Notes                                                                                          |
| ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Supabase Auth**       | `AuthProvider` listens to `supabase.auth.onAuthStateChange`  | Session persisted in MMKV. Google Sign-In via Firebase + Supabase credential exchange.         |
| **Supabase PostgreSQL** | Domain services call `supabase.from('table')` directly       | RLS enforces user-scoped access. No ORM — raw Supabase client queries with manual row mapping. |
| **Supabase Storage**    | File uploads via `SupabaseStorageService` (already separate) | Used for profile pictures, receipt images.                                                     |
| **TanStack Query**      | `QueryClientProvider` at root with MMKV persistence          | 7-day `gcTime`, 5-min `staleTime`, retry: 2. NetInfo integration for offline detection.        |
| **RevenueCat**          | `SubscriptionProvider` (simplified in new architecture)      | Purchase validation via Supabase Edge Functions.                                               |
| **Firebase Auth**       | Google Sign-In only — `GoogleSignInService`                  | Exchanges Firebase credential for Supabase session. Not the primary auth provider.             |

### Internal Boundaries

| Boundary                            | Communication                                                | Notes                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Screen → Feature module**         | Direct import of `queries.ts`, `mutations.ts`, `components/` | Screens are the composition root. They know about features.                                                                                                |
| **Feature module → Domain service** | Direct function calls                                        | Feature queries/mutations call service functions. Services are stateless.                                                                                  |
| **Feature module → Feature module** | Query key invalidation only                                  | Features never import each other's code. Cross-domain effects happen via `queryClient.invalidateQueries()` with shared query keys.                         |
| **Domain service → Supabase**       | `supabase.from('table')`                                     | All services share the single Supabase client instance from `src/lib/supabase.ts`.                                                                         |
| **Component → Feature module**      | Props passed from screen container                           | Components receive data as props. They do not call hooks directly (presentational pattern). Container components in screens call hooks and pass data down. |

---

## Suggested Build Order

The refactoring must proceed in dependency order. Each phase produces a working app.

### Phase 1: Foundation (no behavior change)

1. Create `src/lib/query-keys.ts` with all query key factories
2. Create `src/lib/query-client.ts` extracting QueryClient config from `QueryPersistenceProvider`
3. Create `src/providers/` directory with 5 provider shells

### Phase 2: Service layer decomposition (no behavior change)

4. Extract `transactionService` from `SupabaseDatabaseService`
5. Extract `groupService` from `SupabaseDatabaseService`
6. Extract remaining domain services one by one (loans, budgets, categories, savings, investments, subscriptions, wallets)
7. Verify all services work via existing Context layer (no UI change yet)
8. Delete `SupabaseDatabaseService.ts`

### Phase 3: Feature module creation (no behavior change)

9. Create `src/features/transactions/` with `queries.ts`, `mutations.ts`, `types.ts`
10. Migrate TransactionContext queries/mutations to use new feature module
11. Repeat for each domain (groups, loans, budgets, etc.)
12. At this point, Contexts are thin wrappers that delegate to feature modules

### Phase 4: Provider simplification (behavior change — Context removal)

13. Remove `TransactionProvider` — screens import `transactionQueries` directly
14. Remove `CategoryProvider`, `WalletProvider` — same pattern
15. Remove `BudgetProvider`, `LoanProvider`, `EnhancedGroupProvider` — same pattern
16. Remove `SubscriptionProvider`, `InvestmentProvider`, `SavingsProvider` — same pattern
17. Remove `FinancialAnalyticsProvider` — analytics queries computed from other caches
18. Remove `CoordinationProvider` — replaced by query invalidation
19. Remove `MembershipProvider`, `UserProvider` — merged into `AuthProvider`
20. Simplify `AppProviders.tsx` to 5 providers
21. Delete `src/context/` directory

### Phase 5: Screen decomposition

22. Decompose largest screens first (LoanDetailScreenNew, BudgetSetupScreen, GroupDetailScreen)
23. Extract domain components into feature module `components/` directories
24. Extract inline components (`GlassmorphismCard`, etc.) to `src/components/ui/`
25. Target: all screens under 400 lines

### Phase 6: Cleanup

26. Remove dead services (duplicate loggers, premature production monitoring)
27. Consolidate `src/utils/` — move domain utils to feature modules
28. Update `src/context/index.ts` barrel to export query/mutation helpers instead of hooks
29. Update custom ESLint rules for new patterns
30. Final type-check, lint, test pass

---

## Sources

- **TkDodo (TanStack Query maintainer) blog — "The queryOptions API"** (2024): Recommends `queryOptions` as the primary data abstraction over custom hooks. This is the official recommendation from the library author. Confidence: HIGH.
  - Source: https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions

- **TanStack Query v5 docs — Query Key Factory pattern**: Hierarchical query keys for granular cache management. Confidence: HIGH.
  - Source: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys

- **Feature-first architecture for React apps**: Organizing by business domain (`features/`) rather than technical layer (`services/`, `hooks/`, `components/`). Recommended for apps with 5+ distinct domains. Confidence: HIGH for rationale, MEDIUM for specific directory layout (varies by team preference).

- **`@supabase-cache-helpers` library**: Bridges Supabase subscriptions with TanStack Query cache. Not recommended for immediate adoption (adds complexity), but useful at scale (100k+ users). Confidence: MEDIUM (library maturity evolving).
  - Source: https://github.com/psteinroe/supabase-cache-helpers

- **Current codebase analysis**: 53 services, 65 screens, 20 Context providers, SupabaseDatabaseService at 1356 lines, largest screen at 1894 lines. All measurements taken directly from the codebase during this research session. Confidence: HIGH.

---

_Architecture research for: React Native + Supabase + TanStack Query finance app (BuddyIO)_
_Researched: 2026-04-28_
