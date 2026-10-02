import {
  buildSplitDetailEntries,
  getFirstValidationError,
  getSafeCategoryId,
  parseSplitDetails,
} from './addGroupTransactionSubmitModels';

describe('addGroupTransactionSubmitModels', () => {
  it('parses only the selected split source', () => {
    expect(
      parseSplitDetails('percentage', {
        custom: {a: '10'},
        percentage: {a: '75.5'},
        shares: {a: '2'},
      }),
    ).toEqual({a: 75.5});
  });

  it('uses the fallback category for missing or uncategorized values', () => {
    expect(getSafeCategoryId('')).not.toBe('');
    expect(getSafeCategoryId('uncategorized')).toBe(getSafeCategoryId(''));
    expect(getSafeCategoryId('food')).toBe('food');
  });

  it('returns the first string validation error', () => {
    expect(getFirstValidationError({amount: '', description: 'Required'})).toBe('Required');
  });

  it('builds persisted split details with payer settlement metadata', () => {
    const result = buildSplitDetailEntries({
      members: [
        {id: 'payer', name: 'Alex'},
        {id: 'other', name: 'Sam'},
      ],
      paidBy: 'payer',
      splitAmounts: {payer: 5, other: 5},
      totalAmount: 10,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(result[0]).toMatchObject({memberId: 'payer', isPaid: true, settledAmount: 5});
    expect(result[1]).toMatchObject({memberId: 'other', isPaid: false, settledAmount: 0});
  });
});
