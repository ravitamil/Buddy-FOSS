import {useCallback, useMemo} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import {queryKeys} from '@/lib/query-keys';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';
import {loanDatabaseService} from '@/services/LoanDatabaseService';
import type {CRUDOperations} from '@/types/context-foundation';
import type {AmortizationEntry, PaymentRecord} from '@/types/loan.types';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';
import {
  calculateEMIValue,
  generateLoanAmortizationSchedule,
  normalizeLoanDates,
  recalculateLoanTerms,
  serializeLoanDates,
} from '../calculations';
import type {EnhancedLoan, LoanContextType} from './loanContextTypes';

const logger = appLogger.contextLogger('LoanContext');

export const useLoanProviderValue = (): LoanContextType => {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.uid ?? '';
  const createAccess = useFeatureActionGuard('loans.create');
  const updateAccess = useFeatureActionGuard('loans.update');
  const deleteAccess = useFeatureActionGuard('loans.delete');
  const paymentAccess = useFeatureActionGuard('loans.recordPayment');
  const feature = useFeatureStatus('loans');

  const {
    data: loans = [],
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery<EnhancedLoan[], Error>({
    queryKey: queryKeys.loans.list(userId),
    queryFn: async () => {
      logger.info('Fetching loans from Supabase...');
      const storedLoans = await loanDatabaseService.getLoans(userId);
      return storedLoans.map(normalizeLoanDates);
    },
    enabled: Boolean(userId && feature.canRead),
  });

  const addLoanMutation = useMutation<EnhancedLoan, Error, Omit<EnhancedLoan, 'id'>>({
    mutationFn: async (loan: Omit<EnhancedLoan, 'id'>): Promise<EnhancedLoan> => {
      createAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      const newLoan = recalculateLoanTerms({
        ...loan,
        id: Crypto.randomUUID(),
      });
      await loanDatabaseService.saveLoans(userId, [serializeLoanDates(newLoan)]);
      logger.info('Loan added successfully', {loanId: newLoan.id});
      return newLoan;
    },
    onSuccess: (newLoan) => {
      if (userId) {
        queryClient.setQueryData(
          queryKeys.loans.list(userId),
          (old: EnhancedLoan[] | undefined) => [...(old ?? []), newLoan],
        );
      }
    },
  });

  const updateLoanMutation = useMutation<
    EnhancedLoan,
    Error,
    {id: string; updates: Partial<EnhancedLoan>}
  >({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EnhancedLoan>;
    }): Promise<EnhancedLoan> => {
      updateAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      const currentLoan = loans.find((loan) => loan.id === id);
      if (!currentLoan) throw new Error('Loan not found');
      const updatedLoan = recalculateLoanTerms({
        ...currentLoan,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      });
      await loanDatabaseService.saveLoans(userId, [serializeLoanDates(updatedLoan)]);
      logger.info('Loan updated successfully', {loanId: id});
      return updatedLoan;
    },
    onSuccess: (updatedLoan) => {
      if (userId) {
        queryClient.setQueryData(queryKeys.loans.list(userId), (old: EnhancedLoan[] | undefined) =>
          (old ?? []).map((loan) => (loan.id === updatedLoan.id ? updatedLoan : loan)),
        );
      }
    },
  });

  const deleteLoanMutation = useMutation<string, Error, string>({
    mutationFn: async (id: string): Promise<string> => {
      deleteAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      await loanDatabaseService.deleteLoan(userId, id);
      logger.info('Loan deleted successfully', {loanId: id});
      return id;
    },
    onSuccess: (deletedId) => {
      if (userId) {
        queryClient.setQueryData(queryKeys.loans.list(userId), (old: EnhancedLoan[] | undefined) =>
          (old ?? []).filter((loan) => loan.id !== deletedId),
        );
      }
    },
  });

  const getLoanById = useCallback(
    (id: string): EnhancedLoan | null => loans.find((loan) => loan.id === id) || null,
    [loans],
  );

  const recordLoanPayment = useCallback(
    async (loanId: string, payment: Omit<PaymentRecord, 'id'>): Promise<void> => {
      paymentAccess.assertAllowed();
      if (!userId) throw new Error('Authentication required');
      if (!getLoanById(loanId)) throw new Error('Loan not found');

      const res = await loanDatabaseService.recordPaymentAtomic(userId, {
        loanId,
        amount: payment.amount,
        principalPaid: payment.principalPaid,
        interestPaid: payment.interestPaid,
        paymentMethod: payment.method,
        paymentDate: payment.date,
        note: payment.note,
        operationKey: payment.method.startsWith('auto')
          ? `loan:${loanId}:${payment.date}`
          : Crypto.randomUUID(),
      });

      if (res.nextEmiDate) {
        queryClient.setQueryData(queryKeys.loans.list(userId), (old: EnhancedLoan[] | undefined) =>
          (old ?? []).map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  outstandingBalance: res.remainingAmount,
                  currentOutstanding: res.remainingAmount,
                  status: res.status as EnhancedLoan['status'],
                  nextEmiDate: new Date(res.nextEmiDate!),
                }
              : l,
          ),
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.loans.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.transactions.list(userId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.wallets.list(userId)}),
      ]);

      logger.info('Loan payment recorded', {loanId, paymentAmount: payment.amount});
    },
    [getLoanById, paymentAccess, queryClient, userId],
  );

  const calculateEMI = useCallback(
    (principal: number, annualRate: number, tenureMonths: number): number =>
      calculateEMIValue(principal, annualRate, tenureMonths),
    [],
  );

  const generateAmortizationSchedule = useCallback(
    (loan: EnhancedLoan): AmortizationEntry[] => generateLoanAmortizationSchedule(loan),
    [],
  );

  const getTotalLoanDebt = useCallback(
    (): number =>
      loans
        .filter((loan) => loan.status === 'ACTIVE')
        .reduce((total, loan) => total + loan.outstandingBalance, 0),
    [loans],
  );

  const getTotalMonthlyEMI = useCallback(
    (): number =>
      loans
        .filter((loan) => loan.status === 'ACTIVE')
        .reduce((total, loan) => total + loan.emiAmount, 0),
    [loans],
  );

  const getActiveLoans = useCallback(
    (): EnhancedLoan[] => loans.filter((loan) => loan.status === 'ACTIVE'),
    [loans],
  );

  const getClosedLoans = useCallback(
    (): EnhancedLoan[] => loans.filter((loan) => loan.status === 'CLOSED'),
    [loans],
  );

  const getLoansByType = useCallback(
    (type: EnhancedLoan['loanType']): EnhancedLoan[] =>
      loans.filter((loan) => loan.loanType === type),
    [loans],
  );

  const calculateInterestSavings = useCallback(
    (loanId: string, extraPayment: number): number => {
      const loan = getLoanById(loanId);
      if (!loan) return 0;

      const monthlyRate = loan.interestRate / (12 * 100);
      const interestSaved = extraPayment * monthlyRate * (loan.tenure - loan.paymentHistory.length);
      return Math.round(interestSaved * 100) / 100;
    },
    [getLoanById],
  );

  const refreshLoans = useCallback(async (): Promise<void> => {
    if (userId) {
      await queryClient.invalidateQueries({queryKey: queryKeys.loans.list(userId)});
    }
  }, [userId, queryClient]);

  const normalizedLoans = useMemo<EnhancedLoan[]>(
    () => loans.map((loan) => normalizeLoanDates(loan)),
    [loans],
  );

  const loanOperations = useMemo<CRUDOperations<EnhancedLoan>>(
    () => ({
      items: normalizedLoans,
      getById: (id: string) => normalizedLoans.find((loan) => loan.id === id) ?? null,
      add: addLoanMutation.mutateAsync,
      update: async (id: string, updates: Partial<EnhancedLoan>) => {
        await updateLoanMutation.mutateAsync({id, updates});
      },
      delete: async (id: string) => {
        await deleteLoanMutation.mutateAsync(id);
      },
      addMany: async (items: Omit<EnhancedLoan, 'id'>[]) =>
        Promise.all(items.map((item) => addLoanMutation.mutateAsync(item))),
      deleteMany: async (ids: string[]) => {
        await Promise.all(ids.map((id) => deleteLoanMutation.mutateAsync(id)));
      },
      isLoading: isQueryLoading,
      error: queryError?.message || null,
    }),
    [
      normalizedLoans,
      addLoanMutation,
      updateLoanMutation,
      deleteLoanMutation,
      isQueryLoading,
      queryError,
    ],
  );

  return useMemo<LoanContextType>(
    () => ({
      addLoan: addLoanMutation.mutateAsync,
      updateLoan: async (id: string, updates: Partial<EnhancedLoan>) => {
        return updateLoanMutation.mutateAsync({id, updates});
      },
      deleteLoan: async (id: string) => {
        await deleteLoanMutation.mutateAsync(id);
      },
      loans: loanOperations,
      isLoading: isQueryLoading,
      error: queryError?.message || null,
      lastSyncTime: null,
      getLoanById,
      recordLoanPayment,
      calculateEMI,
      generateAmortizationSchedule,
      getTotalLoanDebt,
      getTotalMonthlyEMI,
      getActiveLoans,
      getClosedLoans,
      getLoansByType,
      calculateInterestSavings,
      refreshLoans,
    }),
    [
      loans,
      isQueryLoading,
      queryError,
      getLoanById,
      recordLoanPayment,
      calculateEMI,
      generateAmortizationSchedule,
      getTotalLoanDebt,
      getTotalMonthlyEMI,
      getActiveLoans,
      getClosedLoans,
      getLoansByType,
      calculateInterestSavings,
      refreshLoans,
      loanOperations,
      addLoanMutation,
      updateLoanMutation,
      deleteLoanMutation,
    ],
  );
};
