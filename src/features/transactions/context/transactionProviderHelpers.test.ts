import type {Transaction} from '@/types';
import {
  createTransactionExport,
  createTransactionsWithIds,
  getTransactionError,
  prependOptimisticTransaction,
  removeCachedTransaction,
  updateCachedTransaction,
} from './transactionProviderHelpers';

const transaction = {
  id: 'transaction-1',
  amount: -25,
  category: 'food',
  description: 'Lunch',
  date: '2026-06-20',
  type: 'expense',
} satisfies Transaction;

describe('transactionProviderHelpers', () => {
  it('uses the first Error message and ignores non-Error values', () => {
    expect(getTransactionError(undefined, 'failed', new Error('query failed'))).toBe(
      'query failed',
    );
    expect(getTransactionError(null, {message: 'ignored'})).toBeNull();
  });

  it('applies optimistic cache operations without mutating the source', () => {
    const source = [transaction];
    const optimistic = {...transaction, id: 'temp-1'};

    expect(prependOptimisticTransaction(source, optimistic)).toEqual([optimistic, transaction]);
    expect(updateCachedTransaction(source, transaction.id, {description: 'Dinner'})).toEqual([
      {...transaction, description: 'Dinner'},
    ]);
    expect(removeCachedTransaction(source, transaction.id)).toEqual([]);
    expect(source).toEqual([transaction]);
  });

  it('assigns generated ids to transaction drafts', () => {
    const ids = ['generated-1', 'generated-2'];
    const drafts: Omit<Transaction, 'id'>[] = [
      {
        amount: -25,
        category: 'food',
        description: 'One',
        date: '2026-06-20',
        type: 'expense',
      },
      {
        amount: -25,
        category: 'food',
        description: 'Two',
        date: '2026-06-20',
        type: 'expense',
      },
    ];

    expect(createTransactionsWithIds(drafts, () => ids.shift() ?? 'missing')).toEqual([
      {...drafts[0], id: 'generated-1'},
      {...drafts[1], id: 'generated-2'},
    ]);
  });

  it('creates a detached export snapshot with the existing version', () => {
    const exportDate = new Date('2026-06-21T00:00:00.000Z');
    const source = [transaction];
    const result = createTransactionExport(source, exportDate);

    expect(result).toEqual({
      transactions: [transaction],
      exportDate,
      version: '1.0.0',
    });
    expect(result.transactions).not.toBe(source);
  });
});
