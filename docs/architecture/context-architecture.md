# Context Architecture & Domain-Specific Design

> [!IMPORTANT]
> This document outlines the architectural standards for React Context usage in BuddyIO. All new features and refactors must adhere to these principles to prevent "God Object" anti-patterns.

## Core Philosophy

The application has moved away from monolithic contexts (like the legacy `AppContext` or `EnhancedFinancialContext`) towards **modular, domain-specific contexts**.

**Key Principles:**

1.  **Single Responsibility**: Each context manages one specific domain (e.g., `TransactionContext` manages ONLY transactions).
2.  **Separation of Concerns**: Authentication is separate from User Profile; Data is separate from UI state.
3.  **Coordination Layer**: Cross-context communication is handled by a lightweight `CoordinationContext`, not by coupling contexts together.
4.  **Composition**: Use custom hooks to combine data from multiple contexts when needed by a component.

---

## Context Roles & Responsibilities

### 1. Core Infrastructure

These contexts provide the foundation for the application.

| Context                   | Responsibility              | Key Features                                                                                                     |
| :------------------------ | :-------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **`CoordinationContext`** | App orchestration & signals | • Global loading state<br>• App initialization<br>• Cross-context refresh events<br>• Migration/Rollback support |
| **`EnhancedAuthContext`** | Authentication state        | • Login/Logout/Signup<br>• Session persistence<br>• Auth error handling<br>• **NO** user profile data            |
| **`UserContext`**         | User Profile data           | • Name, email, preferences<br>• Profile picture management<br>• Onboarding status<br>• **NO** auth credentials   |
| **`SettingsContext`**     | App configuration           | • Theme (Dark/Light)<br>• Currency settings<br>• Notification preferences                                        |

### 2. Financial Domain

Modular contexts for core financial data.

| Context                         | Responsibility      | Key Features                                                                     |
| :------------------------------ | :------------------ | :------------------------------------------------------------------------------- |
| **`TransactionContext`**        | Transaction records | • CRUD for transactions<br>• Filtering & sorting<br>• Transaction-specific stats |
| **`BudgetContext`**             | Budgeting logic     | • Budget creation/tracking<br>• Spending limits<br>• Budget vs Actual calcs      |
| **`CategoryContext`**           | Classification      | • Category management<br>• Icon & color mapping<br>• Default categories          |
| **`SavingsContext`**            | Savings goals       | • Goal tracking<br>• Contribution history<br>• Progress calculation              |
| **`FinancialAnalyticsContext`** | Aggregated insights | • Net worth calculation<br>• Spending trends<br>• **Read-only** analytics data   |

### 3. Tracker Domain

Specialized contexts for specific tracking features.

| Context                   | Responsibility     | Key Features                                                             |
| :------------------------ | :----------------- | :----------------------------------------------------------------------- |
| **`LoanContext`**         | Debt management    | • Loan details<br>• Amortization schedules<br>• Payoff tracking          |
| **`SubscriptionContext`** | Recurring payments | • Subscription list<br>• Renewal reminders<br>• Monthly cost aggregation |
| **`InvestmentContext`**   | Portfolio tracking | • Asset allocation<br>• Performance tracking<br>• Market value updates   |

---

## Implementation Rules

### ✅ DO

- **Create a new context** if you are adding a distinct new feature domain (e.g., `CryptoContext`, `GoalContext`).
- **Use `CoordinationContext`** to trigger global refreshes (e.g., after a "Nuke Data" action).
- **Use `useCoordinationLoading`** to register background tasks with the global loading indicator.
- **Export a custom hook** (e.g., `useTransactions`) instead of exporting the Context object directly.

### ❌ DO NOT

- **Do not create "God Contexts"** that manage unrelated data (e.g., don't put user settings in `AuthContext`).
- **Do not directly couple contexts**. Avoid `useContext(A)` inside `ContextProvider(B)` unless absolutely necessary (like Auth -> User).
- **Do not put UI state in Domain Contexts**. Modal visibility, form input state, etc., should be local state or in a UI-specific context (like `ToastContext`).

## Example: Adding a New Feature

If you were to add a "Bill Splitting" feature:

1.  **Create `SplitBillContext.tsx`**: Manages groups, bills, and settlements.
2.  **Wrap in `AppProviders.tsx`**: Add the provider to the tree.
3.  **Export `useSplitBill`**: Custom hook for components.
4.  **Integrate**:
    - Use `useAuth` to get the current user ID.
    - Use `useTransaction` if settling a bill creates a transaction.
    - **Do not** modify `TransactionContext` to handle bill splitting logic.

## Migration Guide

If you encounter legacy code using `EnhancedFinancialContext` or `AppContext`:

1.  Identify which domain the code belongs to.
2.  Refactor to use the specific hook (e.g., `useTransaction` or `useBudget`).
3.  If the functionality is missing, add it to the specific domain context, **not** the legacy context.
