import {transactionDatabaseService} from '@/services/TransactionDatabaseService';
import type {Transaction} from './types';

export const transactionService = {
  getAll: (userId: string) => transactionDatabaseService.getTransactions(userId),
  saveMany: (userId: string, transactions: Transaction[]) =>
    transactionDatabaseService.saveTransactions(userId, transactions),
  create: (userId: string, transaction: Transaction) =>
    transactionDatabaseService.saveTransactions(userId, [transaction]),
  update: (userId: string, transaction: Transaction) =>
    transactionDatabaseService.saveTransactions(userId, [transaction]),
  delete: (userId: string, id: string) => transactionDatabaseService.deleteTransaction(userId, id),
};
