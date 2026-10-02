# Group Data Flow Analysis

## Overview

I have performed a comprehensive analysis of the data flow between Group-related screens and the core logic to identify potential issues with expense tracking and splitting.

## Core Data Flow

The data flow relies on a centralized `calculateGroupBalance` function that processes all transactions to determine the current state.

1.  **Expense Creation (`AddGroupTransactionScreen`)**
    - **Flow**: User inputs -> `enhancedGroups.addGroupExpense` -> `normalizeSplitDetails` -> `recalculateMemberBalances`.
    - **Integrity**: The logic correctly normalizes splits and ensures they sum to the total amount. It updates the group's transaction list and immediately recalculates member balances.

2.  **Settlement (`AddGroupTransactionScreen`)**
    - **Flow**: User inputs -> `enhancedGroups.recordSettlement` -> `calculateGroupBalance` (Validation) -> `settlePairwiseDebt` -> `recalculateMemberBalances`.
    - **Integrity**:
      - **Strict Pairwise Enforcement**: The system correctly validates that the payer _actually owes_ the recipient directly before allowing a settlement.
      - **Debt Resolution**: It iterates through past expenses and marks them as "settled" (`isPaid: true`) up to the settlement amount.
      - **History**: It records the specific debts settled in `settledDebtAmounts`, ensuring accurate history.

3.  **Balance Display (`GroupDetailScreen`)**
    - **Flow**: `useGroupBalance` hook -> `calculateGroupBalance`.
    - **Integrity**: This hook correctly uses the fixed logic (handling advance payments/credits) to show the net position of each member.

4.  **Settlement History (`SettlementHistoryScreen`)**
    - **Flow**: Iterates `settlementTransactions` -> Reads `settledDebtAmounts`.
    - **Integrity**: It prioritizes the stored `settledDebtAmounts` (which are accurate at the time of settlement) and has a safe fallback for legacy data.

## Findings & Potential Issues

### 1. "Your Share" in Groups List (UI Issue)

In `GroupsScreen.tsx`, the "Your Share" value displayed on the group card is calculated as:

```typescript
const yourShare = members.length > 0 ? totalAmount / members.length : 0;
```

- **Issue**: This is a naive calculation. It assumes an equal split for _all_ expenses and ignores:
  - Custom splits.
  - Who actually paid (it shows cost responsibility, not debt).
  - Whether you have already paid your share.
- **Impact**: Users might confuse this with "Amount I Owe". It is purely a "Total Group Spending / N" metric.

### 2. Transaction Status Visibility (UX Issue)

In `GroupDetailScreen.tsx`, the transaction list shows the full amount for every expense.

- **Issue**: There is no visual indicator on the transaction item itself to show if it is "Settled", "Partially Settled", or "Unpaid".
- **Impact**: A user might see a list of expenses and think they still owe money for them, even if their Net Balance is 0 (because they settled up). The "truth" is in the Net Balance, but the list might be misleading.

### 3. Credit "Floating" (Logic/UX Nuance)

When a user overpays (Advance Payment), this credit reduces their Net Debt in `calculateGroupBalance`.

- **Nuance**: This credit is _not_ automatically applied to mark specific past transactions as "Paid" in the database. It exists as a mathematical offset.
- **Impact**: A user might have a Net Balance of $0 (due to credit), but specific transactions in the database might still be marked as `isPaid: false`. This is generally fine for a "Net Balance" system, but could cause confusion if we ever show "Unpaid Transactions" lists.

## Conclusion

The **core logic and data flow are robust**, especially with the recent fix for double-counting credits. The strict pairwise debt enforcement in `recordSettlement` prevents invalid settlements.

The user's "strong sense of issues" might be related to:

1.  **The "Your Share" display** in the Groups list being an approximation.
2.  **Lack of "Settled" status** on individual transactions in the list.

## Recommendations

1.  **Update `GroupsScreen`**: Calculate "Your Share" using the actual `useGroupBalance` logic (or a simplified version) to show the user's _actual_ Net Balance (positive = owed to them, negative = they owe).
2.  **Enhance `TransactionItem`**: Add a visual indicator (e.g., a checkmark or "Settled" badge) for transactions that are fully paid/settled.
