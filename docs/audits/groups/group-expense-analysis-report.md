# Group Expense and Settlement Analysis

This document provides a detailed analysis of the group expense and settlement calculation implementation in BuddyIO, with a specific focus on the "multi-hop" debt simplification logic.

## 1. Overview

The group expense system in BuddyIO is designed to track shared expenses among group members, calculate individual balances, and optimize settlements to minimize the number of transactions required to settle debts. It mimics the functionality of popular apps like Splitwise.

**Key Components:**

- **`src/utils/groupBalanceUtils.ts`**: The core calculation engine. It handles debt matrix construction, balance calculation, and settlement simplification.
- **`src/screens/AddGroupTransactionScreen.tsx`**: The UI for creating expenses and settlements.
- **`src/types/index.ts`**: Defines the data models (`Transaction`, `GroupMember`, `MemberDebt`, `SettlementSuggestion`).

## 2. Data Structures

The system relies on a few key data structures defined in `src/types/index.ts`:

- **`Transaction`**: Represents an expense or a settlement.
  - `type`: `'expense' | 'payment'`
  - `paidBy`: ID of the member who paid.
  - `splitDetails`: Array of `SplitDetail` objects defining how much each member owes.
  - `isSettlement`: Boolean flag for settlement transactions.
  - `settledDebts`: Array of transaction IDs that a settlement resolves (crucial for history).

- **`MemberDebt`**: Represents a direct debt between two members.
  - `creditorId` / `debtorId`: Who owes whom.
  - `amount`: The outstanding amount.
  - `transactionIds`: List of expense transaction IDs contributing to this debt.

- **`SettlementSuggestion`**: A suggested payment to settle debts, potentially simplified.
  - `fromMemberId` / `toMemberId`: Payer and Payee.
  - `amount`: Amount to pay.
  - `resolvesDebts`: (Intended to track resolved debts, though simplification makes this abstract).

## 3. Expense Calculation Logic

**Location:** `src/utils/groupBalanceUtils.ts` -> `calculateGroupBalance`

The system processes transactions sequentially to build a **Debt Matrix** (`creditorId -> debtorId -> amount`).

1.  **Initialization**: A matrix is initialized with 0s for all member pairs.
2.  **Expense Processing**: For each expense transaction:
    - The `paidBy` member is identified.
    - `calculateSplitAmounts` determines how much each member owes based on the split method (equal, percentage, custom).
    - For each member who owes money (and is not the payer):
      - The amount is added to `debtMatrix[paidBy][memberId]`.
      - The transaction ID is added to `debtTransactionMatrix[paidBy][memberId]` for tracking.

**Key Insight**: The system maintains a "lifetime" debt matrix in memory during calculation. It doesn't just store the net balance; it tracks pairwise debts.

## 4. Settlement Logic

**Location:** `src/utils/groupBalanceUtils.ts` -> `calculateGroupBalance`

Settlements (payments) reduce the debt in the matrix.

1.  **Payment Processing**: For each settlement transaction (`isSettlement: true`):
    - `paidBy` (Payer) and `receivedBy` (Receiver) are identified.
    - The debt from `Receiver` to `Payer` is reduced: `debtMatrix[Receiver][Payer] -= amount`.
    - **Note**: In the debt matrix, if A owes B, it's stored as `debtMatrix[B][A]`. When A pays B, we reduce `debtMatrix[B][A]`.
    - **Overpayment**: If the payment exceeds the debt, the direction reverses.

## 5. Multi-Hop Simplification (Graph Reduction)

**Location:** `src/utils/groupBalanceUtils.ts` -> `generateSettlementSuggestions`

This is the "multi-hop" logic. It simplifies the debt graph to minimize the number of transactions. For example, if A owes B $10, and B owes C $10, the system suggests A pays C $10 directly, bypassing B.

**Algorithm:**

1.  **Net Balance Calculation**:
    - First, it calculates the **Net Balance** for each member.
    - `Net Balance = (Total Owed To Member) - (Total Member Owes)`.
    - This effectively "flattens" the graph. Intermediate debts cancel out.
    - Example: A owes B $10 (-10), B owes C $10 (+10 - 10 = 0), C is owed $10 (+10).
      - A: -10
      - B: 0
      - C: +10

2.  **Greedy Matching**:
    - It separates members into **Debtors** (negative balance) and **Creditors** (positive balance).
    - It iteratively matches the **Max Debtor** (most negative) with the **Max Creditor** (most positive).
    - **Transaction Amount**: `min(abs(MaxDebtor.balance), MaxCreditor.balance)`.
    - The balances are updated, and the settled member is removed (or effectively becomes 0).
    - This process repeats until all balances are settled (close to 0).

**Implications:**

- **Efficiency**: This guarantees $N-1$ transactions at most for $N$ members.
- **Loss of Granularity**: By flattening to net balances, we lose the specific "who owes whom for what" link in the _suggestion_. The suggestion "A pays C" doesn't strictly correspond to a specific expense A shared with C. It's a mathematical simplification.
- **Correctness**: Mathematically correct for total money flow, but can be confusing for users who expect to pay exactly the person they borrowed from.

## 6. Flow Analysis

1.  **User Action**: User adds an expense in `AddGroupTransactionScreen`.
2.  **Storage**: Expense is saved to Firestore (via `GroupContext`).
3.  **Calculation**:
    - `GroupDetailScreen` (or any consumer) calls `calculateGroupBalance`.
    - This function re-processes _all_ transactions to rebuild the state.
    - It produces `memberBalances` (for UI display) and `settlementSuggestions` (for the "Settle Up" feature).
4.  **Settlement**:
    - User views `SettlementSuggestions`.
    - User selects a suggestion (e.g., "A pays C").
    - `AddGroupTransactionScreen` is pre-filled with this data.
    - User confirms, creating a new Settlement Transaction.
5.  **Re-Calculation**:
    - The new settlement is added to the transaction list.
    - Next `calculateGroupBalance` run includes this settlement, reducing the debts in the matrix.

## 7. Conclusion

The system implements a robust debt tracking mechanism. The "multi-hop" feature is implemented via the `generateSettlementSuggestions` function using a standard greedy algorithm on net balances. This ensures optimal settlement paths but abstracts away the direct pairwise history in the _suggestions_ phase, although the underlying `debtMatrix` and `MemberDebt` objects still retain pairwise accuracy for detailed views.
