/**
 * Test case reproducing exact scenario from screenshots:
 * - Test Group with 4 members: Punith, Ravikumar, Vimal, Pradheep
 * - Tea expense: ₹100 paid by Ravikumar, split equally (₹25 each)
 * - Repayment: Pradheep pays Ravikumar ₹25
 *
 * Expected after repayment:
 * - Punith owes Ravikumar ₹25
 * - Vimal owes Ravikumar ₹25
 * - Pradheep owes Ravikumar ₹0 (settled!)
 * - Ravikumar's balance: +₹50 (not ₹25 as shown in screenshot)
 *
 * Bug in screenshot:
 * - Shows "You owe → Pradheep ₹25" AFTER Pradheep repaid - this is WRONG
 * - Should show Pradheep's debt as cleared
 */

/* eslint-disable development-quality/no-console-statements */

import {calculateGroupBalance} from './groupBalanceUtils.optimized';
import {Transaction, GroupMember} from '../types';

jest.mock('../services/LoggerService', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    serviceLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('Screenshot Issue Reproduction', () => {
  const members: GroupMember[] = [
    {
      id: 'punith',
      name: 'Punith',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'ravi',
      name: 'Ravikumar',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'vimal',
      name: 'Vimal',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
    {
      id: 'pradheep',
      name: 'Pradheep',
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      joinedAt: new Date(),
      isActive: true,
      role: 'member',
    },
  ];

  it('should correctly handle repayment from Pradheep to Ravikumar', () => {
    // Transaction 1: Tea expense - Ravikumar pays ₹100, split equally
    const teaExpense: Transaction = {
      id: 'tea-exp',
      amount: 100,
      category: 'Food',
      description: 'Tea',
      date: new Date('2025-12-08T10:00:00').toISOString(),
      type: 'expense',
      paidBy: 'ravi',
      splitMethod: 'equal',
      isSettlement: false,
      settledDebts: [],
    } as unknown as Transaction;

    // Transaction 2: Settlement - Pradheep repays Ravikumar ₹25
    const settlement: Transaction = {
      id: 'settlement-1',
      amount: 25,
      category: 'Settlement',
      description: 'Repayment from Pradheep to You',
      date: new Date('2025-12-08T11:00:00').toISOString(),
      type: 'income',
      paidBy: 'pradheep', // Pradheep is paying
      receivedBy: ['ravi'], // Ravikumar receives
      isSettlement: true,
      settledDebts: [],
    } as unknown as Transaction;

    const result = calculateGroupBalance([teaExpense, settlement], members);

    // Verify member balances
    const ravi = result.memberBalances.find((m) => m.memberId === 'ravi');
    const pradheep = result.memberBalances.find((m) => m.memberId === 'pradheep');
    const punith = result.memberBalances.find((m) => m.memberId === 'punith');
    const vimal = result.memberBalances.find((m) => m.memberId === 'vimal');

    console.log('=== Member Balances ===');
    console.log(
      'Ravikumar:',
      ravi?.balance,
      '(totalPaid:',
      ravi?.totalPaid,
      ', totalOwed:',
      ravi?.totalOwed,
      ')',
    );
    console.log('Pradheep:', pradheep?.balance);
    console.log('Punith:', punith?.balance);
    console.log('Vimal:', vimal?.balance);

    console.log('\n=== Debt Matrix ===');
    console.log(JSON.stringify(result.debtMatrix, null, 2));

    console.log('\n=== Outstanding Debts for Ravikumar ===');
    console.log('Owed to Ravi:', ravi?.creditedAmounts);
    console.log('Ravi owes:', ravi?.outstandingDebts);

    console.log('\n=== Settlement Suggestions ===');
    console.log(result.settlementSuggestions);

    // After tea expense: Each owes ₹25 to Ravi
    // After settlement: Pradheep's debt cleared
    //
    // Expected balances:
    // - Ravi: +50 (owed 75 total, received 25 from Pradheep, still owed 50 by Punith + Vimal)
    // - Pradheep: 0 (owed 25, paid 25)
    // - Punith: -25 (owes 25)
    // - Vimal: -25 (owes 25)

    expect(ravi?.balance).toBe(50); // Should be +50, not +25
    expect(pradheep?.balance).toBe(0); // Should be settled
    expect(punith?.balance).toBe(-25);
    expect(vimal?.balance).toBe(-25);

    // Check debt matrix - Pradheep should NOT owe Ravi anymore
    const pradheepOwesToRavi = result.debtMatrix['ravi']?.['pradheep'] || 0;
    expect(pradheepOwesToRavi).toBe(0);

    // CRITICAL: Ravi should NOT owe Pradheep (this is the bug in the screenshot)
    const raviOwesToPradheep = result.debtMatrix['pradheep']?.['ravi'] || 0;
    expect(raviOwesToPradheep).toBe(0);

    // Punith and Vimal should still owe Ravi
    const punithOwesToRavi = result.debtMatrix['ravi']?.['punith'] || 0;
    const vimalOwesToRavi = result.debtMatrix['ravi']?.['vimal'] || 0;
    expect(punithOwesToRavi).toBe(25);
    expect(vimalOwesToRavi).toBe(25);

    // Settlement suggestions should only show Punith and Vimal paying Ravi
    expect(result.settlementSuggestions.length).toBe(2);
    const shouldHavePunithToRavi = result.settlementSuggestions.some(
      (s) => s.fromMemberId === 'punith' && s.toMemberId === 'ravi',
    );
    const shouldHaveVimalToRavi = result.settlementSuggestions.some(
      (s) => s.fromMemberId === 'vimal' && s.toMemberId === 'ravi',
    );
    expect(shouldHavePunithToRavi).toBe(true);
    expect(shouldHaveVimalToRavi).toBe(true);

    // Should NOT have any suggestion involving Pradheep
    const shouldNotHavePradheep = result.settlementSuggestions.every(
      (s) => s.fromMemberId !== 'pradheep' && s.toMemberId !== 'pradheep',
    );
    expect(shouldNotHavePradheep).toBe(true);
  });
});
