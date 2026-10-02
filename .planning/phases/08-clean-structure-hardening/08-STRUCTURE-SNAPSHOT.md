# Phase 8 Whole-Project Structure Snapshot

Captured after Batch 144 while executing `08-WHOLE-PROJECT-STRUCTURE-PLAN.md`.

## Validation Baseline

- Whole-`src` implementation files over 400 lines: 0.
- `src/screens` / `src/screenModules` oversized scan: 0 files over 400 lines.
- `jscpd`: 0 clone groups, 0 duplicated lines, 0% duplicated lines.
- Lint JSON snapshot: 0 files, 0 errors.
- Dependency cleanup: unused direct dependencies removed from `package.json` and `yarn.lock` for `@shopify/react-native-skia`, `bootstrap-icons`, `prop-types`, `react-day-picker`, `react-native-chart-kit`, `react-native-web`, `text-encoding`, and `zustand`; matching obsolete Expo doctor excludes removed.
- `src/context/GroupContext.tsx`: reduced from 624 lines to 23 lines; provider behavior now lives in feature-owned group context hooks, all under 400 lines.
- `src/context/CategoryContext.tsx`: reduced from 549 lines to 28 lines; provider behavior now lives in feature-owned category context modules, all under 400 lines.
- `src/context/TransactionContext.tsx`: reduced from 502 lines to 28 lines; provider behavior now lives in feature-owned transaction context modules, all under 400 lines.
- `src/context/LoanContext.query.tsx`: reduced from 500 lines to 26 lines; provider behavior now lives in feature-owned loan context modules, all under 400 lines.
- `src/context/InvestmentContext.tsx`: reduced from 474 lines to 28 lines; provider behavior now lives in feature-owned investment context modules, all under 400 lines.
- `src/context/SubscriptionContext.query.tsx`: reduced from 440 lines to 31 lines; provider behavior now lives in feature-owned subscription context modules, all under 400 lines.
- `src/contexts/GoogleAuthContext.tsx`: reduced from 472 lines to 27 lines; provider behavior now lives in feature-owned auth context modules, all under 400 lines.
- `src/screenModules/LoansScreen.tsx`: reduced from 424 lines to 126 lines; loan card and empty-state UI now live under `src/features/loans/components`.
- `src/screenModules/BudgetDetailsScreen.tsx`: reduced from 419 lines to 110 lines; budget detail cards, chart, analytics wrapper, actions, and empty state now live under `src/features/budgets/components`.
- `src/screenModules/AddCategoryScreen.tsx`: reduced from 419 lines to 73 lines; create-category state now lives in `src/features/categories/hooks/useAddCategoryScreen.ts`, form UI lives in `src/features/categories/components/AddCategoryFormSections.tsx`, and shared color-palette UI lives in `src/features/categories/components/CategoryColorPicker.tsx`.
- `src/screenModules/SubscriptionsScreen.tsx`: reduced from 415 lines to 72 lines; refresh/navigation/data model now lives in `src/features/subscriptions/hooks/useSubscriptionsScreen.ts`, and list item plus empty/loading states live under `src/features/subscriptions/components`.
- `src/screens/PlanComparisonScreen.tsx`: reduced from 405 lines to 83 lines; membership plan hero, cards, feature table, and floating CTA now live under `src/features/membership/components`.
- `src/utils/groupValidation.ts`: reduced from 619 lines to 11 lines; validation types plus group/member/transaction/split/balance/helper logic now live in focused modules under `src/utils/groupValidation/`.
- `src/workers/debtCalculation.worker.ts`: reduced from 610 lines to 18 lines; worker message handling, calculation engine, split calculations, settlement suggestions, state initialization, metrics, and types now live under `src/workers/debtCalculation/`.
- `src/components/CategoryBudgetSetup.tsx`: reduced from 595 lines to 5 lines; category allocation behavior and UI now live under `src/features/budgets/hooks` and `src/features/budgets/components`, with the original public import path preserved.
- `src/components/BudgetAnalytics.tsx`: reduced from 575 lines to 5 lines; analytics calculations and presentation now live under `src/features/budgets/hooks` and `src/features/budgets/components`, with the original public import path preserved.
- `src/features/categories/components/ManageCategoriesScreenFrame.tsx`: reduced from 569 lines to 72 lines; manage-category primitives, rows, filters/status, and section rendering now live in focused category components.
- `src/utils/loanCalculations.ts`: reduced from 555 lines to 37 lines; loan calculation wrappers, types, date helpers, progress/status helpers, and currency formatting now live under `src/utils/loanCalculations/`.
- `src/components/ui/CardManagement.tsx`: removed after import verification showed no live `src` or `app` consumers; the stale commented barrel export was removed from `src/components/ui/index.ts`.
- `src/components/ui/CustomNavigationHeader.tsx`: reduced from 551 lines to 89 lines; route-aware navigation, progressive blur state, background layers, back button, and title rendering now live under `src/components/ui/navigationHeader/`.
- `src/features/loans/components/DebtPayoffSections.tsx`: reduced from 544 lines to 3 lines; sync status, empty state, content composition, strategy controls, summary/chart/order cards, and payment controls now live under `src/features/loans/components/debtPayoff/`.
- `src/features/savings/components/CreateRetirementPlanFormSections.tsx`: reduced from 527 lines to 83 lines; form primitives, detail sections, risk profile sheet, goal summary, and delete action now live under `src/features/savings/components/createRetirementPlan/`.
- `src/components/ui/BudgetPlanningCard.tsx`: reduced from 521 lines to 30 lines; overview data aggregation, active budget UI, category rows, progress bar, and zero-state prompt now live under `src/components/ui/budgetPlanning/`.
- `src/features/groups/hooks/useFindGroupAndAddTransactionScreen.ts`: reduced from 517 lines to 361 lines; public result types plus split/settlement helpers now live beside the hook in focused group hook modules.
- `src/features/savings/components/SavingsPortfolioSections.tsx`: reduced from 512 lines to 6 lines; portfolio glass chrome, quick actions, category cards, wealth distribution, empty state, goal allocation, and export sheet now live under `src/features/savings/components/savingsPortfolio/`.
- `src/features/loans/hooks/useLoanDetailScreen.ts`: reduced from 505 lines to 300 lines; public result types plus loan mapping, metrics, payment payload, and installment detail helpers now live beside the hook.
- `src/features/subscriptions/hooks/useSubscriptionDetailScreen.ts`: reduced from 497 lines to 369 lines; public result types plus analytics, payment payload, date, share, URL, and resume-action helpers now live beside the hook.
- `src/features/groups/components/EditGroupCards.tsx`: reduced from 494 lines to 4 lines; edit-group glass card chrome, group information, description, member management, and group type helpers now live under `src/features/groups/components/editGroupCards/`.
- `src/utils/loanCalculationsNew.ts`: reduced from 481 lines to 27 lines; EMI calculations, amortization/date helpers, loan analysis helpers, and shared calculation types now live under `src/utils/loanCalculationsNew/`.
- `src/features/budgets/hooks/useBudgetSetupScreen.ts`: reduced from 473 lines to 370 lines; public hook types plus numeric validation, recurring item mapping, totals, draft creation, and budget payload construction now live beside the hook.
- `src/services/CreditCardStorageService.ts`: reduced from 464 lines to 399 lines; tracker AsyncStorage read/write, import/export, clear, stored entity construction, and remote writeback helpers now live under `src/services/tracker/trackerStoragePersistence.ts`.
- `src/services/PerformanceMonitoringService.ts`: reduced from 464 lines to 365 lines; metric construction, render metric construction, metric trimming, and memory metric conversion now live under `src/services/performanceMonitoring/metricRecording.ts`.
- `src/hooks/useGroupPerformance.ts`: reduced from 457 lines to 138 lines; public result types plus dependency hashing, stats, filters, member activity, settlement summary, and performance recommendation helpers now live beside the hook.
- `src/features/groups/components/SettlementHistorySections.tsx`: reduced from 455 lines to 3 lines; quick-settle, summary, stat item, transaction card, payment history, and settled-debt helpers now live under `src/features/groups/components/settlementHistory/`.
- `src/services/AutoTransactionService.ts`: reduced from 455 lines to 311 lines; auto-transaction types, scheduled-payment parsing/building, due/upcoming checks, transaction/payment payload construction, and payment stats now live under `src/services/autoTransaction/`.
- `src/services/debtCalculationWorkerService.ts`: reduced from 450 lines to 336 lines; worker job creation, worker messages, selection, job id, worker-use decision, chunk sizing, and performance snapshots now live under `src/services/debtWorker/workerServiceHelpers.ts`.
- `src/services/MarketNewsService.ts`: reduced from 449 lines to 180 lines; market-news types, request/cache helpers, article mapping, time formatting, and mock news generation now live under `src/services/marketNews/`.
- `src/features/settings/components/ProfileSettingsSections.tsx`: reduced from 447 lines to 2 lines; shared profile field chrome, loading state, content shell, header, information, security, and link-account sections now live under `src/features/settings/components/profileSettings/`.
- `src/services/DebtPayoffService.ts`: reduced from 445 lines to 70 lines; sync metadata helpers, strategy ordering, payoff plan calculation, optimized schedules, and monthly payment helpers now live under `src/services/debtPayoff/`.
- `src/utils/incrementalDebtCalculation.ts`: reduced from 444 lines to 209 lines; incremental debt types, split calculation, delta application, member balance updates, dependency creation, and cache-age helpers now live under `src/utils/incrementalDebtCalculation/`.
- `src/hooks/useBudgetTracking.ts`: reduced from 443 lines to 183 lines; public hook types plus period calculation, category spending, utilization, remaining amounts, trend analysis, alert generation, and transaction hashing now live beside the hook.
- `src/features/subscriptions/components/AddEditSubscriptionSections.tsx`: reduced from 438 lines to 20 lines; service information, category/icon selection, additional details, smart settings, and shared section controls now live under `src/features/subscriptions/components/addEditSubscriptionSections/`.
- `src/components/ui/AnimatedCreditCard.tsx`: reduced from 437 lines to 136 lines; card data/types, dimensions, brand icon mapping, gradient card face, copy controls, and edit/delete action menu now live under `src/components/ui/animatedCreditCard/`.
- `src/services/BudgetNotificationService.ts`: reduced from 434 lines to 184 lines; threshold, overspending, category-limit, immediate summary, and notification-received action handling now live in `src/services/notifications/budgetNotificationAlerts.ts`.
- `src/services/FinancialCalculationService.ts`: reduced from 428 lines to 161 lines; financial calculation types, conversions, budget metrics, obligation mapping, and advanced formulas now live under `src/services/financialCalculation/`.
- `src/services/LoanStorageService.ts`: reduced from 427 lines to 232 lines; AsyncStorage persistence, cloud sync, loan mutation helpers, payment record creation, lookup/search/date-range filtering, outstanding totals, and pagination now live under `src/services/loanStorage/`.
- `src/features/savings/components/SavingsGoalDetailCards.tsx`: reduced from 427 lines to 13 lines; glass card chrome, detail primitives, summary, quick actions, details, edit button, and delete dialog now live under `src/features/savings/components/savingsGoalDetail/`.
- `src/features/groups/components/AddGroupScreenSections.tsx`: reduced from 426 lines to 2 lines; group information, description, currency, content composition, and screen frame now live under `src/features/groups/components/addGroupScreen/`.
- `src/components/ui/CardGrid.tsx`: removed after import verification showed no live `src` or `app` consumers; the stale commented barrel export was removed from `src/components/ui/index.ts`.
- `src/features/groups/components/GroupInsightsSections.tsx`: reduced from 422 lines to 9 lines; shared section types, empty state/mode button, summary/mode toggle, debts/members lists, and analytics charts now live under `src/features/groups/components/groupInsightsSections/`.
- `src/services/GroupBudgetService.ts`: reduced from 418 lines to 117 lines; group budget types, impact/metrics, settlement reminders, and forecasting now live under `src/services/groupBudget/`.
- `src/services/logger/loggerCore.ts`: reduced from 417 lines to 140 lines; logger types/config, console capture, sanitization, console/file output, and external-service stub handling now live in focused logger modules.
- `src/components/ui/StandardFormField.tsx`: reduced from 411 lines to 178 lines; prop types, theme/color helpers, Android input helpers, input style construction, placeholder color selection, and validation/help/character-count message rendering now live under `src/components/ui/standardFormField/`.
- `src/types/enhanced-group.types.ts`: removed; the remaining group-domain contract now lives in feature-owned `src/features/groups/types.ts`, and all live imports use `@/features/groups/types`.
- `ts-prune`: advisory only. It reports Expo route defaults, feature barrel exports, and dynamic framework entry points as unused, so entries are not safe-delete candidates without reference verification.

