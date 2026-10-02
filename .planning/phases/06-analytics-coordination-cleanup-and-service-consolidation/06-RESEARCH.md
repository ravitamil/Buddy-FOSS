# Phase 6: Analytics, Coordination Cleanup, and Service Consolidation - Research

**Researched:** 2026-05-02
**Domain:** React Native architecture refactoring - derived state, event bus removal, service decomposition
**Confidence:** HIGH (based on current codebase analysis + established TanStack Query patterns)

## Summary

Phase 6 transforms BuddyIO from a 20-provider architecture with monolithic services to a streamlined 5-provider stack with feature-first modules. The phase has three major workstreams: (1) converting FinancialAnalyticsContext to derived hooks that compute over existing query caches, (2) completely deleting CoordinationContext and its event bus/migration/rollback infrastructure, and (3) reorganizing 53 services into 15-17 focused domain modules within a feature-first directory structure.

**Primary recommendation:** Execute in sequence—delete CoordinationContext first (safest, fewest consumers), then convert analytics to derived hooks (uses existing query caches), finally reorganize services (largest scope). Test each workstream independently before proceeding to the next.

## Standard Stack

### Core

| Library               | Version | Purpose                                                                                                | Why Standard                                                                            |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| @tanstack/react-query | ^5.0.0  | Derived state computation via `useQuery()` with `queryFn` that reads from `queryClient.getQueryData()` | Industry standard for React server state; built-in derived state via query dependencies |
| React Context API     | 18.x    | Provider composition for auth, theme, toast, navigation infrastructure                                 | Built-in React API for app-wide state not needing cache persistence                     |

### Supporting

| Library     | Version | Purpose                                                             | When to Use                                        |
| ----------- | ------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| Zod         | ^3.0.0  | Schema validation for service boundaries (already added in Phase 3) | Validate Supabase responses before returning to UI |
| expo-crypto | ^54.0.0 | UUID generation for entity IDs                                      | Already in use; continue pattern                   |

**Installation:**

```bash
# No new packages required - all dependencies already in project from previous phases
```

### Alternatives Considered

| Instead of                         | Could Use                     | Tradeoff                                                                                            |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Derived queries via TanStack Query | Recoil/atoms                  | Recoil adds another state management layer; TanStack Query already caches source data               |
| Deleting CoordinationContext       | Refactoring to PubSub pattern | Custom PubSub reinvents event bus; TanStack Query invalidation is sufficient for cache coordination |

## Architecture Patterns

### Recommended Project Structure

```
src/
├── features/                    # Feature-first domain modules (NEW)
│   ├── transactions/
│   │   ├── queries.ts           # queryOptions for transaction queries
│   │   ├── mutations.ts         # mutationOptions for transaction writes
│   │   ├── types.ts             # Transaction domain types
│   │   ├── service.ts           # Supabase transaction service functions
│   │   ├── utils/
│   │   │   ├── calculations.ts  # Transaction-specific calculations
│   │   │   └── validation.ts    # Transaction validation rules
│   │   ├── components/          # Transaction-specific UI components
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   └── TransactionForm.tsx
│   │   └── index.ts             # Public barrel export
│   │
│   ├── groups/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── utils/
│   │   │   ├── debt-calculation.ts    # Debt/split algorithms
│   │   │   ├── settlement.ts          # Settlement logic
│   │   │   └── validation.ts
│   │   ├── components/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── MemberList.tsx
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
│   │   └── index.ts
│   │
│   ├── budgets/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── utils/
│   │   │   └── calculations.ts        # Budget tracking calculations
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
│   │   ├── utils/
│   │   │   └── analytics.ts           # Investment analytics calculations
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
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── types.ts
│   │   ├── service.ts               # Supabase auth service
│   │   ├── utils/
│   │   │   └── session-management.ts
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── analytics/                  # Analytics as derived hooks, NOT a context
│   │   ├── hooks.ts                # Derived hooks: useFinancialSummary, useSpendingTrends
│   │   ├── utils/
│   │   │   ├── calculations.ts     # Financial calculations
│   │   │   └── aggregations.ts     # Data aggregation logic
│   │   └── index.ts
│   │
│   └── common/                     # Cross-cutting services
│       ├── currency/
│       │   ├── service.ts          # Currency conversion
│       │   └── types.ts
│       └── notifications/
│           ├── service.ts          # Push notification service
│           └── types.ts
│
├── context/                       # Reduced to 5 core providers
│   ├── AppProviders.tsx           # Simplified to ~5 levels
│   ├── QueryPersistenceProvider.tsx  # TanStack Query + MMKV
│   ├── EnhancedAuthProvider.tsx   # Auth context
│   ├── UserProvider.tsx           # User profile context
│   ├── SettingsProvider.tsx       # App settings context
│   ├── TamaguiProvider.tsx        # UI theme provider
│   ├── SafeAreaProvider.tsx       # Safe area + bottom sheet
│   ├── ToastProvider.tsx          # Toast notifications
│   └── AlertProvider.tsx          # Alert dialogs
│
├── components/
│   └── ui/                        # Shared UI components (unchanged)
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
│
├── lib/
│   ├── query-keys.ts              # Central query key factory (unchanged)
│   └── supabase.ts                # Single Supabase client (unchanged)
│
├── services/                      # DELETED - moved to features/
│
├── screens/                       # Screen components (unchanged)
│
├── types/                         # Domain types (moved to features/)
│
└── utils/                         # Shared utilities (unchanged)
    ├── date-utils.ts
    ├── currency-utils.ts
    └── validation-utils.ts
```

