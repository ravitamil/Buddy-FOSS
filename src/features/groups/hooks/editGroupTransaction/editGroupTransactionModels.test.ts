import type {Transaction} from '@/types';
import {
  createEditGroupTransactionFormState,
  createEditGroupTransactionSplitDetails,
} from './editGroupTransactionModels';

describe('editGroupTransactionModels', () => {
  it('creates form state from an existing percentage split transaction', () => {
    const transaction = {
      description: 'Dinner',
      amount: -120,
      paidBy: 'member-1',
      categoryId: 'food',
      splitMethod: 'percentage',
      receiptUrl: 'receipt-url',
      splitDetails: [
        {memberId: 'member-1', amount: 72, percentage: 60},
        {memberId: 'member-2', amount: 48, percentage: 40},
      ],
    } as Transaction;

    expect(
      createEditGroupTransactionFormState({
        transaction,
        defaultCategoryId: 'food',
      }),
    ).toMatchObject({
      description: 'Dinner',
      amount: '120',
      paidBy: 'member-1',
      selectedCategoryId: 'food',
      splitType: 'percentage',
      receiptUri: 'receipt-url',
      percentageAmounts: {
        'member-1': '60',
        'member-2': '40',
      },
    });
  });

  it('builds numeric split details from the active split mode', () => {
    expect(
      createEditGroupTransactionSplitDetails({
        splitType: 'custom',
        customAmounts: {'member-1': '12.50', 'member-2': ''},
        percentageAmounts: {'member-1': '70'},
        sharesAmounts: {'member-1': '2'},
      }),
    ).toEqual({
      'member-1': 12.5,
      'member-2': 0,
    });
  });
});
