# Deletion Ledger

Date: 2026-07-02
Branch: fix-illegal-state-exception

Purpose: track current working-tree deletions with evidence before any cleanup is
accepted. A file is not considered safe to delete just because TypeScript passes.

## Current Counts

- Tracked deleted files: 151
- Deleted `app/` and `src/` files: 121
- Deleted `src/screens/*` files: 50
- Deleted test, test-helper, or test-like files: 34

## Validation Evidence

- `cmd /c npx tsc --noEmit` passes with the current deletion set.
- `app/_layout.tsx` registers `budget-details`, not `enhanced-budget-details`.
- `app/_layout.tsx` registers `groups/[groupId]/transactions/[transactionId]`, not
  `groups/[id]/transaction/[transactionId]`.
- `app/budget-details.tsx` imports `src/screenModules/BudgetDetailsScreen`.
- `app/groups/[groupId]/transactions/[transactionId].tsx` imports
  `src/screenModules/GroupTransactionDetailScreen`.

## Route Deletions With Replacements

| Deleted file                                      | Replacement evidence                                                                                                                                                                      | Disposition                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `app/enhanced-budget-details.tsx`                 | `app/budget-details.tsx` imports `src/screenModules/BudgetDetailsScreen`; `_layout.tsx` registers `budget-details`                                                                        | likely safe after route smoke test |
| `app/groups/[id]/transaction/[transactionId].tsx` | `app/groups/[groupId]/transactions/[transactionId].tsx` imports `src/screenModules/GroupTransactionDetailScreen`; `_layout.tsx` registers `groups/[groupId]/transactions/[transactionId]` | likely safe after route smoke test |

## Legacy Screen Deletions

50 deleted files under `src/screens/*` were audited for direct replacements.

- 42 have same-name replacements under `src/screenModules/*`.
- 8 do not have same-name replacements and need explicit retirement evidence:
  - `src/screens/AddEditLoanScreenNew.tsx`
  - `src/screens/EnhancedManageCategoriesScreen.tsx`
  - `src/screens/FXRatesScreen.tsx`
  - `src/screens/HomeScreen.tamagui.tsx`
  - `src/screens/LazyAnalyticsScreen.tsx`
  - `src/screens/LoanDataManagementScreen.tsx`
  - `src/screens/LoanDetailScreenNew.tsx`
  - `src/screens/LottieTestScreen.tsx`

Known replacement aliases found:

- `src/screens/AddEditLoanScreenNew.tsx` -> `src/screenModules/AddEditLoanScreen.tsx`
- `src/screens/EnhancedManageCategoriesScreen.tsx` -> `src/screenModules/ManageCategoriesScreen.tsx`
- `src/screens/LoanDetailScreenNew.tsx` -> `src/screenModules/LoanDetailScreen.tsx`

The other five require explicit route/reference evidence before accepting deletion.

## Deleted Tests That Still Target Live Code

These are not proven safe to delete. They should be restored, migrated, or replaced
with a focused equivalent before accepting the deletion.

| Deleted test                                                        | Live subject evidence                                                                            | Required action                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `src/__tests__/layout/ScreenContainer.test.tsx`                     | `src/components/ui/ScreenContainer.tsx` exists and is exported from `src/components/ui/index.ts` | restore or migrate                    |
| `src/__tests__/layout/StandardKeyboardAvoidingView.test.tsx`        | `src/components/ui/StandardKeyboardAvoidingView.tsx` exists and is used by `ScreenWrapper`       | restore or migrate                    |
| `src/components/ui/StandardFormField.test.tsx`                      | `src/components/ui/StandardFormField.tsx` exists and is exported                                 | restore or migrate                    |
| `src/components/ErrorBoundary.test.tsx`                             | `src/components/ErrorBoundary.tsx` exists and is exported                                        | restore or migrate                    |
| `src/components/auth/AnonymousAuthButton.test.tsx`                  | `src/components/auth/AnonymousAuthButton.tsx` exists and is used by `AuthenticationScreen`       | restore or migrate                    |
| `src/components/auth/AuthenticationScreen.test.tsx`                 | `src/components/auth/AuthenticationScreen.tsx` exists and is used by `AuthGuard`                 | restore or migrate                    |
| `src/components/auth/PhoneAuthButton.test.tsx`                      | `src/components/auth/PhoneAuthButton.tsx` exists and is used by `AuthenticationScreen`           | restore or migrate                    |
| `src/__tests__/production/PerformanceMonitoring.test.ts`            | `src/services/PerformanceMonitoringService.ts` exists and is used by hooks/services              | restore or migrate                    |
| `src/__tests__/production/ProductionMonitoring.integration.test.ts` | `src/services/ProductionMonitoringService.ts` exists                                             | restore or migrate                    |
| `src/utils/keyboardUtils.test.ts`                                   | `src/utils/keyboardUtils.ts` exists                                                              | restore or migrate                    |
| `src/utils/screenshot_issue.test.ts`                                | `src/utils/groupBalanceUtils.optimized.ts` exists and is actively imported                       | restore or migrate                    |
| `src/__tests__/utils/integration-test-utils.tsx`                    | shared test helper; deletion can silently weaken test coverage                                   | restore if any restored test needs it |
| `src/__tests__/utils/performance-test-utils.ts`                     | shared test helper; deletion can silently weaken test coverage                                   | restore if any restored test needs it |
| `src/utils/test-utils.tsx`                                          | shared test helper; deletion can silently weaken test coverage                                   | restore if any restored test needs it |