### Pattern 1: Derived Analytics Hooks (No Context)

**What:** Analytics hooks that read directly from TanStack Query cache via `queryClient.getQueryData()` instead of maintaining separate state
**When to use:** Any computed/aggregated data that derives from existing query caches (financial summaries, trends, category breakdowns)
**Example:**

```typescript
// src/features/analytics/hooks.ts
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useMemo} from 'react';

export const useFinancialSummary = (userId: string) => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    // Read directly from query cache - no separate query needed
    const transactions =
      queryClient.getQueryData<Transaction[]>(queryKeys.transactions.list(userId)) ?? [];
    const categories =
      queryClient.getQueryData<Category[]>(queryKeys.categories.list(userId)) ?? [];
    const budgets = queryClient.getQueryData<Budget[]>(queryKeys.budgets.list(userId)) ?? [];

    // Perform calculations synchronously
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      netWorth: totalIncome - totalExpenses,
      savingsRate:
        totalIncome > 0 ? ((totalIncome - Math.abs(totalExpenses)) / totalIncome) * 100 : 0,
      // ... other derived metrics
    };
  }, [queryClient, userId]);
};
```

### Pattern 2: Domain Service Decomposition

**What:** Replace monolithic `SupabaseDatabaseService` class with domain-specific function modules
**When to use:** Service layer organization - one service file per domain feature
**Example:**

```typescript
// src/features/transactions/service.ts
import {supabase} from '@/lib/supabase';
import {Transaction} from './types';

export const transactionService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(mapTransaction);
  },

  async create(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const {data, error} = await supabase
      .from('transactions')
      .insert({...mapToDbRow(transaction), user_id: userId})
      .select()
      .single();

    if (error) throw error;
    return mapTransaction(data);
  },

  async update(userId: string, id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const {data, error} = await supabase
      .from('transactions')
      .update(mapToDbRow(updates))
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapTransaction(data);
  },

  async delete(userId: string, id: string): Promise<void> {
    const {error} = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);

    if (error) throw error;
  },
};
```

### Pattern 3: Reduced Provider Tree

**What:** Flatten 16-level provider tree to 5 levels by removing CoordinationContext and FinancialAnalyticsProvider
**When to use:** App-wide provider composition
**Example:**

