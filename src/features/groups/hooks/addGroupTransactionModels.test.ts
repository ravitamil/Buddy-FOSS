import {
  getAvatarColor,
  getDefaultCategoryId,
  isGroupTransactionFormValid,
} from './addGroupTransactionModels';

describe('addGroupTransactionModels', () => {
  it('selects Other as the default expense category', () => {
    expect(
      getDefaultCategoryId([
        {id: 'food', name: 'Food'},
        {id: 'other', name: 'Other'},
      ]),
    ).toBe('other');
  });

  it('validates expense and payment requirements', () => {
    expect(
      isGroupTransactionFormValid({
        amount: '12',
        description: 'Lunch',
        paidBy: 'payer',
        receivedBy: [],
        transactionType: 'expense',
      }),
    ).toBe(true);
    expect(
      isGroupTransactionFormValid({
        amount: '12',
        description: '',
        paidBy: 'payer',
        receivedBy: ['receiver'],
        transactionType: 'payment',
      }),
    ).toBe(true);
  });

  it('generates stable avatar colors', () => {
    expect(getAvatarColor('Alex')).toBe(getAvatarColor('Alex'));
  });
});