### 2026-07-02 Batch Dispositions

Focused restore command:

`git restore -- src/__tests__/layout/ScreenContainer.test.tsx src/__tests__/layout/StandardKeyboardAvoidingView.test.tsx src/components/ui/StandardFormField.test.tsx src/components/ErrorBoundary.test.tsx src/components/auth/AnonymousAuthButton.test.tsx src/components/auth/AuthenticationScreen.test.tsx src/components/auth/PhoneAuthButton.test.tsx src/__tests__/production/PerformanceMonitoring.test.ts src/__tests__/production/ProductionMonitoring.integration.test.ts src/utils/keyboardUtils.test.ts src/utils/screenshot_issue.test.ts`

Initial focused test command:

`cmd /c npx jest src/__tests__/layout/ScreenContainer.test.tsx src/__tests__/layout/StandardKeyboardAvoidingView.test.tsx src/components/ui/StandardFormField.test.tsx src/components/ErrorBoundary.test.tsx src/components/auth/AnonymousAuthButton.test.tsx src/components/auth/AuthenticationScreen.test.tsx src/components/auth/PhoneAuthButton.test.tsx src/__tests__/production/PerformanceMonitoring.test.ts src/__tests__/production/ProductionMonitoring.integration.test.ts src/utils/keyboardUtils.test.ts src/utils/screenshot_issue.test.ts --runInBand --passWithNoTests`

Initial result: 5 test suites passed and 6 failed; failures were stale imports, stale data shape, missing native test mocks, or current Tamagui/React 19 renderer incompatibility.

Final kept-test command:

`cmd /c npx jest src/__tests__/layout/ScreenContainer.test.tsx src/__tests__/layout/StandardKeyboardAvoidingView.test.tsx src/components/ui/StandardFormField.test.tsx src/components/ErrorBoundary.test.tsx src/components/auth/AuthenticationScreen.test.tsx src/components/auth/PhoneAuthButton.test.tsx src/__tests__/production/PerformanceMonitoring.test.ts src/__tests__/production/ProductionMonitoring.integration.test.ts src/utils/keyboardUtils.test.ts src/utils/screenshot_issue.test.ts --runInBand --passWithNoTests --silent`

Final kept-test result: PASS, 10 suites / 94 tests.

Final typecheck command: `cmd /c npx tsc --noEmit`

Final typecheck result: PASS.