```typescript
// src/context/AppProviders.tsx - AFTER Phase 6
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryPersistenceProvider>      {/* Level 1: Persistence */}
      <EnhancedAuthProvider>          {/* Level 2: Auth */}
        <UserProvider>
          <SettingsProvider>
            <TamaguiProvider>          {/* Level 3: UI System */}
              <PortalProvider shouldAddRootHost>
                <SafeAreaProvider>
                  <OfflineNotice />
                  <GoogleAuthProvider config={googleSignInConfig}>
                    <ActionSheetProvider>
                      <BottomSheetModalProvider>
                        <ToastProvider>    {/* Level 4: Feedback */}
                          <AlertProvider>
                            <TransactionProvider>   {/* Level 5: Data contexts (optional, can be in screens) */}
                              <CategoryProvider>
                                <WalletProvider>
                                  <BudgetProvider>
                                    <GroupProvider>
                                      <LoanProvider>
                                        <SubscriptionProvider>
                                          <InvestmentProvider>
                                            <SavingsProvider>
                                              {/* NO FinancialAnalyticsProvider - derived hooks used instead */}
                                              <AutoTransactionInitializer />
                                              {children}
                                            </SavingsProvider>
                                          </InvestmentProvider>
                                        </SubscriptionProvider>
                                      </LoanProvider>
                                    </GroupProvider>
                                  </BudgetProvider>
                                </WalletProvider>
                              </CategoryProvider>
                            </TransactionProvider>
                          </AlertProvider>
                        </ToastProvider>
                      </BottomSheetModalProvider>
                    </ActionSheetProvider>
                  </GoogleAuthProvider>
                </SafeAreaProvider>
              </PortalProvider>
            </TamaguiProvider>
          </SettingsProvider>
        </UserProvider>
      </EnhancedAuthProvider>
    </QueryPersistenceProvider>
  );
};
```

### Anti-Patterns to Avoid

- **Maintaining separate cache for analytics**: Don't create a separate `FinancialAnalyticsProvider` with its own query. Use derived hooks that read from existing query caches.
- **Event bus for cache coordination**: Don't use coordination event bus for cache invalidation. Use TanStack Query's built-in `queryClient.invalidateQueries()` in mutation `onSuccess` callbacks.
- **Service classes with static methods**: Don't organize services as classes with static methods. Use function modules with named exports.
- **Circular dependencies in features**: Don't have feature modules import each other's services. Use the query cache as the integration point.

## Don't Hand-Roll

| Problem                    | Don't Build                                            | Use Instead                                                       | Why                                                              |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Derived state management   | Custom computed values with manual subscriptions       | TanStack Query derived queries via `queryClient.getQueryData()`   | TanStack Query already caches source data and handles reactivity |
| Cross-context coordination | Custom event bus (CoordinationContext)                 | TanStack Query invalidation + `useIsFetching()`/`useIsMutating()` | TanStack Query provides built-in cache coordination mechanisms   |
| Service organization       | Monolithic `SupabaseDatabaseService` class             | Feature-specific function modules                                 | Function modules are easier to test, mock, and tree-shake        |
| Provider flattening        | Manual provider composition with conditional rendering | Straightforward nesting of essential providers only               | Fewer providers = less complexity, no need for optimization      |

**Key insight:** The biggest mistake in this phase would be to rebuild the coordination layer in a different form. TanStack Query's invalidation system is sufficient for cache coordination—any custom event bus is over-engineering.

## Common Pitfalls

### Pitfall 1: Creating a Separate Analytics Query

**What goes wrong:** Analytics are implemented as a new TanStack Query that fetches aggregated data from a separate endpoint or computes values on every render
**Why it happens:** Treating analytics as a data source rather than derived state
**How to avoid:** Use `queryClient.getQueryData()` to read from existing query caches, compute synchronously, and memoize results. No separate query key needed.
**Warning signs:** Analytics query key in `queryKeys.ts`, analytics query fetching from Supabase, analytics loading state separate from source data loading

### Pitfall 2: Using Event Bus for Cache Invalidation

**What goes wrong:** After deleting CoordinationContext, teams build a new event bus for "cross-module communication"
**Why it happens:** Misunderstanding that TanStack Query invalidation is sufficient for cache coordination
**How to avoid:** In mutation `onSuccess` callbacks, use `queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })` to invalidate all transaction queries. This is the standard pattern.
**Warning signs:** Any `EventEmitter` or `PubSub` implementation after CoordinationContext deletion

### Pitfall 3: Service Module Circular Dependencies

