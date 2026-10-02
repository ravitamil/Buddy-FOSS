import type {Transaction} from '@/types';
import {saveAddTransaction} from './addTransactionActions';

const baseInput = {
  parsedAmount: 25,
  description: 'Lunch',
  selectedCategoryName: 'Food',
  selectedCategoryId: 'food-id',
  fallbackCategoryName: undefined,
  transactionType: 'expense' as const,
  selectedDate: new Date('2026-06-21T10:00:00.000Z'),
  isIncome: false,
  isRecurring: false,
  recurrenceFrequency: 'monthly' as const,
  recurrenceEndDate: null,
};

const createDependencies = () => ({
  addTransaction: jest.fn<Promise<void>, [Omit<Transaction, 'id'>]>().mockResolvedValue(undefined),
  updateTransaction: jest
    .fn<Promise<void>, [string, Partial<Transaction>]>()
    .mockResolvedValue(undefined),
  createRecurringTransaction: jest.fn().mockResolvedValue({
    id: 'template-1',
    nextOccurrenceDate: '2026-07-21T10:00:00.000Z',
  }),
  formatCurrency: jest.fn((amount: number) => `$${amount.toFixed(2)}`),
  showAlert: jest.fn(),
  goBack: jest.fn(),
  logError: jest.fn(),
});

describe('addTransactionActions', () => {
  it('adds an expense and reports success', async () => {
    const dependencies = createDependencies();

    await saveAddTransaction({...baseInput, isEditMode: false}, dependencies);

    expect(dependencies.addTransaction).toHaveBeenCalledWith({
      amount: -25,
      description: 'Lunch',
      category: 'Food',
      categoryId: 'food-id',
      type: 'expense',
      date: '2026-06-21T10:00:00.000Z',
      isRecurring: false,
    });
    expect(dependencies.showAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Success',
        message: 'Expense of $25.00 has been added successfully!',
      }),
    );
  });

  it('updates an existing transaction', async () => {
    const dependencies = createDependencies();

    await saveAddTransaction(
      {
        ...baseInput,
        transactionType: 'income',
        isIncome: true,
        isEditMode: true,
        editId: 'transaction-1',
      },
      dependencies,
    );

    expect(dependencies.updateTransaction).toHaveBeenCalledWith(
      'transaction-1',
      expect.objectContaining({
        amount: 25,
        type: 'income',
      }),
    );
    const updates = dependencies.updateTransaction.mock.calls[0]?.[1];
    expect(updates?.lastModified).toBeInstanceOf(Date);
    expect(dependencies.addTransaction).not.toHaveBeenCalled();
  });

  it('adds recurrence metadata from the created template', async () => {
    const dependencies = createDependencies();

    await saveAddTransaction(
      {
        ...baseInput,
        isEditMode: false,
        isRecurring: true,
        recurrenceEndDate: new Date('2026-12-31T00:00:00.000Z'),
      },
      dependencies,
    );

    expect(dependencies.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        isRecurring: true,
        parentRecurringId: 'template-1',
        recurrenceFrequency: 'monthly',
        recurrenceEndDate: '2026-12-31T00:00:00.000Z',
        nextOccurrenceDate: '2026-07-21T10:00:00.000Z',
      }),
    );
  });
});
