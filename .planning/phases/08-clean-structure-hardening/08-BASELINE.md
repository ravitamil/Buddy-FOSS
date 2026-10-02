# Phase 8 Baseline: Clean Structure Hardening

Captured: 2026-05-09

## Repository State

- Current worktree is already dirty before Phase 8 implementation.
- Existing changes include Phase 6/7 refactors, deleted SupabaseDatabaseService files, extracted feature folders, and local agent/config files.
- Phase 8 work must preserve unrelated dirty changes and stage only specific files.

## Validation Baseline

- `cmd /c npx tsc --noEmit`: passed before Phase 8 planning.
- `cmd /c npm run test:integration -- --watchAll=false`: passed, 1 suite / 3 tests.
- `cmd /c npm run lint -- --quiet`: failed with 3,191 errors across 247 files.

## Structural Debt Baseline

- `src/screens` and `src/screenModules` contain 34 files over 400 lines.
- Biggest remaining screen bodies:
  - `src/screenModules/FindGroupAndAddTransactionScreen.tsx`: 1,229 lines
  - `src/screenModules/AddEditSubscriptionScreen.tsx`: 1,168 lines
  - `src/screenModules/EditGroupScreen.tsx`: 1,053 lines
  - `src/screenModules/SavingsGoalDetailScreen.tsx`: 1,015 lines
  - `src/screenModules/AddTransactionScreen.tsx`: 925 lines
  - `src/screenModules/TransactionsScreen.tsx`: 867 lines

## Lint Debt Baseline

Top error files from `cmd /c npx eslint src --ext .ts,.tsx,.js,.jsx --format json --quiet`:

| Errors | File                                            |
| -----: | ----------------------------------------------- |
|    140 | `src/screenModules/TransactionsScreen.tsx`      |
|    100 | `src/services/FinancialDataService.ts`          |
|     97 | `src/services/UserProfileDatabaseService.ts`    |
|     88 | `src/services/InvestmentDatabaseService.ts`     |
|     70 | `src/services/TransactionDatabaseService.ts`    |
|     67 | `src/services/LoanDatabaseService.ts`           |
|     64 | `src/components/debug/PerformanceDashboard.tsx` |
|     64 | `src/services/GroupDatabaseService.ts`          |
|     56 | `src/services/MarketNewsService.ts`             |
|     55 | `src/services/GroupMemberService.ts`            |

## Per-Slice Gates

Use these gates for each bounded cleanup slice:

1. `cmd /c npx tsc --noEmit`
2. `cmd /c npm run test:integration -- --watchAll=false`
3. `cmd /c npx eslint <touched-files> --quiet`
4. Focused Jest tests for the touched domain when available.

Full lint, full format, and full unit tests are Phase 8 objectives, not mandatory pass gates for early slices.