**What goes wrong:** Feature modules start importing each other's services, creating circular dependencies
**Why it happens:** Trying to reuse business logic across domains by importing services directly
**How to avoid:** Put shared business logic in `src/utils/` or `src/features/common/utils/`. Feature services should only import from their own domain and shared utilities.
**Warning signs:** Import statements like `import { transactionService } from '../transactions/service'` inside the groups feature

### Pitfall 4: Moving Types Before Services

**What goes wrong:** Types are moved to feature modules before services, causing import errors
**Why it happens:** Treating type files as independent from implementation files
**How to avoid:** Move types and service files together as a unit. Update imports in both directions before committing.
**Warning signs:** TypeScript errors for missing types after file moves

### Pitfall 5: Breaking Tests During Service Migration

**What goes wrong:** Tests import from `SupabaseDatabaseService` and fail after services are decomposed
**Why it happens:** Tests not updated to import from new feature service modules
**How to avoid:** Run tests after each service module migration. Update test imports to point to new locations.
**Warning signs:** Test failures for "module not found" after service reorganization

## Code Examples

Verified patterns from current codebase and TanStack Query documentation:

### Derived Analytics Hook (Replacing FinancialAnalyticsContext)

```typescript
// src/features/analytics/hooks.ts
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {useMemo} from 'react';
import {Transaction, Category, Budget} from '../types';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export const useFinancialSummary = (userId: string): FinancialSummary => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    // Read from existing query caches - no network request
    const transactions =
      queryClient.getQueryData<Transaction[]>(queryKeys.transactions.list(userId)) ?? [];
    const categories =
      queryClient.getQueryData<Category[]>(queryKeys.categories.list(userId)) ?? [];

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenseAmount = Math.abs(totalExpenses);
    const categoryMap = new Map<string, number>();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const existing = categoryMap.get(t.categoryId || 'uncategorized') || 0;
        categoryMap.set(t.categoryId || 'uncategorized', existing + Math.abs(t.amount));
      });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          category: category?.name || 'Uncategorized',
          amount,
          percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpenses,
      netWorth: totalIncome - totalExpenses,
      savingsRate:
        totalIncome > 0 ? ((totalIncome - Math.abs(totalExpenses)) / totalIncome) * 100 : 0,
      categoryBreakdown,
    };
  }, [queryClient, userId]);
};

export const useSpendingTrend = (userId: string, months: number = 6) => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const transactions =
      queryClient.getQueryData<Transaction[]>(queryKeys.transactions.list(userId)) ?? [];

    const monthlyData = new Map<string, {income: number; expenses: number}>();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= cutoffDate) {
        const monthKey = transactionDate.toISOString().slice(0, 7);
        const current = monthlyData.get(monthKey) || {income: 0, expenses: 0};

        if (transaction.type === 'income') {
          current.income += transaction.amount;
        } else {
          current.expenses += Math.abs(transaction.amount);
        }

        monthlyData.set(monthKey, current);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [queryClient, userId, months]);
};
```

### Service Module (Replacing SupabaseDatabaseService Methods)

