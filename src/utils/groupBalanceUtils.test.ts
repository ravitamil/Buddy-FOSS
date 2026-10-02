import {
  calculateGroupBalance,
  calculateSplitAmounts,
  isGroupSettled,
  PerformanceUtils,
  setDefaultSettlementStrategy,
} from './groupBalanceUtils.optimized';
import {Transaction, GroupMember} from '../types';

jest.mock('../services/LoggerService', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Group Balance Utils', () => {
  // Mock Data Setup
  const members: GroupMember[] = [
    {
      id: 'A',
      name: 'Alice',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'B',
      name: 'Bob',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'C',
      name: 'Charlie',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'D',
      name: 'David',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
  ];

  const members5: GroupMember[] = [
    ...members,
    {
      id: 'E',
      name: 'Eve',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
  ];

  let dateCounter = 0;

  /**
   * Create a test transaction with incrementing dates for chronological ordering.
   */
  const createTransaction = (
    id: string,
    paidBy: string,
    amount: number,
    type: 'expense' | 'payment' = 'expense',
    splitMethod: 'equal' | 'custom' | 'percentage' = 'equal',
    receivedBy?: string,
    customSplits?: Record<string, number>,
    dateOverride?: string,
    splitAmong?: string[],
  ): Transaction => {
    dateCounter += 1;
    return {
      id,
      amount,
      category: 'Test',
      description: `Test Transaction ${id}`,
      date: dateOverride || new Date(2025, 0, 1, 0, 0, dateCounter).toISOString(),
      type,
      paidBy,
      splitMethod,
      splitAmounts: customSplits,
      splitAmong,
      isSettlement: type === 'payment',
      receivedBy,
      settledDebts: [],
    } as unknown as Transaction;
  };

  beforeEach(() => {
    dateCounter = 0;
  });

  // =========================================================================
  // calculateSplitAmounts (synchronous)
  // =========================================================================

  describe('calculateSplitAmounts', () => {
    it('should split equally among all members', () => {
      const transaction = createTransaction('1', 'A', 300);
      const splits = calculateSplitAmounts(transaction, members, 300);

      expect(splits['A']).toBe(75);
      expect(splits['B']).toBe(75);
      expect(splits['C']).toBe(75);
      expect(splits['D']).toBe(75);
    });

    it('should handle custom splits', () => {
      const customSplits = {A: 50, B: 150, C: 100, D: 0};
      const transaction = createTransaction(
        '2',
        'A',
        300,
        'expense',
        'custom',
        undefined,
        customSplits,
      );
      const splits = calculateSplitAmounts(transaction, members, 300);

      expect(splits['A']).toBe(50);
      expect(splits['B']).toBe(150);
      expect(splits['C']).toBe(100);
      expect(splits['D']).toBe(0);
    });
  });

  // =========================================================================
  // calculateGroupBalance (async — optimized version)
  // =========================================================================

  describe('calculateGroupBalance', () => {
    beforeEach(() => {
      setDefaultSettlementStrategy('minimize_transactions');
      PerformanceUtils.clearCache();
    });

    afterEach(() => {
      setDefaultSettlementStrategy('minimize_transactions');
      PerformanceUtils.clearCache();
    });

    it('Scenario 1: Simple Equal Split', () => {
      const t1 = createTransaction('1', 'A', 300);
      const result = calculateGroupBalance([t1], members);

      const alice = result.memberBalances.find((m) => m.memberId === 'A');
      const bob = result.memberBalances.find((m) => m.memberId === 'B');

      expect(alice?.balance).toBe(225);
      expect(bob?.balance).toBe(-75);
    });

    it('Scenario 2: Settlement', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'B', 100, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], members);

      const alice = result.memberBalances.find((m) => m.memberId === 'A');
      const bob = result.memberBalances.find((m) => m.memberId === 'B');

      expect(alice?.balance).toBe(0);
      expect(bob?.balance).toBe(0);
      expect(result.settlementSuggestions.length).toBe(0);
    });

    it('Scenario 3: Multi-hop (A->B->C) - Greedy Minimized', () => {
      const t1 = createTransaction('1', 'B', 100, 'expense', 'custom', undefined, {A: 100});
      const t2 = createTransaction('2', 'C', 100, 'expense', 'custom', undefined, {B: 100});

      const result = calculateGroupBalance([t1, t2], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');

      expect(a?.balance).toBe(-100);
      expect(b?.balance).toBe(0);
      expect(c?.balance).toBe(100);

      const aPaysC = result.settlementSuggestions.find(
        (s) => s.fromMemberId === 'A' && s.toMemberId === 'C',
      );
      expect(result.settlementSuggestions.length).toBe(1);
      expect(aPaysC?.amount).toBe(100);
    });

    it('Scenario 4: Circular Debt (A->B->C->A) - Greedy Minimized', () => {
      const t1 = createTransaction('1', 'B', 100, 'expense', 'custom', undefined, {A: 100});
      const t2 = createTransaction('2', 'C', 100, 'expense', 'custom', undefined, {B: 100});
      const t3 = createTransaction('3', 'A', 100, 'expense', 'custom', undefined, {C: 100});

      const result = calculateGroupBalance([t1, t2, t3], members);

      result.memberBalances.forEach((m) => {
        expect(m.balance).toBe(0);
      });
      expect(result.settlementSuggestions.length).toBe(0);
    });

    it('Scenario 5: Complex Mixed Scenario - Greedy Minimized', () => {
      const t1 = createTransaction('1', 'A', 400);
      const t2 = createTransaction('2', 'B', 200, 'expense', 'custom', undefined, {C: 200});
      const t3 = createTransaction('3', 'D', 100, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2, t3], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');
      const d = result.memberBalances.find((m) => m.memberId === 'D');

      expect(a?.balance).toBe(200);
      expect(b?.balance).toBe(100);
      expect(c?.balance).toBe(-300);
      expect(d?.balance).toBe(0);

      const cPaysA = result.settlementSuggestions.find(
        (s) => s.fromMemberId === 'C' && s.toMemberId === 'A',
      );
      const cPaysB = result.settlementSuggestions.find(
        (s) => s.fromMemberId === 'C' && s.toMemberId === 'B',
      );

      expect(result.settlementSuggestions.length).toBe(2);
      expect(cPaysA?.amount).toBe(200);
      expect(cPaysB?.amount).toBe(100);
    });

    it('Scenario 6: Double Counting Bug Regression (Credit Consumption)', () => {
      const t1 = createTransaction('1', 'A', 15, 'payment', 'equal', 'B');
      const t2 = createTransaction('2', 'B', 10, 'expense', 'custom', undefined, {A: 10});
      const t3 = createTransaction('3', 'B', 10, 'expense', 'custom', undefined, {A: 10});

      const result = calculateGroupBalance([t1, t2, t3], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const debtToB = a?.outstandingDebts.find((d) => d.creditorId === 'B');

      expect(debtToB?.amount).toBe(5);
      expect(a?.balance).toBe(-5);
    });

    // =====================================================================
    // NEW SCENARIOS (7–22)
    // =====================================================================

    it('Scenario 7: Partial settlement — verify remaining debt', () => {
      const t1 = createTransaction('1', 'A', 500, 'expense', 'custom', undefined, {B: 500});
      const t2 = createTransaction('2', 'B', 300, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(200);
      expect(b?.balance).toBe(-200);

      expect(result.settlementSuggestions.length).toBe(1);
      expect(result.settlementSuggestions[0].fromMemberId).toBe('B');
      expect(result.settlementSuggestions[0].toMemberId).toBe('A');
      expect(result.settlementSuggestions[0].amount).toBe(200);
    });

    it('Scenario 8: Partial settlement then new expense', () => {
      const t1 = createTransaction('1', 'A', 500, 'expense', 'custom', undefined, {B: 500});
      const t2 = createTransaction('2', 'B', 300, 'payment', 'equal', 'A');
      const t3 = createTransaction('3', 'A', 200, 'expense', 'custom', undefined, {B: 200});

      const result = calculateGroupBalance([t1, t2, t3], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(400);
      expect(b?.balance).toBe(-400);
    });

    it('Scenario 9: Multiple settlements between same pair', () => {
      const t1 = createTransaction('1', 'A', 200, 'expense', 'custom', undefined, {B: 200});
      const t2 = createTransaction('2', 'B', 50, 'payment', 'equal', 'A');
      const t3 = createTransaction('3', 'B', 50, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2, t3], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(100);
      expect(b?.balance).toBe(-100);
    });

    it('Scenario 10: Overpayment settlement creates credit/advance', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'B', 150, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], members);

      // B overpaid by 50 → no suggestion for B to pay A
      expect(
        result.settlementSuggestions.filter((s) => s.fromMemberId === 'B' && s.toMemberId === 'A')
          .length,
      ).toBe(0);
    });

    it('Scenario 11: Credit consumption across multiple expenses', () => {
      const t1 = createTransaction('1', 'A', 50, 'payment', 'equal', 'B');
      const t2 = createTransaction('2', 'B', 30, 'expense', 'custom', undefined, {A: 30});
      const t3 = createTransaction('3', 'B', 40, 'expense', 'custom', undefined, {A: 40});

      const result = calculateGroupBalance([t1, t2, t3], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const debtToB = a?.outstandingDebts.find((d) => d.creditorId === 'B');

      expect(debtToB?.amount).toBe(20);
      expect(a?.balance).toBe(-20);
    });

    it('Scenario 12: Self-settlement is a no-op (no crash)', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'A', 50, 'payment', 'equal', 'A'); // self-settlement

      const result = calculateGroupBalance([t1, t2], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(100);
      expect(b?.balance).toBe(-100);
    });

    it('Scenario 13: Zero-amount settlement is a no-op', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'B', 0, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(100);
      expect(b?.balance).toBe(-100);
    });

    it('Scenario 14: Negative amount settlement treated as Math.abs', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'B', -50, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], members);

      const b = result.memberBalances.find((m) => m.memberId === 'B');
      expect(b?.balance).toBe(-50);
    });

    it('Scenario 15: Settlement with non-existent member does not crash', () => {
      const t1 = createTransaction('1', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t2 = createTransaction('2', 'B', 50, 'payment', 'equal', 'Z');

      // Should not throw
      const result = calculateGroupBalance([t1, t2], members);

      const b = result.memberBalances.find((m) => m.memberId === 'B');
      expect(b?.balance).toBe(-100);
    });

    it('Scenario 16: Equal split where payer excluded from splitAmong', () => {
      const t1 = createTransaction(
        '1',
        'A',
        300,
        'expense',
        'equal',
        undefined,
        undefined,
        undefined,
        ['B', 'C', 'D'],
      );

      const result = calculateGroupBalance([t1], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');
      const d = result.memberBalances.find((m) => m.memberId === 'D');

      expect(a?.balance).toBe(300);
      expect(b?.balance).toBe(-100);
      expect(c?.balance).toBe(-100);
      expect(d?.balance).toBe(-100);
    });

    it('Scenario 17: Mixed split methods in one group', () => {
      const t1 = createTransaction('1', 'A', 400); // equal split ABCD
      const t2 = createTransaction('2', 'B', 300, 'expense', 'custom', undefined, {A: 100, C: 200});

      const result = calculateGroupBalance([t1, t2], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');
      const d = result.memberBalances.find((m) => m.memberId === 'D');

      expect(a?.balance).toBe(200);
      expect(b?.balance).toBe(200);
      expect(c?.balance).toBe(-300);
      expect(d?.balance).toBe(-100);
    });

    it('Scenario 18: Interleaved settlement-expense-settlement', () => {
      const t1 = createTransaction('1', 'A', 200, 'expense', 'custom', undefined, {B: 200});
      const t2 = createTransaction('2', 'B', 100, 'payment', 'equal', 'A');
      const t3 = createTransaction('3', 'A', 100, 'expense', 'custom', undefined, {B: 100});
      const t4 = createTransaction('4', 'B', 150, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2, t3, t4], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(50);
      expect(b?.balance).toBe(-50);
    });

    it('Scenario 19: Circular debt with partial settlement', () => {
      // Debt matrix: B[A]=100, C[B]=100, A[C]=100
      // Settlement: A pays B 50 → B[A] = 50
      // No netting possible (no mutual debts)
      // A: owed 100 (by C), owes 50 (to B) → +50
      // B: owed 50 (by A), owes 100 (to C) → -50
      // C: owed 100 (by B), owes 100 (to A) → 0
      const t1 = createTransaction('1', 'B', 100, 'expense', 'custom', undefined, {A: 100});
      const t2 = createTransaction('2', 'C', 100, 'expense', 'custom', undefined, {B: 100});
      const t3 = createTransaction('3', 'A', 100, 'expense', 'custom', undefined, {C: 100});
      const t4 = createTransaction('4', 'A', 50, 'payment', 'equal', 'B');

      const result = calculateGroupBalance([t1, t2, t3, t4], members);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');

      expect(a?.balance).toBe(50);
      expect(b?.balance).toBe(-50);
      expect(c?.balance).toBe(0);
    });

    it('Scenario 20: 5-member group with mixed expenses and settlements', () => {
      const t1 = createTransaction('1', 'A', 500, 'expense', 'equal');
      const t2 = createTransaction('2', 'B', 200, 'expense', 'custom', undefined, {C: 100, D: 100});
      const t3 = createTransaction('3', 'E', 100, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2, t3], members5);

      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const c = result.memberBalances.find((m) => m.memberId === 'C');
      const d = result.memberBalances.find((m) => m.memberId === 'D');
      const e = result.memberBalances.find((m) => m.memberId === 'E');

      expect(a?.balance).toBe(300);
      expect(b?.balance).toBe(100);
      expect(c?.balance).toBe(-200);
      expect(d?.balance).toBe(-200);
      expect(e?.balance).toBe(0);
    });

    it('Scenario 21: All members settled — isGroupSettled returns true', () => {
      const twoMembers: GroupMember[] = [
        {
          id: 'A',
          name: 'Alice',
          balance: 0,
          totalPaid: 0,
          totalOwed: 0,
          joinedAt: new Date(),
          isActive: true,
          role: 'member',
        },
        {
          id: 'B',
          name: 'Bob',
          balance: 0,
          totalPaid: 0,
          totalOwed: 0,
          joinedAt: new Date(),
          isActive: true,
          role: 'member',
        },
      ];

      const t1 = createTransaction('1', 'A', 200);
      const t2 = createTransaction('2', 'B', 100, 'payment', 'equal', 'A');

      const result = calculateGroupBalance([t1, t2], twoMembers);
      const alice = result.memberBalances.find((m) => m.memberId === 'A');
      const bob = result.memberBalances.find((m) => m.memberId === 'B');

      expect(alice?.balance).toBe(0);
      expect(bob?.balance).toBe(0);
      expect(result.settlementSuggestions.length).toBe(0);

      const settled = isGroupSettled([t1, t2], twoMembers);
      expect(settled).toBe(true);
    });

    it('Scenario 22: Chronological ordering — same result regardless of input order', () => {
      const t1 = createTransaction(
        '1',
        'A',
        100,
        'expense',
        'custom',
        undefined,
        {B: 100},
        '2025-01-01T10:00:00.000Z',
      );
      const t2 = createTransaction(
        '2',
        'B',
        50,
        'payment',
        'equal',
        'A',
        undefined,
        '2025-01-02T10:00:00.000Z',
      );

      // Pass in REVERSE order
      const resultReversed = calculateGroupBalance([t2, t1], members);
      // Pass in correct order
      const resultCorrect = calculateGroupBalance([t1, t2], members);

      const bReversed = resultReversed.memberBalances.find((m) => m.memberId === 'B');
      const bCorrect = resultCorrect.memberBalances.find((m) => m.memberId === 'B');

      // Both should produce the same result
      expect(bReversed?.balance).toBe(-50);
      expect(bCorrect?.balance).toBe(-50);
      expect(bReversed?.balance).toEqual(bCorrect?.balance);
    });

    it('Scenario 23: Explicit settlement mapping should not be applied twice', () => {
      const explicitExpense: Transaction = {
        id: 'exp-explicit-1',
        amount: 500,
        category: 'Test',
        description: 'Explicit debt with partial settlement materialized',
        date: '2025-01-01T10:00:00.000Z',
        type: 'expense',
        paidBy: 'A',
        splitMethod: 'custom',
        splitDetails: [
          {
            memberId: 'B',
            memberName: 'Bob',
            amount: 500,
            settledAmount: 300,
            isPaid: false,
          },
        ],
        isSettlement: false,
      };

      const settlementRecord: Transaction = {
        id: 'set-explicit-1',
        amount: 300,
        category: 'Settlement',
        description: 'B settles part of debt to A',
        date: '2025-01-02T10:00:00.000Z',
        type: 'income',
        paidBy: 'B',
        receivedBy: 'A',
        isSettlement: true,
        settledDebts: ['exp-explicit-1'],
        settledDebtAmounts: {'exp-explicit-1': 300},
      } as Transaction;

      const result = calculateGroupBalance([explicitExpense, settlementRecord], members);
      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');
      const debtToA = b?.outstandingDebts.find((d) => d.creditorId === 'A');

      expect(debtToA?.amount).toBe(200);
      expect(a?.balance).toBe(200);
      expect(b?.balance).toBe(-200);
    });

    it('Scenario 24: Legacy settlements without explicit mapping still reduce pairwise debt', () => {
      const t1 = createTransaction(
        '1',
        'A',
        120,
        'expense',
        'custom',
        undefined,
        {B: 120},
        '2025-01-01T10:00:00.000Z',
      );
      const t2 = createTransaction(
        '2',
        'B',
        50,
        'payment',
        'equal',
        'A',
        undefined,
        '2025-01-02T10:00:00.000Z',
      );

      const result = calculateGroupBalance([t1, t2], members);
      const a = result.memberBalances.find((m) => m.memberId === 'A');
      const b = result.memberBalances.find((m) => m.memberId === 'B');

      expect(a?.balance).toBe(70);
      expect(b?.balance).toBe(-70);
    });

    it('Scenario 25: Cache key invalidates when settledDebtAmounts changes', () => {
      const expense: Transaction = {
        id: 'exp-cache-1',
        amount: 500,
        category: 'Test',
        description: 'Cache invalidation expense',
        date: '2025-01-01T10:00:00.000Z',
        type: 'expense',
        paidBy: 'A',
        splitMethod: 'custom',
        splitDetails: [
          {
            memberId: 'B',
            memberName: 'Bob',
            amount: 500,
            settledAmount: 0,
            isPaid: false,
          },
        ],
        isSettlement: false,
      };

      const settlementLegacy: Transaction = {
        id: 'set-cache-1',
        amount: 300,
        category: 'Settlement',
        description: 'Legacy settlement',
        date: '2025-01-02T10:00:00.000Z',
        type: 'income',
        paidBy: 'B',
        receivedBy: 'A',
        isSettlement: true,
      } as Transaction;

      const legacyResult = calculateGroupBalance([expense, settlementLegacy], members);
      const legacyDebt = legacyResult.memberBalances
        .find((m) => m.memberId === 'B')
        ?.outstandingDebts.find((d) => d.creditorId === 'A');

      const settlementWithExplicitAmounts: Transaction = {
        ...settlementLegacy,
        settledDebtAmounts: {'exp-cache-1': 300},
        settledDebts: ['exp-cache-1'],
      };

      const explicitResult = calculateGroupBalance(
        [expense, settlementWithExplicitAmounts],
        members,
      );
      const explicitDebt = explicitResult.memberBalances
        .find((m) => m.memberId === 'B')
        ?.outstandingDebts.find((d) => d.creditorId === 'A');

      expect(legacyResult.isCached).toBe(false);
      expect(explicitResult.isCached).toBe(false);
      expect(legacyDebt?.amount).toBe(200);
      expect(explicitDebt?.amount).toBe(500);
    });

    it('Scenario 26: Greedy strategy minimizes hops while pairwise keeps direct legs', () => {
      const t1 = createTransaction('1', 'B', 100, 'expense', 'custom', undefined, {A: 100});
      const t2 = createTransaction('2', 'C', 100, 'expense', 'custom', undefined, {B: 100});

      setDefaultSettlementStrategy('pairwise');
      PerformanceUtils.clearCache();
      const pairwiseResult = calculateGroupBalance([t1, t2], members);

      expect(pairwiseResult.settlementSuggestions).toHaveLength(2);
      expect(
        pairwiseResult.settlementSuggestions.some(
          (s) => s.fromMemberId === 'A' && s.toMemberId === 'B' && s.amount === 100,
        ),
      ).toBe(true);
      expect(
        pairwiseResult.settlementSuggestions.some(
          (s) => s.fromMemberId === 'B' && s.toMemberId === 'C' && s.amount === 100,
        ),
      ).toBe(true);

      setDefaultSettlementStrategy('minimize_transactions');
      PerformanceUtils.clearCache();
      const greedyResult = calculateGroupBalance([t1, t2], members);

      expect(greedyResult.settlementSuggestions).toHaveLength(1);
      expect(greedyResult.settlementSuggestions[0].fromMemberId).toBe('A');
      expect(greedyResult.settlementSuggestions[0].toMemberId).toBe('C');
      expect(greedyResult.settlementSuggestions[0].amount).toBe(100);
    });
  });
});
