# Implementation Plan - Group Data Flow Improvements

## Goal

Implement the recommendations from `Group_Data_Flow_Analysis.md` to improve the accuracy of group balance display and transaction status visibility.

## User Review Required

> [!NOTE]
> "Your Share" in Groups List will now reflect the **Net Balance** (what you owe or are owed), not just a naive "Total / N". This is a significant improvement in accuracy but might look different to users.

## Proposed Changes

### 1. `src/screens/GroupsScreen.tsx`

- **Update `convertGroupToCardProps`**:
  - Replace the naive `totalAmount / members.length` calculation.
  - Use `calculateGroupBalance` to determine the current user's actual `balance`.
  - Pass this `balance` as `yourShare`.
  - Update `GroupCard` to handle positive (owed to you) vs negative (you owe) display if needed (though `GroupCard` might already handle it or just display the number).

### 2. `src/components/ui/TransactionItem.tsx`

- **Add Props**: `settlementStatus?: 'settled' | 'unsettled' | 'partial'` and `isPayer?: boolean`.
- **UI Changes**:
  - Add a visual indicator (e.g., checkmark badge) if `settlementStatus === 'settled'`.
  - Maybe a different style for 'unsettled' if relevant, but primarily focusing on "Settled" confirmation.

### 3. `src/screens/GroupDetailScreen.tsx`

- **Update `convertTransactionToItemProps`**:
  - Calculate `settlementStatus` for each transaction based on the current user.
  - **Logic**:
    - **If User Paid**: Check if all _other_ members' splits are `isPaid`. If yes -> `settled`.
    - **If User Owe**: Check if _user's_ split is `isPaid`. If yes -> `settled`.
  - Pass this status to `TransactionItem`.

## Verification Plan

### Manual Verification

1.  **Groups Screen**:
    - Verify that "Your Share" accurately reflects net debt/credit.
    - Create a group, add an expense (I pay). "Your Share" should be positive (owed to me).
    - Add an expense (Other pays). "Your Share" should be negative (I owe).
2.  **Transaction List**:
    - Create an expense. Should be "Unsettled".
    - Settle the expense. Should change to "Settled" (checkmark).