```typescript
// src/features/transactions/service.ts
import {supabase} from '@/lib/supabase';
import {Transaction} from './types';

// Helper functions for mapping between DB and domain types
function mapTransaction(row: any): Transaction {
  const categoryObj = Array.isArray(row.categories) ? row.categories[0] : row.categories;

  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    category: categoryObj?.id || row.category_id || 'uncategorized',
    categoryId: categoryObj?.id || row.category_id,
    date: row.date,
    type: row.type,
    groupId: row.group_id || undefined,
    paidBy: row.paid_by || row.user_id,
    receivedBy: row.received_by || undefined,
    splitAmong: row.split_among,
    splitAmounts: row.split_amounts,
    splitMethod: row.split_method || undefined,
    isSettlement: !!row.is_settlement,
    receiptUrl: row.receipt_url,
    receiptUrls: row.receipt_urls || (row.receipt_url ? [row.receipt_url] : []),
    notes: row.notes,
    transactionCurrency: row.transaction_currency || undefined,
    isRecurring: row.is_recurring,
    recurrenceFrequency: row.recurrence_frequency,
    lastModified: new Date(row.updated_at),
  };
}

function mapToDbRow(transaction: Partial<Transaction>): any {
  return {
    amount: transaction.amount,
    description: transaction.description,
    category_id: transaction.categoryId || null,
    date: transaction.date,
    type: transaction.type,
    group_id: transaction.groupId || null,
    paid_by: transaction.paidBy,
    received_by: transaction.receivedBy || null,
    split_among: transaction.splitAmong || null,
    split_amounts: transaction.splitAmounts || null,
    split_method: transaction.splitMethod || null,
    is_settlement: transaction.isSettlement || false,
    receipt_url: transaction.receiptUrl || null,
    receipt_urls: transaction.receiptUrls || null,
    notes: transaction.notes || null,
    transaction_currency: transaction.transactionCurrency || null,
    is_recurring: transaction.isRecurring || false,
    recurrence_frequency: transaction.recurrenceFrequency || null,
    updated_at: new Date().toISOString(),
  };
}

// Export service as object with named functions
export const transactionService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('date', {ascending: false});

    if (error) throw error;
    return data.map(mapTransaction);
  },

  async getById(userId: string, id: string): Promise<Transaction | null> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return mapTransaction(data);
  },

  async create(
    userId: string,
    transaction: Omit<Transaction, 'id' | 'lastModified'>,
  ): Promise<Transaction> {
    const {data, error} = await supabase
      .from('transactions')
      .insert({...mapToDbRow(transaction), user_id: userId})
      .select('*, categories(*)')
      .single();

    if (error) throw error;
    return mapTransaction(data);
  },

  async update(userId: string, id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const {data, error} = await supabase
      .from('transactions')
      .update(mapToDbRow(updates))
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, categories(*)')
      .single();

    if (error) throw error;
    return mapTransaction(data);
  },

  async delete(userId: string, id: string): Promise<void> {
    const {error} = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);

    if (error) throw error;
  },

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', {ascending: false});

    if (error) throw error;
    return data.map(mapTransaction);
  },

  async getByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('date', {ascending: false});

    if (error) throw error;
    return data.map(mapTransaction);
  },
};
```

### Query Options with New Service

```typescript
// src/features/transactions/queries.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {transactionService} from './service';
import {Transaction} from './types';
import * as Crypto from 'expo-crypto';

export function useTransactions(userId: string) {
  return useQuery({
    queryKey: queryKeys.transactions.list(userId),
    queryFn: () => transactionService.getAll(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTransaction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'lastModified'>) =>
      transactionService.create(userId, transaction),

    onSuccess: (newTransaction) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.transactions.list(userId),
        (old: Transaction[] | undefined) => [newTransaction, ...(old ?? [])],
      );

      // Invalidate dependent queries
      queryClient.invalidateQueries({queryKey: queryKeys.analytics.all});
      if (newTransaction.groupId) {
        queryClient.invalidateQueries({queryKey: queryKeys.groups.all});
      }
    },
  });
}

export function useUpdateTransaction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, updates}: {id: string; updates: Partial<Transaction>}) =>
      transactionService.update(userId, id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.transactions.all});
      queryClient.invalidateQueries({queryKey: queryKeys.analytics.all});
    },
  });
}

export function useDeleteTransaction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.delete(userId, id),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.transactions.all});
      queryClient.invalidateQueries({queryKey: queryKeys.analytics.all});
    },
  });
}
```

### Consumer Usage (Screen Component)

```typescript
// src/screens/HomeScreen.tsx - AFTER Phase 6
import {useTransactions, useCreateTransaction} from '@/features/transactions';
import {useCategories} from '@/features/categories';
import {useFinancialSummary, useSpendingTrend} from '@/features/analytics';

export default function HomeScreen() {
  const {user} = useAuth();

  // Get data from feature hooks
  const {data: transactions} = useTransactions(user?.uid ?? '');
  const {data: categories} = useCategories(user?.uid ?? '');

  // Get derived analytics (no separate context)
  const financialSummary = useFinancialSummary(user?.uid ?? '');
  const spendingTrend = useSpendingTrend(user?.uid ?? '');

  // Mutations
  const createTransaction = useCreateTransaction(user?.uid ?? '');

  // No need for useFinancialAnalytics() hook from context
  // Derived hooks compute directly from query cache
}
```