## Largest Implementation Files

| Lines | Path                                                         |
| ----: | ------------------------------------------------------------ |
|   397 | `src/types/context-foundation.ts`                            |
|   396 | `src/utils/context-test-setup.ts`                            |
|   394 | `src/components/ui/WalletWithCards.tsx`                      |
|   378 | `src/features/groups/hooks/useEditGroupTransactionScreen.ts` |
|   376 | `src/features/investments/hooks/useInvestmentResearch.ts`    |
|   372 | `src/features/groups/hooks/useGroupDetailScreen.ts`          |

## Remaining `Enhanced*` Inventory

- Filename-level inventory: none. `rg --files src app | rg "(?i)enhanced"` returns no files.
- Intentionally retained symbol-level names:
  - `src/features/groups/types.ts`: `EnhancedGroup`, `EnhancedGroupMember`, and `EnhancedGroupSettings` remain as the active group data contract until the separate `src/types/group.types.ts` `Group` / `GroupMember` contracts can be reconciled in a focused model-merge batch.
  - `src/features/loans/context/loanContextTypes.ts`: `EnhancedLoan` remains as the loan context's date-normalized runtime loan contract.
  - `src/services/financialCalculation/financialCalculationTypes.ts`: `EnhancedBudgetMetrics` remains as a financial calculation output contract.
  - `src/components/ui/ShadowSystem.tsx`: `EnhancedShadowProps`, `EnhancedShadowViewProps`, `EnhancedShadowView`, and `useEnhancedShadow` remain as the public shadow-system API.

