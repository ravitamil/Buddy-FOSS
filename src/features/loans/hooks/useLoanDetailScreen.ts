import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';
import {useLoanQuery as useLoan} from '@/context/LoanContext.query';
import {useSettings} from '@/context/SettingsContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import type {LoanData, PaymentRecord} from '@/types/loan.types';
import {formatDate} from '@/features/loans/calculations';
import type {
  LoanDetailMetricsViewModel,
  LoanInstallmentDetail,
  UseLoanDetailScreenResult,
} from './loanDetailTypes';
import {
  buildInstallmentDetail,
  buildLoanDetailMetrics,
  createAdditionalPayment,
  createManualPayment,
  findCurrentMonthPayment,
  mapEnhancedLoanToLoanData,
} from './loanDetailUtils';
import {createEmptyAdditionalPayment, parseAdditionalPaymentAmount} from './loanDetailPaymentUtils';

const logger = appLogger.contextLogger('LoanDetailScreen');

export type {
  AdditionalPaymentState,
  LoanDetailMetricsViewModel,
  LoanInstallmentDetail,
  UseLoanDetailScreenResult,
} from './loanDetailTypes';

interface UseLoanDetailScreenOptions {
  loanId: string;
}

export function useLoanDetailScreen({
  loanId,
}: UseLoanDetailScreenOptions): UseLoanDetailScreenResult {
  const {loans, getLoanById, recordLoanPayment} = useLoan();
  const {formatCurrency} = useSettings();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});
  const [loan, setLoan] = useState<LoanData | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<LoanInstallmentDetail | null>(
    null,
  );
  const [additionalPayment, setAdditionalPayment] = useState(createEmptyAdditionalPayment());
  const [hasMarkedPaid, setHasMarkedPaid] = useState(false);
  const [buttonText, setButtonText] = useState('Mark Paid');

  const loadLoan = useCallback(() => {
    try {
      const currentLoan = getLoanById(loanId);
      if (currentLoan) {
        setLoan(mapEnhancedLoanToLoanData(currentLoan));
        setLoadingTimeout(false);
        return;
      }

      const foundLoan = loans.items.find((l) => l.id === loanId);
      if (foundLoan) {
        setLoan(mapEnhancedLoanToLoanData(foundLoan));
        setLoadingTimeout(false);
        return;
      }

      logger.warn('Loan not found in context', {loanId});
    } catch (error) {
      logger.error('Error loading loan', error, {loanId});
      showAlert({
        title: 'Error',
        message: 'Failed to load loan details. Please try again.',
        actions: [{text: 'OK', style: 'default'}],
      });
    }
  }, [getLoanById, loanId, loans.items, showAlert]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan, loans.items]);

  useEffect(() => {
    if (!loan || !loan.paymentHistory) return;

    const currentMonthPayment = findCurrentMonthPayment(loan.paymentHistory);

    setHasMarkedPaid(Boolean(currentMonthPayment));
    setButtonText(currentMonthPayment ? "It's Done" : 'Mark Paid');
  }, [loan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loan && loanId) {
        logger.warn('Loading timeout reached', {loanId});
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loan, loanId]);

  const metrics = useMemo<LoanDetailMetricsViewModel | null>(
    () => (loan ? buildLoanDetailMetrics(loan) : null),
    [loan],
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleRetry = useCallback(() => {
    logger.debug('Retry button clicked', {attempt: retryCount + 1});
    setLoadingTimeout(false);
    setRetryCount((prev) => prev + 1);
    loadLoan();
  }, [loadLoan, retryCount]);

  const handleEditLoan = useCallback(() => {
    router.push(appRoutes.addEditLoan(loanId));
  }, [loanId]);

  const handleDeleteLoan = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteLoan = useCallback(async () => {
    if (!loan) return;

    try {
      await loans.delete(loan.id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      logger.error('Error deleting loan', error);
      showAlert({
        title: 'Error',
        message: 'Failed to delete loan. Please try again.',
        actions: [{text: 'OK', style: 'default'}],
      });
    }
  }, [loan, loans, showAlert]);

  const cancelDeleteLoan = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const recordPayment = useCallback(
    async (payment: Omit<PaymentRecord, 'id'>) => {
      await recordLoanPayment(loanId, payment);
      loadLoan();
    },
    [loadLoan, loanId, recordLoanPayment],
  );

  const handleRecordPayment = useCallback(() => {
    if (!loan) return;

    if (loan.autoPayEnabled) {
      showAlert({
        title: 'Auto-Track Enabled',
        message:
          'This loan has auto-tracking enabled. Payments are automatically tracked on EMI dates.',
        actions: [{text: 'OK', style: 'default'}],
      });
      return;
    }

    if (hasMarkedPaid) {
      showAlert({
        title: 'Additional Payment',
        message: 'You already paid for this tenure. Did you pay additionally and want to track it?',
        actions: [
          {text: 'No', style: 'cancel'},
          {
            text: 'Yes',
            onPress: () => setAdditionalPayment({...createEmptyAdditionalPayment(), visible: true}),
          },
        ],
      });
      return;
    }

    showAlert({
      title: 'Record Payment',
      message: 'Record your EMI payment for this month.',
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Mark as Paid',
          onPress: () => {
            void (async () => {
              try {
                const paymentAmount = loan.emiAmount || 0;
                await recordPayment(createManualPayment(paymentAmount));
                setHasMarkedPaid(true);
                setButtonText("It's Done");
                showAlert({
                  title: 'Success',
                  message: 'Payment recorded successfully',
                  actions: [{text: 'OK', style: 'default'}],
                });
              } catch (error) {
                logger.error('Error recording payment', error);
                showAlert({
                  title: 'Error',
                  message: 'Failed to record payment',
                  actions: [{text: 'OK', style: 'default'}],
                });
              }
            })();
          },
        },
      ],
    });
  }, [hasMarkedPaid, loan, recordPayment, showAlert]);

  const submitAdditionalPayment = useCallback(async () => {
    const parsedPayment = parseAdditionalPaymentAmount(additionalPayment.amount);
    if (parsedPayment.error || parsedPayment.amount === null) {
      setAdditionalPayment((prev) => ({...prev, error: parsedPayment.error}));
      return;
    }

    try {
      await recordPayment(createAdditionalPayment(parsedPayment.amount));
      setAdditionalPayment(createEmptyAdditionalPayment());
      showAlert({
        title: 'Success',
        message: 'Additional payment recorded successfully',
        actions: [{text: 'OK', style: 'default'}],
      });
    } catch (error) {
      logger.error('Error recording additional payment', error);
      showAlert({
        title: 'Error',
        message: 'Failed to record additional payment',
        actions: [{text: 'OK', style: 'default'}],
      });
    }
  }, [additionalPayment.amount, recordPayment, showAlert]);

  const handleInstallmentPress = useCallback(
    (installmentNumber: number) => {
      if (!loan) return;

      setSelectedInstallment(buildInstallmentDetail(loan, installmentNumber));
      setShowInstallmentModal(true);
    },
    [loan],
  );

  const setAdditionalPaymentAmount = useCallback((amount: string) => {
    setAdditionalPayment((prev) => ({...prev, amount, error: null}));
  }, []);

  const closeAdditionalPaymentModal = useCallback(() => {
    setAdditionalPayment(createEmptyAdditionalPayment());
  }, []);

  const closeInstallmentModal = useCallback(() => {
    setShowInstallmentModal(false);
  }, []);

  const showPrepaymentComingSoon = useCallback(() => {
    showAlert({
      title: 'Prepayment',
      message: 'Prepayment feature coming soon!',
      actions: [{text: 'OK', style: 'default'}],
    });
  }, [showAlert]);

  return {
    loan,
    loanId,
    availableLoanCount: loans.items.length,
    loadingTimeout,
    showPaymentHistory,
    showDeleteModal,
    selectedInstallment,
    showInstallmentModal,
    additionalPayment,
    buttonText,
    hasMarkedPaid,
    metrics,
    formatCurrency,
    formatDate,
    onScroll,
    headerProps,
    handleGoBack,
    handleRetry,
    handleEditLoan,
    handleDeleteLoan,
    confirmDeleteLoan,
    cancelDeleteLoan,
    handleRecordPayment,
    handleInstallmentPress,
    setShowPaymentHistory,
    closeInstallmentModal,
    setAdditionalPaymentAmount,
    closeAdditionalPaymentModal,
    submitAdditionalPayment,
    showPrepaymentComingSoon,
  };
}
