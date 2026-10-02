import {LoanData, PaymentRecord} from '../types/loan.types';
import {Transaction} from '../types';
import {logger as appLogger} from './LoggerService';
import {readJson, writeJson} from './storage/secureJsonStorage';
import {STORAGE_KEYS} from './storage/storageKeys';
import {transactionDatabaseService} from './TransactionDatabaseService';
import {walletDatabaseService} from './WalletDatabaseService';

const logger = appLogger.contextLogger('LoanDatabaseService');

/**
 * Loan Database Service
 * Handles offline loan persistence and calculations locally
 */
export const loanDatabaseService = {
  async saveLoans(_userId: string, loans: LoanData[]): Promise<void> {
    try {
      if (loans.length === 0) return;

      const existing = await readJson<LoanData[]>(STORAGE_KEYS.LOANS, []);
      const map = new Map<string, LoanData>(existing.map((l) => [l.id, l]));

      for (const loan of loans) {
        map.set(loan.id, {
          ...loan,
          updatedAt: new Date().toISOString(),
        });
      }

      await writeJson(STORAGE_KEYS.LOANS, Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving loans:', error);
      throw error;
    }
  },

  async getLoans(_userId: string): Promise<LoanData[]> {
    try {
      const loans = await readJson<LoanData[]>(STORAGE_KEYS.LOANS, []);
      return loans.map((loan) => ({
        ...loan,
        amortizationSchedule: loan.amortizationSchedule || [],
        paymentHistory: loan.paymentHistory || [],
      }));
    } catch (error) {
      logger.error('Error getting loans:', error);
      return [];
    }
  },

  async recordPaymentAtomic(
    userId: string,
    params: {
      loanId: string;
      amount: number;
      principalPaid: number;
      interestPaid: number;
      walletId?: string;
      paymentMethod?: string;
      note?: string;
      paymentDate?: string;
      operationKey: string;
    },
  ): Promise<{
    loanId: string;
    remainingAmount: number;
    status: string;
    paymentId: string;
    transactionId: string;
    nextEmiDate?: string;
  }> {
    try {
      const loans = await readJson<LoanData[]>(STORAGE_KEYS.LOANS, []);
      const loanIndex = loans.findIndex((l) => l.id === params.loanId);

      if (loanIndex === -1) {
        throw new Error('Loan not found');
      }

      const loan = loans[loanIndex];
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const paymentDate = params.paymentDate || new Date().toISOString();

      const newPayment: PaymentRecord = {
        id: paymentId,
        amount: params.amount,
        date: paymentDate,
        principalPaid: params.principalPaid,
        interestPaid: params.interestPaid,
        status: 'PAID',
        method: params.paymentMethod || 'bank',
        note: params.note,
        createdAt: new Date().toISOString(),
      };

      const remainingAmount = Math.max(0, loan.outstandingBalance - params.principalPaid);
      const newStatus = remainingAmount <= 0 ? 'CLOSED' : loan.status;

      const updatedLoan: LoanData = {
        ...loan,
        outstandingBalance: remainingAmount,
        status: newStatus,
        paymentHistory: [...(loan.paymentHistory || []), newPayment],
        updatedAt: new Date().toISOString(),
      };

      loans[loanIndex] = updatedLoan;
      await writeJson(STORAGE_KEYS.LOANS, loans);

      // Create transaction for this loan payment
      const newTx: Transaction = {
        id: transactionId,
        amount: params.amount,
        description: `Loan Payment: ${loan.name}`,
        date: paymentDate,
        type: 'expense',
        category: 'Loans',
        loanId: loan.id,
        walletId: params.walletId,
        lastModified: new Date(),
      };
      await transactionDatabaseService.saveTransactions(userId, [newTx]);

      // Deduct from wallet if walletId provided
      if (params.walletId) {
        const wallets = await walletDatabaseService.getWallets(userId);
        const targetWallet = wallets.find((w) => w.id === params.walletId);
        if (targetWallet) {
          await walletDatabaseService.updateWallet(userId, targetWallet.id, {
            balance: Number(targetWallet.balance) - params.amount,
          });
        }
      }

      return {
        loanId: loan.id,
        remainingAmount,
        status: newStatus,
        paymentId,
        transactionId,
        nextEmiDate: loan.nextEmiDate,
      };
    } catch (error) {
      logger.error('Failed to record atomic loan payment:', error);
      throw error;
    }
  },

  async deleteLoan(_userId: string, loanId: string): Promise<void> {
    try {
      const existing = await readJson<LoanData[]>(STORAGE_KEYS.LOANS, []);
      const remaining = existing.filter((l) => l.id !== loanId);
      await writeJson(STORAGE_KEYS.LOANS, remaining);
    } catch (error) {
      logger.error('Failed to delete loan:', error);
      throw error;
    }
  },
};