## Logger Structure

- Public logger API: `src/services/LoggerService.ts`.
- Private core logger engine: `src/services/logger/loggerCore.ts`.
- Retired import path: `src/services/EnhancedLoggerService.ts`.
- No `EnhancedLoggerService`, `enhancedLogger`, or `enhancedLoggerService` references remain in `src` or `app`.

## Duplicate Groups

Current `jscpd` groups: none.

## Dependency Cleanup

- Removed direct dependencies: `@shopify/react-native-skia`, `bootstrap-icons`, `prop-types`, `react-day-picker`, `react-native-chart-kit`, `react-native-web`, `text-encoding`, `zustand`.
- Removed obsolete Expo doctor excludes: `react-native-chart-kit`, `bootstrap-icons`, `react-day-picker`, `text-encoding`.
- Direct dependency / doctor-exclude verification for the removed candidates: empty.
- Runtime import verification: no exact imports or `require()` calls for the removed packages in `src` or `app`; `react-native-webview` remains intentionally installed and imported.

## Recommended Next Wave

1. Keep the whole-`src` 400-line ceiling green while making any remaining structure changes.
2. Continue opportunistic decomposition of the largest near-threshold files, starting with `src/types/context-foundation.ts`, `src/utils/context-test-setup.ts`, `src/components/ui/WalletWithCards.tsx`, and `src/features/groups/hooks/useEditGroupTransactionScreen.ts`.
3. Reconcile `EnhancedGroup` / `EnhancedGroupMember` with the separate `Group` / `GroupMember` contracts after model ownership and consumer expectations are mapped.