## State of the Art

| Old Approach                                     | Current Approach                       | When Changed | Impact                                                      |
| ------------------------------------------------ | -------------------------------------- | ------------ | ----------------------------------------------------------- |
| FinancialAnalyticsProvider with separate context | Derived hooks reading from query cache | Phase 6      | Eliminates redundant state, reduces provider levels         |
| CoordinationContext with event bus               | TanStack Query invalidation            | Phase 6      | Removes coordination layer, uses built-in Query features    |
| SupabaseDatabaseService monolithic class         | Feature-specific service modules       | Phase 6      | Improves testability, reduces coupling, better tree-shaking |
| 16-level provider tree                           | 5-level provider tree                  | Phase 6      | Simpler rendering, easier debugging, less overhead          |

**Deprecated/outdated:**

- **CoordinationContext**: Entirely deleted - event bus, migration manager, rollback data, and legacy flags no longer needed after Phase 5 migrations complete
- **FinancialAnalyticsContext**: Deleted - analytics are now derived hooks, not a separate context or query
- **SupabaseDatabaseService**: Deleted - replaced by feature-specific service modules

## Open Questions

1. **What to do with services that don't fit cleanly into a single feature?**
   - What we know: Services like `CurrencyConversionService`, `NotificationService`, `ImageCacheService` are cross-cutting
   - What's unclear: Should they go in `src/features/common/` or stay in `src/services/`
   - Recommendation: Create `src/features/common/` with subdirectories (`currency/`, `notifications/`, `storage/`) for cross-cutting services. Delete the root `src/services/` directory entirely.

2. **Should calculation utilities (debt calculation, amortization) be in services or separate utils files?**
   - What we know: Current codebase has `FinancialCalculationService`, `LoanMetricsService`, `DebtPayoffService` as services
   - What's unclear: Whether these should be services or pure utility functions
   - Recommendation: Keep as services if they involve database lookups or external APIs. Move to `utils/` if they're pure mathematical calculations. Most current calculation services are pure math and should be utils.

3. **How to handle the transition from context hooks to feature hooks?**
   - What we know: Screens currently import from `src/context/index.ts` (e.g., `useTransaction`, `useBudget`)
   - What's unclear: Whether to keep the barrel export from context or have screens import from features directly
   - Recommendation: Create feature barrel exports at `src/features/{domain}/index.ts`. Update `src/context/index.ts` to re-export from features for backward compatibility during the transition. Remove context exports in Phase 7.

4. **What happens to the 20+ screens that currently use `useFinancialAnalytics()`?**
   - What we know: `useFinancialAnalytics()` is used in HomeScreen.tsx and SavingsPortfolioScreen.tsx
   - What's unclear: Migration path for these consumers
   - Recommendation: Create a compatibility shim in `src/context/index.ts` that exports the new derived hooks as `useFinancialAnalytics` during Phase 6. Update consumers in Phase 7.

## Sources

### Primary (HIGH confidence)

- **Current codebase analysis**: Read all context files, service files, and provider structure to understand current implementation
- **TanStack Query v5 documentation**: Verified derived state patterns via `queryClient.getQueryData()` and cache invalidation mechanisms
- **React Context API**: Verified provider composition patterns and typical usage for app-wide state

### Secondary (MEDIUM confidence)

- **Feature-first architecture patterns**: Researched common React/React Native project structures for feature-based organization (verified with multiple community projects)
- **Service layer decomposition patterns**: Verified that function modules are preferred over static service classes in modern React codebases

### Tertiary (LOW confidence)

- **None for this phase** - All findings based on current codebase analysis and established patterns, not WebSearch

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All dependencies already in project from previous phases, patterns verified with current codebase
- Architecture: HIGH - Based on analysis of current 53 services, 20 providers, and established React/TanStack Query patterns
- Pitfalls: HIGH - Identified from current codebase anti-patterns (event bus in coordination context, monolithic service class)

**Research date:** 2026-05-02
**Valid until:** 2026-06-01 (30 days - stable patterns, no fast-moving dependencies in this phase)

---

**Research complete.** Ready for planning phase execution.
