# Group Expense Tracking & Splitting Logic Audit Report

## 1. Executive Summary

The group expense tracking and splitting logic in BuddyIO is largely well-structured, adhering to the requirement of **pairwise debt enforcement** and avoiding "greedy simplification". However, a **critical logic bug** exists in the handling of **Advance Payments / Credits**, which leads to the double-counting of credits across multiple transactions. This results in an underestimation of user debts and incorrect group balances.

## 2. Critical Findings

### 🔴 Bug: Double Application of Advance Payments (Double Counting)

**Severity:** Critical
**Location:** `src/utils/groupBalanceUtils.ts`

**Description:**
The system attempts to apply "Advance Payments" (credits from overpayments) to reduce the calculated debt for subsequent expenses. This logic is implemented in `calculateSplitAmounts` and called within the transaction loop in `calculateGroupBalance`.

However, the `memberBalances` object (which holds the `advancePayments` state) is **not updated** to reflect the consumption of these credits as the loop progresses.

**Scenario:**

1. User A has a **$15 credit** (Advance Payment) with User B.
2. User A incurs **Expense 1** of **$10** owed to User B.
   - Logic checks credit: $15 available.
   - Applies $10 credit. Net Debt for Exp 1: **$0**.
3. User A incurs **Expense 2** of **$10** owed to User B.
   - Logic checks credit: **Still sees $15 available** (because state wasn't updated).
   - Applies $10 credit. Net Debt for Exp 2: **$0**.

**Result:**
User A owes **$0** total, despite having $20 of expenses and only $15 of credit. The correct result should be a debt of **$5**.

**Code Reference:**

```typescript
// src/utils/groupBalanceUtils.ts

// Inside calculateSplitAmounts
if (memberBalance && transaction.paidBy && memberBalance.advancePayments) {
  const advancePayment = memberBalance.advancePayments[transaction.paidBy] || 0;
  // This reads the static advancePayment value repeatedly
  netUnsettled = Math.max(0, netUnsettled - advancePayment);
}
```

## 3. Architecture Analysis

### ✅ Pairwise Debt Enforcement

The implementation correctly enforces pairwise debts.

- The `debtMatrix` tracks direct `Creditor -> Debtor` relationships.
- `generateSettlementSuggestions` iterates strictly through this matrix.
- `recordSettlement` in `EnhancedGroupContext.tsx` validates that settlement amounts do not exceed the direct debt, preventing users from settling debts they don't directly owe.

### ✅ Explicit Settlement Tracking

The system uses an **Explicit Settlement** model where settlement transactions update the `settledAmount` and `isPaid` flags of specific expense transactions (`settlePairwiseDebt`). This provides a robust audit trail and ensures that debts are permanently resolved.

### ⚠️ Hybrid Credit Model Complexity

The system mixes **Explicit Settlements** (modifying past transactions) with **Implicit Credits** (Advance Payments calculated dynamically).

- **Explicit:** When a settlement matches a debt, it updates the `settledAmount` on the expense.
- **Implicit:** When a settlement _exceeds_ a debt, the remainder becomes a floating "Advance Payment".
- This hybrid approach is what necessitates the complex (and currently buggy) logic in `calculateGroupBalance` to apply these floating credits to future expenses.

## 4. Code Quality & Best Practices

- **Rounding:** The use of `roundToTwoDecimals` is consistent and prevents floating-point drift.
- **Immutability:** Transaction updates correctly create new object references.
- **Validation:** Input validation for settlements and expenses is robust (e.g., checking for negative splits, self-settlement).
- **Types:** TypeScript interfaces (`Transaction`, `SplitDetail`, `MemberBalance`) are well-defined.

## 5. Recommendations

### Immediate Fixes

1.  **Fix Credit Consumption Logic:**
    Modify `calculateGroupBalance` to maintain a running state of `remainingAdvancePayments`. When processing expenses, consume this running state instead of reading the static `memberBalances`.

    _Draft Logic:_

    ```typescript
    // Initialize running credits
    const runningAdvancePayments = clone(memberBalances.advancePayments);

    // In transaction loop:
    const availableCredit = runningAdvancePayments[payer][debtor];
    const amountToCover = Math.min(debt, availableCredit);
    runningAdvancePayments[payer][debtor] -= amountToCover;
    // ... apply amountToCover to reduce debt ...
    ```

### Strategic Improvements

2.  **Consolidate Settlement Logic:**
    Consider treating "Overpayments" as **Unallocated Settlements**. Instead of keeping them as floating credits, the system could:
    - Create a "Credit" transaction type.
    - When a new expense is added, automatically "link" it to the existing Credit transaction (similar to how Settlements link to Expenses).
    - This would make all debt calculations purely based on `Amount - SettledAmount`, removing the need for dynamic credit application logic entirely.

3.  **Enhance Test Coverage:**
    Add specific unit tests for the "Overpayment followed by multiple expenses" scenario to prevent regression of the double-counting bug.

## 6. Conclusion

The core "Pairwise" and "No Greedy Simplification" requirements are met. The system is safe from the "multi-hop" issues of the past. However, the **Double Counting Bug** is a critical correctness issue that must be resolved immediately to ensure accurate financial tracking.
