# Phase 7 Research: Remaining Screen Decomposition

## Current Coverage Check

- `07-01-PLAN.md` exists and covered only the initial PortfolioAnalyticsScreen slice.
- `07-01-SUMMARY.md` confirms `PortfolioAnalyticsScreen.tsx` was reduced from 790 to 180 lines.
- No other Phase 7 plan files exist yet.
- `STATE.md` is authoritative: continue 07-01-style oversized screen decomposition before moving to HomeScreen hook reduction and screen-wide `any` cleanup.

## Oversized Screen Inventory

After the PortfolioAnalytics slice, 39 screens remain over 400 lines:

| Lines | Screen                                  | Domain        | Dirty at research time |
| ----: | --------------------------------------- | ------------- | ---------------------- |
|  1750 | `LoanDetailScreenNew.tsx`               | loans         | no                     |
|  1500 | `BudgetSetupScreen.tsx`                 | budgets       | no                     |
|  1423 | `SettingsScreen.tsx`                    | settings      | no                     |
|  1346 | `SubscriptionDetailScreen.tsx`          | subscriptions | yes                    |
|  1247 | `AddGroupTransactionScreen.tsx`         | groups        | yes                    |
|  1240 | `AddEditLoanScreenNew.tsx`              | loans         | no                     |
|  1208 | `GroupDetailScreen.tsx`                 | groups        | no                     |
|  1154 | `FindGroupAndAddTransactionScreen.tsx`  | groups        | no                     |
|  1148 | `InvestmentResearchScreen.tsx`          | investments   | no                     |
|  1112 | `AddEditSubscriptionScreen.tsx`         | subscriptions | no                     |
|   984 | `EditGroupScreen.tsx`                   | groups        | no                     |
|   929 | `SavingsGoalDetailScreen.tsx`           | savings       | no                     |
|   860 | `AddTransactionScreen.tsx`              | transactions  | no                     |
|   855 | `EnhancedManageCategoriesScreen.tsx`    | categories    | no                     |
|   840 | `GroupInsightsScreen.tsx`               | groups        | no                     |
|   815 | `DebtPayoffScreen.tsx`                  | loans         | no                     |
|   809 | `TransactionsScreen.tsx`                | transactions  | no                     |
|   790 | `AddGroupScreen.tsx`                    | groups        | no                     |
|   775 | `ProfileSettingsScreen.tsx`             | settings      | no                     |
|   761 | `PrivacySecurityScreen.tsx`             | settings      | no                     |
|   718 | `SavingsPortfolioScreen.tsx`            | savings       | no                     |
|   710 | `HelpSupportScreen.tsx`                 | settings      | no                     |
|   706 | `EditGroupTransactionScreen.tsx`        | groups        | no                     |
|   684 | `HomeScreen.tsx`                        | home          | no                     |
|   681 | `LottieTestScreen.tsx`                  | diagnostics   | no                     |
|   657 | `AddSavingsGoalScreen.tsx`              | savings       | no                     |
|   630 | `CreateRetirementPlanScreen.tsx`        | savings       | no                     |
|   616 | `GroupTransactionDetailScreen.tsx`      | groups        | no                     |
|   592 | `GroupsScreen.tsx`                      | groups        | no                     |
|   572 | `NetWorthScreen.tsx`                    | analytics     | yes                    |
|   539 | `UnifiedNotificationSettingsScreen.tsx` | settings      | no                     |
|   501 | `BackupSyncScreen.tsx`                  | settings      | no                     |
|   472 | `ActiveNotificationsScreen.tsx`         | notifications | no                     |
|   470 | `MultiStepOnboardingScreen.tsx`         | onboarding    | no                     |
|   451 | `TransactionDetailScreen.tsx`           | transactions  | no                     |
|   441 | `EditCategoryScreen.tsx`                | categories    | no                     |
|   431 | `CategoriesScreen.tsx`                  | categories    | no                     |
|   410 | `SettlementHistoryScreen.tsx`           | groups        | no                     |
|   401 | `AddInvestmentScreen.tsx`               | investments   | no                     |

## Recommended Plan Split

1. `07-05`: investments/savings screen decomposition.
   - `InvestmentResearchScreen.tsx`
   - `AddInvestmentScreen.tsx`
   - `SavingsGoalDetailScreen.tsx`
   - `SavingsPortfolioScreen.tsx`
   - `AddSavingsGoalScreen.tsx`
   - `CreateRetirementPlanScreen.tsx`

2. `07-06`: subscriptions/loans screen decomposition.
   - `SubscriptionDetailScreen.tsx` (dirty; read local edits first)
   - `AddEditSubscriptionScreen.tsx`
   - `LoanDetailScreenNew.tsx`
   - `AddEditLoanScreenNew.tsx`
   - `DebtPayoffScreen.tsx`

3. `07-07`: group screen decomposition.
   - `AddGroupTransactionScreen.tsx` (dirty; read local edits first)
   - `GroupDetailScreen.tsx`
   - `FindGroupAndAddTransactionScreen.tsx`
   - `EditGroupScreen.tsx`
   - `GroupInsightsScreen.tsx`
   - `AddGroupScreen.tsx`
   - `EditGroupTransactionScreen.tsx`
   - `GroupTransactionDetailScreen.tsx`
   - `GroupsScreen.tsx`
   - `SettlementHistoryScreen.tsx`

4. `07-08`: transactions/categories/settings/support screen decomposition.
   - `BudgetSetupScreen.tsx`
   - `SettingsScreen.tsx`
   - `AddTransactionScreen.tsx`
   - `TransactionsScreen.tsx`
   - `EnhancedManageCategoriesScreen.tsx`
   - `ProfileSettingsScreen.tsx`
   - `PrivacySecurityScreen.tsx`
   - `HelpSupportScreen.tsx`
   - `UnifiedNotificationSettingsScreen.tsx`
   - `BackupSyncScreen.tsx`
   - `ActiveNotificationsScreen.tsx`
   - `MultiStepOnboardingScreen.tsx`
   - `TransactionDetailScreen.tsx`
   - `EditCategoryScreen.tsx`
   - `CategoriesScreen.tsx`
   - `LottieTestScreen.tsx`

5. Keep existing roadmap plans:
   - `07-02`: HomeScreen hook reduction.
   - `07-03`: screen `any` cleanup.
   - `07-04`: backward compatibility and legacy shim cleanup.

## Execution Rule

Each plan should remain bounded: 1-3 screens per task commit, always keeping every touched screen under 400 lines and running `cmd /c npx tsc --noEmit`.
