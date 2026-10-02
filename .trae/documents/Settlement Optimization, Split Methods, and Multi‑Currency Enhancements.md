## Overview

- Elevate the group balance system with a graph‑wide settlement optimizer, complete split methods (percentage/shares), and multi‑currency conversion, while preserving the current correctness‑first ledger model and traceability.
- Introduce a strategy toggle to switch between transparent pairwise suggestions and minimized transaction sets.
- Centralize optimized engine usage and keep performance safeguards (cache + worker).

## Settlement Optimization (Graph‑Wide)

1. Strategy model

- Add `SettlementStrategy = 'pairwise' | 'minimize_transactions'` and `SettlementEngineConfig` (tolerances, rounding, max iterations).
- Store strategy in settings/context; default `pairwise` for transparency.

2. Minimal cash‑flow algorithm (Phase 1: Greedy netting)

- Compute net balances from `debtMatrix`: `positives[]` (creditors), `negatives[]` (debtors).
- Greedy match: pay largest debtor to largest creditor; reduce and continue; O(n log n) with heaps.
- Output payments as `SettlementSuggestion[]` with routing trace metadata.

3. Safety & traceability rules

- Never exceed direct debt in pairwise mode; in optimized mode, record `routingTrace: { from, to, via[], amount }` for each payment.
- Deterministic rounding: banker’s rounding to cents; accumulate remainder and distribute using largest‑remainder method.

4. Integration points

- Create `src/utils/settlementStrategies.ts`: `suggestPairwiseSettlements(...)` (existing), `suggestMinimizedSettlements(...)` (new).
- In `src/utils/groupBalanceUtils.optimized.ts`, route settlement suggestion generation via strategy selected from context settings.
- Expand `SettlementSuggestion` type to include `routingTrace` and `strategyUsed`.

5. UI toggle & guardrails

- Add a settings toggle in `SettingsContext` and expose in a new `SettlementModeScreen` via `expo-router`.
- In existing settlement flow screens, show both counts and estimated total transfers; display a disclosure explaining optimized routing.

## Split Methods Completion (Percentage/Shares)

1. Business logic

- In `src/context/EnhancedGroupContext.tsx` implement `normalizeSplitDetails(...)` and `generateSplitDetails(...)` for:
- Percentage: validate sum≈100% (±0.01), compute `amount = roundToCents(total * pct/100)`, distribute remainder with largest remainder.
- Shares: validate total shares>0, compute `amount = roundToCents(total * shares/totalShares)`, distribute remainder similarly.

2. Engine alignment

- Update `calculateSplitAmounts(...)` in `src/utils/groupBalanceUtils.ts` and optimized/worker variants to derive amounts directly from `SplitDetail.percentage`/`shares` when present (if UI didn’t pre‑resolve).
- Keep existing equal/custom paths intact; maintain credit/advance adjustments.

3. UI updates

- Extend `AddGroupTransactionScreen` and `FindGroupAndAddTransactionScreen` to support percentage/shares editors with validations, previews, and per‑member rounding explanations.
- Persist `splitMethod` and `splitDetails` consistently; ensure confirmation cannot proceed with invalid sums.

## Multi‑Currency Support

1. Types & storage

- Augment `Transaction` with `transactionCurrency: CurrencyCode` and `fxRateApplied?: number`.
- Add `groupCurrency: CurrencyCode` to `GroupSettings`; persist in `SettingsContext`.
- Introduce `src/types/fx.ts` for FX types (`FxRate`, `FxSource`, `FxCacheEntry`).

2. Conversion utility

- Create `src/utils/fx.ts`: `convert(amount, from, to, date, source) -> { convertedAmount, rate }` with cached, persisted per‑date rates.
- Support manual rate entry in UI and background refresh from a pluggable source (no external calls required initially).

3. Engine integration

- In balance calculators, convert all transaction amounts to `groupCurrency` prior to split computations; store both original and converted amounts in traces.
- Rounding to cents in `groupCurrency` only; display original currency on UI.

4. UI & settings

- Extend `CurrencySelectionScreen` to set `groupCurrency` and manage FX preferences (manual rates, last updated).
- Show per‑transaction currency and converted amount on details screens.

## Engine Unification & Performance

- Create `src/utils/groupBalance.ts` as the single public entry that re‑exports optimized calculators and settlement strategy router.
- Update business layers to import from `groupBalance` for consistency.
- Maintain worker integration: keep `debtCalculationWorkerService.calculateGroupBalance(...)` dispatching optimized calculators; enable strategy selection propagation.
- Keep caching and chunked processing; expose stats via existing service.

## Settlement UX Enhancements

- Batch settlements: allow selecting multiple pairwise debts and auto‑create a set of settlement transactions in one action; validate each against constraints.
- Scheduled settlements: add `scheduledDate`, `recurrence?` to settlement model; surface in UI with Tamagui components and expo‑router routes.
- History: expand `settlementHistory` to include `strategyUsed`, `routingTrace`, original vs converted amounts.

## Analytics Expansion

- Add selectors/utilities for: debt aging buckets, member settlement ratios, time‑to‑settlement metrics.
- Charts: use existing analytics context and Tamagui‑friendly chart components; display group‑level summaries.

## Migration & Backward Compatibility

- Migrate existing transactions: set `transactionCurrency := groupCurrency` and `fxRateApplied := 1.0`.
- Introduce versioned settings for `settlementStrategy`; default to `'pairwise'`.
- Keep all legacy imports working by providing re‑exports in `groupBalance.ts`.

## Validation & Guardrails

- Reuse UI validations for sum matching, circular debt checks, and amount constraints.
- Add runtime assertions in context mutations (no over‑settlement, no negative balances post routing).
- Perform `npx type check` after changes and resolve all TypeScript errors.

## Deliverables

- New modules: `settlementStrategies.ts`, `fx.ts`, `groupBalance.ts`.
- Context updates: `EnhancedGroupContext.tsx` split handling; `SettingsContext.tsx` strategy/currency additions.
- UI updates: editors for percentage/shares; settlement mode toggle; batch/scheduled flows; currency displays.
- Documentation: code comments removed; developer notes in README for strategy behavior and FX policy.
