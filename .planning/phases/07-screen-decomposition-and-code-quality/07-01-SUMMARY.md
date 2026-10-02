---
phase: 07-screen-decomposition-and-code-quality
plan: 01
subsystem: ui
tags: [react-native, expo, tamagui, investments, screen-decomposition]

requires:
  - phase: 06-analytics-coordination-cleanup-and-service-consolidation
    provides: feature-first investment module structure
provides:
  - PortfolioAnalyticsScreen reduced below the 400-line Phase 7 target
  - Investments feature hook for portfolio analytics calculations
  - Investments feature components for analytics cards, charts, and performer lists
affects: [phase-7, screen-decomposition, investments]

tech-stack:
  added: []
  patterns:
    - 'Screen container delegates business calculations to feature hook'
    - 'Screen container delegates repeated UI sections to feature components'

key-files:
  created:
    - src/features/investments/hooks/usePortfolioAnalytics.ts
    - src/features/investments/components/PortfolioAnalyticsSections.tsx
  modified:
    - .planning/phases/07-screen-decomposition-and-code-quality/07-01-PLAN.md
    - src/features/investments/index.ts
    - src/screens/PortfolioAnalyticsScreen.tsx

key-decisions:
  - 'Treat 07-01 as an incremental oversized-screen decomposition plan; this slice completed PortfolioAnalyticsScreen and leaves the remaining backlog for continuation.'
  - 'Keep portfolio analytics code in the investments feature module instead of adding a new cross-feature analytics module.'

patterns-established:
  - 'Feature hook owns derived screen calculations and typed view models.'
  - 'Feature components own repeated analytics sections while the screen owns routing, header, refresh state, and composition.'

duration: 34min
completed: 2026-05-02
---

# Phase 7 Plan 01: Decompose Screens Over 400 Lines Summary

**Portfolio analytics screen decomposed into typed investments feature hook and reusable analytics section components**

## Performance

- **Duration:** 34 min
- **Started:** 2026-05-02T19:39:51Z
- **Completed:** 2026-05-02T20:13:07Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Created `.planning/phases/07-screen-decomposition-and-code-quality/07-01-PLAN.md` because Phase 7 had roadmap entries but no plan files.
- Reduced `src/screens/PortfolioAnalyticsScreen.tsx` from 790 lines to 180 lines.
- Extracted portfolio metrics, category breakdowns, performer rankings, chart data, and typed view models into `usePortfolioAnalytics`.
- Extracted analytics cards, overview cards, performance chart, asset allocation, risk analysis, benchmark, rebalancing, and performer sections into `PortfolioAnalyticsSections.tsx`.
- Preserved the local gifted-charts fixes already present in the dirty worktree.

## Screens Analyzed

Initial inventory found 40 screens over 400 lines. The largest/riskier screens were:

| Lines | Screen                                             |
| ----: | -------------------------------------------------- |
|  1750 | `src/screens/LoanDetailScreenNew.tsx`              |
|  1500 | `src/screens/BudgetSetupScreen.tsx`                |
|  1423 | `src/screens/SettingsScreen.tsx`                   |
|  1346 | `src/screens/SubscriptionDetailScreen.tsx`         |
|  1247 | `src/screens/AddGroupTransactionScreen.tsx`        |
|  1240 | `src/screens/AddEditLoanScreenNew.tsx`             |
|  1208 | `src/screens/GroupDetailScreen.tsx`                |
|  1154 | `src/screens/FindGroupAndAddTransactionScreen.tsx` |
|  1148 | `src/screens/InvestmentResearchScreen.tsx`         |
|  1112 | `src/screens/AddEditSubscriptionScreen.tsx`        |
|   790 | `src/screens/PortfolioAnalyticsScreen.tsx`         |

`PortfolioAnalyticsScreen.tsx` was selected first because it was oversized, already had local chart fixes in the dirty worktree, and mapped cleanly to the Phase 6 investments feature module.

## Task Commits

1. **Task 1: Inventory oversized screens and confirm bounded slice** - `c7e1cf8` (docs)
2. **Task 2: Extract portfolio analytics business logic into feature hook** - `a61255d` (refactor)
3. **Task 3: Extract portfolio analytics UI sections into feature components** - `2356a8d` (refactor)

## Files Created/Modified

- `src/features/investments/hooks/usePortfolioAnalytics.ts` - Typed hook for portfolio metrics, category chart data, performance chart data, and performer ranking.
- `src/features/investments/components/PortfolioAnalyticsSections.tsx` - Analytics cards and display sections extracted from the screen.
- `src/features/investments/index.ts` - Re-exports the new hook and components.
- `src/screens/PortfolioAnalyticsScreen.tsx` - Thin container for routing, header, refresh state, and section composition.
- `.planning/phases/07-screen-decomposition-and-code-quality/07-01-PLAN.md` - Execution plan for the bounded 07-01 slice.

## Decisions Made

