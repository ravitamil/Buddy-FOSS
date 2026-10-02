import {loanDatabaseService} from '@/services/LoanDatabaseService';
import type {LoanData} from './types';

export const loanService = {
  getAll: (userId: string) => loanDatabaseService.getLoans(userId),
  saveMany: (userId: string, loans: LoanData[]) => loanDatabaseService.saveLoans(userId, loans),
  create: (userId: string, loan: LoanData) => loanDatabaseService.saveLoans(userId, [loan]),
  update: (userId: string, loan: LoanData) => loanDatabaseService.saveLoans(userId, [loan]),
};
