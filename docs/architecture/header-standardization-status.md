# CustomNavigationHeader Standardization Status

This document tracks the integration of the **75px Collapsing Header Pattern** across all application screens.

## Header Pattern Requirements

- **Hook**: `useProgressiveBlurHeader({ headerHeight: 75 })`
- **Component**: `CustomNavigationHeader` with `mode="collapsing"` and `{...headerProps}`
- **Container**: `ScreenContainer` with `edges={['bottom']}`
- **Offset**: `Animated.ScrollView` or `StandardFlashList` with `paddingTop: 118` (or `120` for lists)

---

## ✅ Standardized Screens (Collapsing Pattern Applied)

| Screen                        | File                                    |
| :---------------------------- | :-------------------------------------- | --------------------------------- |
| Add Investment                | `AddInvestmentScreen.tsx`               |
| Budget Details                | `BudgetDetailsScreen.tsx`               |
| Budget Setup                  | `BudgetSetupScreen.tsx`                 |
| Categories                    | `CategoriesScreen.tsx`                  |
| Create Retirement Plan        | `CreateRetirementPlanScreen.tsx`        |
| Currency Selection            | `CurrencySelectionScreen.tsx`           |
| Debt Payoff                   | `DebtPayoffScreen.tsx`                  |
| Edit Category                 | `EditCategoryScreen.tsx`                |
| Edit Group                    | `EditGroupScreen.tsx`                   |
| Enhanced Budget Details       | `EnhancedBudgetDetailsScreen.tsx`       |
| Enhanced Manage Categories    | `EnhancedManageCategoriesScreen.tsx`    |
| Group Details                 | `GroupDetailScreen.tsx`                 |
| Investment Research           | `InvestmentResearchScreen.tsx`          |
| Loan Details                  | `LoanDetailScreenNew.tsx`               |
| Net Worth                     | `NetWorthScreen.tsx`                    |
| Plan Comparison               | `PlanComparisonScreen.tsx`              |
| Portfolio Analytics           | `PortfolioAnalyticsScreen.tsx`          |
| Portfolio Category Detail     | `PortfolioCategoryDetailScreen.tsx`     |
| Privacy & Security            | `PrivacySecurityScreen.tsx`             |
| Profile Settings              | `ProfileSettingsScreen.tsx`             |
| Savings Goal Detail           | `SavingsGoalDetailScreen.tsx`           |
| Savings Portfolio             | `SavingsPortfolioScreen.tsx`            |
| Subscription Details          | `SubscriptionDetailScreen.tsx`          |
| Tracker (Main)                | `TrackerScreen.tsx`                     | // Should not use CustomNavHeader |
| Transactions                  | `TransactionsScreen.tsx`                |
| Unified Notification Settings | `UnifiedNotificationSettingsScreen.tsx` |

---

## ⏳ Pending Screens (CustomNavigationHeader Present, but not Collapsing)

| Screen                   | File                                   | Priority |
| :----------------------- | :------------------------------------- | :------- |
| Backup & Sync            | `BackupSyncScreen.tsx`                 | Low      |
| Customer Center          | `CustomerCenterScreen.tsx`             | Low      |
| Edit Group Transaction   | `EditGroupTransactionScreen.tsx`       | Medium   |
| Find Group / Add         | `FindGroupAndAddTransactionScreen.tsx` | Medium   |
| Group Insights           | `GroupInsightsScreen.tsx`              | Medium   |
| Groups (Main)            | `GroupsScreen.tsx`                     | High     |
| Group Transaction Detail | `GroupTransactionDetailScreen.tsx`     | High     |
| Group Transactions       | `GroupTransactionsScreen.tsx`          | High     |
| Help & Support           | `HelpSupportScreen.tsx`                | Low      |
| Lottie Test              | `LottieTestScreen.tsx`                 | Low      |
| OTP Verification         | `OTPVerificationScreen.tsx`            | Low      |
| Phone Input              | `PhoneInputScreen.tsx`                 | Low      |
| Settings (Main)          | `SettingsScreen.tsx`                   | High     |
| Settlement History       | `SettlementHistoryScreen.tsx`          | Medium   |
| Subscriptions (Main)     | `SubscriptionsScreen.tsx`              | High     |
| Transaction Details      | `TransactionDetailScreen.tsx`          | High     |

---

## ❌ Screens Missing CustomNavigationHeader

These screens either use manual headers, React Navigation headers, or no header at all.

- `CardsScreen.tsx`
- `FXRatesScreen.tsx`
- `HomeScreen.tsx` (Uses custom dashboard header)
- `LazyAnalyticsScreen.tsx`
- `LoanDataManagementScreen.tsx`
- `LoansScreen.tsx` (Pending refactor)
- `MultiStepOnboardingScreen.tsx`
- `PaywallScreen.tsx`
- `SettlementModeScreen.tsx`
- `TestEmojiDisplay.tsx`

---

_Last Updated: February 21, 2026_