- 07-01 should continue incrementally. Completing every oversized screen in one run would be too large and risky.
- Investment analytics decomposition belongs in `src/features/investments/` because the screen depends on investment and savings portfolio data, and Phase 6 established feature-first modules.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed invalid benchmark placeholder rendering**

- **Found during:** Task 2
- **Issue:** `benchmarkComparisons` was an object with `sp500` and `nasdaq` placeholders, but the UI iterated it as comparison rows with fields like `investmentName`, `alpha`, and `benchmarkReturn`, producing undefined/NaN display values.
- **Fix:** Replaced the placeholder object with a typed empty `BenchmarkComparison[]`; the benchmark section now renders only when valid rows exist.
- **Files modified:** `src/features/investments/hooks/usePortfolioAnalytics.ts`, `src/features/investments/components/PortfolioAnalyticsSections.tsx`
- **Verification:** `cmd /c npx tsc --noEmit`
- **Committed in:** `a61255d`, `2356a8d`

**2. [Rule 1 - Bug] Fixed refresh handler lint/type mismatch**

- **Found during:** Task 3 commit hook
- **Issue:** `handleRefresh` was marked `async` but had no `await`, causing `@typescript-eslint/require-await` and `no-misused-promises` failures during the pre-commit hook.
- **Fix:** Converted `handleRefresh` to a synchronous callback.
- **Files modified:** `src/screens/PortfolioAnalyticsScreen.tsx`
- **Verification:** pre-commit hook and `cmd /c npx tsc --noEmit`
- **Committed in:** `2356a8d`

---

**Total deviations:** 2 auto-fixed bugs.
**Impact on plan:** Both fixes were required to preserve a clean decomposition and pass local commit checks. No architecture changes were introduced.

## Verification

- `cmd /c npx tsc --noEmit` - PASSED
- `PortfolioAnalyticsScreen.tsx` line count - 180 lines, below the 400-line target
- New feature hook/component exports compile through `src/features/investments/index.ts`

## Remaining Screens Over 400 Lines

39 screen files remain above the Phase 7 target:

`LoanDetailScreenNew.tsx`, `BudgetSetupScreen.tsx`, `SettingsScreen.tsx`, `SubscriptionDetailScreen.tsx`, `AddGroupTransactionScreen.tsx`, `AddEditLoanScreenNew.tsx`, `GroupDetailScreen.tsx`, `FindGroupAndAddTransactionScreen.tsx`, `InvestmentResearchScreen.tsx`, `AddEditSubscriptionScreen.tsx`, `EditGroupScreen.tsx`, `SavingsGoalDetailScreen.tsx`, `AddTransactionScreen.tsx`, `EnhancedManageCategoriesScreen.tsx`, `GroupInsightsScreen.tsx`, `DebtPayoffScreen.tsx`, `TransactionsScreen.tsx`, `AddGroupScreen.tsx`, `ProfileSettingsScreen.tsx`, `PrivacySecurityScreen.tsx`, `SavingsPortfolioScreen.tsx`, `HelpSupportScreen.tsx`, `EditGroupTransactionScreen.tsx`, `HomeScreen.tsx`, `LottieTestScreen.tsx`, `AddSavingsGoalScreen.tsx`, `CreateRetirementPlanScreen.tsx`, `GroupTransactionDetailScreen.tsx`, `GroupsScreen.tsx`, `NetWorthScreen.tsx`, `UnifiedNotificationSettingsScreen.tsx`, `BackupSyncScreen.tsx`, `ActiveNotificationsScreen.tsx`, `MultiStepOnboardingScreen.tsx`, `TransactionDetailScreen.tsx`, `EditCategoryScreen.tsx`, `CategoriesScreen.tsx`, `SettlementHistoryScreen.tsx`, `AddInvestmentScreen.tsx`.

## Issues Encountered

- The injected GSD helper path referenced `C:/Users/ravik/.Codex/...`, but the available helper was under `C:/Users/ravik/.claude/...`.
- The worktree started dirty with broad unrelated edits. Only Phase 7 files and the selected investment screen decomposition were staged for task commits.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Continue 07-01 with the remaining oversized screens before moving to 07-02. The next highest-value targets are `SubscriptionDetailScreen.tsx`, `AddGroupTransactionScreen.tsx`, `InvestmentResearchScreen.tsx`, and `HomeScreen.tsx` because they are oversized and already touched or named by Phase 7 goals.

## Self-Check: PASSED

- Found `.planning/phases/07-screen-decomposition-and-code-quality/07-01-PLAN.md`
- Found `src/features/investments/hooks/usePortfolioAnalytics.ts`
- Found `src/features/investments/components/PortfolioAnalyticsSections.tsx`
- Found `src/screens/PortfolioAnalyticsScreen.tsx`
- Found commit `c7e1cf8`
- Found commit `a61255d`
- Found commit `2356a8d`

---

_Phase: 07-screen-decomposition-and-code-quality_
_Completed: 2026-05-02_
