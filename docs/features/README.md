# BuddyIO — Feature Documentation Catalog

This directory contains comprehensive, end-to-end architectural, UX, data model, and integration documentation for all domain features in BuddyIO.

---

## Documentation Index & Status

| Feature Name                        | Domain Directory                                         | Documentation File                                                             |   Status    |
| :---------------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------- | :---------: |
| **Category**                        | `src/features/categories/`                               | [Category_Feature_Documentation.md](./Category_Feature_Documentation.md)       | ✅ Complete |
| **Groups & Split Expenses**         | `src/features/groups/`                                   | [Group_Split_Feature_Documentation.md](./Group_Split_Feature_Documentation.md) | ✅ Complete |
| **Transactions**                    | `src/features/transactions/`                             | `Transaction_Feature_Documentation.md`                                         | ⏳ Pending  |
| **Budgets**                         | `src/features/budgets/`                                  | `Budget_Feature_Documentation.md`                                              | ⏳ Pending  |
| **Loans & Debts**                   | `src/features/loans/`                                    | `Loan_Feature_Documentation.md`                                                | ⏳ Pending  |
| **Subscriptions**                   | `src/features/subscriptions/`                            | `Subscription_Feature_Documentation.md`                                        | ⏳ Pending  |
| **Investments**                     | `src/features/investments/`                              | `Investment_Feature_Documentation.md`                                          | ⏳ Pending  |
| **Savings Goals**                   | `src/features/savings/`                                  | `Savings_Feature_Documentation.md`                                             | ⏳ Pending  |
| **Wallets & Cards**                 | `src/features/wallets/`, `src/features/cards/`           | `Wallet_Card_Feature_Documentation.md`                                         | ⏳ Pending  |
| **Analytics & Reports**             | `src/features/analytics/`                                | `Analytics_Feature_Documentation.md`                                           | ⏳ Pending  |
| **Auth, Profile & Membership**      | `src/features/auth/`, `src/features/membership/`         | `Auth_Membership_Feature_Documentation.md`                                     | ⏳ Pending  |
| **Auto-Transactions & SMS Engine**  | `src/features/startup/`, `src/services/autoTransaction/` | `Auto_Transaction_Feature_Documentation.md`                                    | ⏳ Pending  |
| **Feature Controls & Killswitches** | `src/features/featureControls/`                          | `Feature_Controls_Documentation.md`                                            | ⏳ Pending  |

---

## Standard Documentation Template

Each feature document contains:

1. **Overview & Business Purpose**
2. **Data Model & Database Schema** (Postgres table, RLS, types)
3. **Entry Points & Navigation Routes** (`app/` screens and UI triggers)
4. **State Management & Data Architecture** (TanStack Query, hooks, context)
5. **UI Architecture & Fluid Surface Design System**
6. **Cross-Feature Integrations & Consumers**
7. **Business Rules, Validation & Lifecycle**
8. **Failure Modes & Edge Cases**
9. **Developer Quick Reference**
