## Goals

- Eliminate all legacy/sync code paths and backward compatibility branches.
- Fully migrate contexts/screens to the unified optimized balance engine (`src/utils/groupBalance.ts`).
- Enforce complete data migrations (FX fields, settlement metadata) with no fallbacks.
- Keep UI consistent with current features (FX rates, strategy-aware suggestions) and strengthen integration.

## Engine & Imports Migration

1. Replace all imports of `calculateGroupBalance` et al. from `groupBalanceUtils` with the unified async entry `src/utils/groupBalance.ts` across:

- Contexts: `EnhancedGroupContext.tsx`, any other business contexts using balance.
- Screens: `FindGroupAndAddTransactionScreen.tsx`, `SettlementHistoryScreen.tsx`, any debt-related screens.

2. Refactor call sites to `await` async results; update helpers that assume sync return types.
3. Remove legacy suggestion generator calls; use the strategy router in the optimized engine only.

## Backward Compatibility Removal

1. Settlement history:

- Remove fallback reverse-calculation of settled amounts; rely only on `settledDebtAmounts` stored per transaction.
- If missing, run migration (below) before rendering.

2. UI validations:

- Drop logic meant to accommodate legacy states; enforce strategy-selected behavior (pairwise hard limits vs minimized preview only).

## Data Migration (One-time, On Startup)

1. FX fields:

- For each existing `Transaction`, if `transactionCurrency` is missing, set to current `groupCurrency` and `fxRateApplied := 1`.

2. Settlement metadata:

- For each settlement transaction missing `settledDebtAmounts`, recompute amounts against source debts and persist to `settledDebtAmounts` deterministically.
- Ensure `scheduledDate` present where scheduling is used (optional: set null or remove unused if not planned).

3. Settings:

- Read/validate/migrate to ensure `groupCurrency` and `settlementStrategy` exist; remove legacy keys.
- Persist normalized settings back to storage.

4. Run migration once and record a flag in storage (e.g., `@BuddyApp:migrations:v1_done`).

## FX Rates Integration

1. Wire `FXRatesScreen` into navigation (expo-router route), accessible via Settings.
2. Use rates from `AsyncStorage` to hydrate `fx.ts` cache on startup; no external sources required, but design the interface to add sources later.
3. Ensure `prepareTransactionsWithFx` is applied consistently prior to all balance calculations.

## Suggested Settlements Preview

1. Ensure `SettlementHistoryScreen` and any relevant screens:

- Compute suggestions via optimized engine only.
- Display `strategyUsed` and `routingTrace` consistently.

2. Label sections clearly and remove any legacy/deprecated copy.

## Context Refactor (Async)

1. Update `EnhancedGroupContext.tsx`:

- Use async engine for `recalculateMemberBalances`, `calculateSettlements`, and validation helpers; update types accordingly.
- Ensure state updates are batched and error-handled.

2. Remove cache assumptions tied to sync functions; utilize engine cache/worker as needed.

## Validation & Rounding

- Maintain largest-remainder cent distribution for percentage/shares.
- Enforce pairwise settlement caps in pairwise mode; preview-only minimized strategy (no auto netting write) unless explicitly triggered.

## Verification

- Run `npx tsc --noEmit` and resolve all TypeScript errors.
- Manual sanity checks: Add expense with percentage/shares, seed FX rates, view suggestions under both strategies.

## Deliverables

- Fully migrated imports and async usage.
- Startup migration utility for FX and settlement metadata.
- Navigation entry for `FXRatesScreen`.
- Cleaned SettlementHistory without fallbacks.
- Updated contexts to async balance engine.
- Passing type check with no legacy code paths remaining.