| Test file                                                           | Disposition                                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/__tests__/layout/ScreenContainer.test.tsx`                     | restored and migrated                          | Added local `react-native-svg` mock for live `ScreenContainer`; included in final focused Jest command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/__tests__/layout/StandardKeyboardAvoidingView.test.tsx`        | restored and migrated                          | Updated stale `EnhancedLoggerService` mock to live `LoggerService`; included in final focused Jest command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/components/ui/StandardFormField.test.tsx`                      | restored as-is                                 | Passed in initial focused command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/components/ErrorBoundary.test.tsx`                             | restored and migrated                          | Updated stale text expectations and RN child component; included in final focused Jest command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/components/auth/AuthenticationScreen.test.tsx`                 | restored and migrated                          | Replaced legacy Google context/Firebase-style assertions with current `useGoogleAuth`, current screen copy, child auth callbacks, and signed-in state checks; `cmd /c npx jest src/components/auth/AnonymousAuthButton.test.tsx src/components/auth/AuthenticationScreen.test.tsx src/components/auth/PhoneAuthButton.test.tsx --runInBand --silent` passed for this file.                                                                                                                                                                                                                                                                      |
| `src/components/auth/PhoneAuthButton.test.tsx`                      | restored and migrated                          | Replaced deleted Firebase verification flow with current mobile route, web alert, and navigation error behavior; auth focused command passed for this file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/__tests__/production/PerformanceMonitoring.test.ts`            | restored as-is                                 | Passed in initial focused command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/__tests__/production/ProductionMonitoring.integration.test.ts` | restored and migrated                          | Fixed broken import to live `ExpoErrorReportingService`, changed test environment to supported `development`, and updated assertions to current `breadcrumbs[]` and config shape; `cmd /c npx jest src/__tests__/production/ProductionMonitoring.integration.test.ts src/utils/screenshot_issue.test.ts --runInBand --silent` passed.                                                                                                                                                                                                                                                                                                           |
| `src/utils/keyboardUtils.test.ts`                                   | restored as-is                                 | Passed in initial focused command.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/utils/screenshot_issue.test.ts`                                | restored and migrated                          | Updated settlement fixture to live `Transaction.receivedBy: string[]`; production/screenshot focused command passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/components/auth/AnonymousAuthButton.test.tsx`                  | retired for now, not accepted as safe deletion | Subject is live, but restored/migrated test cannot render current Tamagui Sheet + hCaptcha path under React 19/RNTL. Evidence: `cmd /c npx jest src/components/auth/AnonymousAuthButton.test.tsx --runInBand --silent` fails with nested render errors `parentInstance.children.indexOf is not a function` and repeated `createNodeMock is not a function`. Replacement evidence is partial only: `AuthenticationScreen.test.tsx` covers integration surface that renders/uses the anonymous auth option via mocked child callback. This remains a coverage gap to fix with a dedicated Tamagui Sheet-compatible harness or component refactor. |
| `src/__tests__/utils/integration-test-utils.tsx`                    | left deleted                                   | No restored/migrated test imported it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/__tests__/utils/performance-test-utils.ts`                     | left deleted                                   | No restored/migrated test imported it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/utils/test-utils.tsx`                                          | left deleted                                   | No restored/migrated test imported it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Deleted Tests Likely Obsolete, But Not Yet Accepted

These target deleted components or clearly legacy checks. Keep them deleted only if
the replacement/migration decision is documented.

- `src/__tests__/layout/EnhancedErrorBoundary.test.tsx`
- `src/__tests__/layout/EnhancedScreenWrapper.test.tsx`
- `src/__tests__/legacy-cleanup/deprecated-patterns.test.ts`
- `src/__tests__/legacy-cleanup/performance-validation.test.ts`
- `src/__tests__/legacy-cleanup/standardized-patterns.test.tsx`
- `src/__tests__/performance/component-performance.performance.test.tsx`
- `src/__tests__/performance/context-rerender.test.tsx`
- `src/__tests__/performance/flashlist-performance.test.tsx`
- `src/__tests__/performance/performance-integration.test.tsx`
- `src/__tests__/performance/render-performance.test.tsx`
- `src/__tests__/production/ExpoErrorReporting.test.ts`
- `src/services/SupabaseDatabaseService.settlementMetadata.test.ts`

## Deleted Runtime Files With No Live References Found

These had no live `app/` or `src/` references in the current audit, but still need
owner confirmation or replacement evidence before final removal.

- `src/services/SupabaseDatabaseService.ts`
- `src/services/EnhancedBudgetService.ts`
- `src/services/EnhancedLoggerService.ts`
- `src/types/contexts.ts`
- `src/types/enhanced-group.types.ts`
- `src/utils/cache.ts`
- `src/utils/dataCache.ts`
- `src/utils/loanCalculations.ts`
- `src/utils/loanCalculationsNew.ts`
- `src/utils/loanCalculationsWithDayjs.ts`
- `src/utils/validation/groupValidation.ts`

## Process Rule Going Forward

Before accepting or staging any deletion:

1. Prove there are no live imports/routes for the deleted file, or identify the
   replacement file.
2. For deleted tests, either restore them, migrate them to the new target, or record
   why the behavior is now covered elsewhere.
3. Run `cmd /c npx tsc --noEmit`.
4. Run focused tests for restored or migrated coverage.
5. Stage only reviewed files; do not use broad staging.
