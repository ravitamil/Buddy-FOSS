import type {Category} from '@/types';
import {
  buildAddTransactionReadModel,
  buildTransactionInput,
  filterTransactionCategories,
  getRouteTransactionType,
  sanitizeAmountInput,
} from './addTransactionScreenModelUtils';

const categories = [
  {id: 'food', name: 'Food', type: 'expense'},
  {id: 'salary', name: 'Salary', type: 'income'},
] as Category[];

describe('addTransactionScreenModelUtils', () => {
  it('normalizes route types and filters matching categories', () => {
    expect(getRouteTransactionType('income')).toBe('income');
    expect(getRouteTransactionType('unexpected')).toBe('expense');
    expect(filterTransactionCategories(categories, 'expense')).toEqual([categories[0]]);
  });

  it.each([
    ['', ''],
    ['$1,234.567', '1234.56'],
    ['1.2.3', '1.23'],
    ['abc', ''],
  ])('sanitizes amount input %s to %s', (input, expected) => {
    expect(sanitizeAmountInput(input)).toBe(expected);
  });

  it('builds add and edit presentation without changing save eligibility', () => {
    expect(
      buildAddTransactionReadModel({
        amount: '42.50',
        isEditMode: false,
        isIncome: false,
        isSaving: false,
      }),
    ).toEqual({
      title: 'Add Expense',
      subtitle: 'Record a new expense transaction',
      canSave: true,
    });

    expect(
      buildAddTransactionReadModel({
        amount: '0',
        isEditMode: true,
        isIncome: true,
        isSaving: false,
      }),
    ).toEqual({
      title: 'Edit Income',
      subtitle: 'Update your income transaction',
      canSave: false,
    });
  });

  it('builds signed transaction input with fallback description and category', () => {
    expect(
      buildTransactionInput({
        parsedAmount: 25,
        description: ' ',
        selectedCategoryName: undefined,
        fallbackCategoryName: 'Food',
        transactionType: 'expense',
        selectedDate: new Date('2026-06-21T10:00:00.000Z'),
      }),
    ).toEqual({
      amount: -25,
      description: 'Expense transaction',
      category: 'Food',
      type: 'expense',
      date: '2026-06-21T10:00:00.000Z',
    });
  });
});
