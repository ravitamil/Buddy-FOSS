import React, {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {useIsRestoring} from '@tanstack/react-query';
import {useLoanQuery as useLoan} from '@/context/LoanContext.query';
import {useSubscriptionQuery} from '@/context/SubscriptionContext.query';
import {serializeLoanDates} from '@/features/loans/calculations';
import AutoTransactionService from '@/services/AutoTransactionService';
import {logger as appLogger} from '@/services/LoggerService';
import {useFeatureAction} from '@/features/featureControls';
import type {PaymentRecord} from '@/types/loan.types';
import {useAuth} from '@/context/AuthContext';
import {useUser} from '@/context/UserContext';

const logger = appLogger.contextLogger('AutoTransactionInitializer');

const isLoanPaymentInput = (payment: unknown): payment is Omit<PaymentRecord, 'id'> => {
  if (typeof payment !== 'object' || payment === null) {
    return false;
  }

  const candidate = payment as Partial<PaymentRecord>;
  return (
    typeof candidate.amount === 'number' &&
    typeof candidate.date === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.method === 'string' &&
    typeof candidate.principalPaid === 'number' &&
    typeof candidate.interestPaid === 'number' &&
    typeof candidate.createdAt === 'string'
  );
};

/**
 * Initializes the AutoTransactionService with necessary context hooks.
 * This component should be rendered inside AppProviders.
 */
export const AutoTransactionInitializer: React.FC = () => {
  const {isAuthenticated, user} = useAuth();
  const {profile} = useUser();
  const isRestoring = useIsRestoring();
  const {loans, recordLoanPayment} = useLoan();
  const {subscriptions, addSubscriptionPayment} = useSubscriptionQuery();
  const subscriptionAutoGenerate = useFeatureAction('subscriptions.autoGenerate');
  const loanAutoRecordPayment = useFeatureAction('loans.autoRecordPayment');
  const initializedForUser = useRef<string | null>(null);
  const userId = user?.uid ?? null;

  useEffect(() => {
    AutoTransactionService.setPaymentSources(subscriptions, loans.items.map(serializeLoanDates));
  }, [loans.items, subscriptions]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      initializedForUser.current = null;
      return;
    }
    if (isRestoring || !profile?.isOnboardingComplete) return;
    if (initializedForUser.current === userId) return;
    if (!subscriptionAutoGenerate.isAllowed && !loanAutoRecordPayment.isAllowed) {
      logger.info('Skipping AutoTransactionService initialization; feature controls disabled it');
      initializedForUser.current = userId;
      return;
    }

    const abortController = new AbortController();
    const initializationTask = InteractionManager.runAfterInteractions(() => {
      if (initializedForUser.current === userId) return;
      initializedForUser.current = userId;
      logger.debug('Wiring up AutoTransactionService...');

      AutoTransactionService.setRecordLoanPaymentFunction(async (loanId, payment) => {
        if (!isLoanPaymentInput(payment)) {
          logger.warn('Ignoring invalid auto loan payment payload', {loanId});
          return;
        }

        await recordLoanPayment(loanId, payment);
      });

      AutoTransactionService.setRecordSubscriptionPaymentFunction(
        async (subscriptionId, payment) => {
          await addSubscriptionPayment(subscriptionId, payment);
        },
      );

      void AutoTransactionService.initialize(abortController.signal).catch((err) => {
        logger.error('Failed to initialize AutoTransactionService', err);
      });
    });

    return () => {
      initializationTask.cancel();
      abortController.abort();
    };
  }, [
    addSubscriptionPayment,
    isAuthenticated,
    isRestoring,
    loanAutoRecordPayment.isAllowed,
    profile,
    recordLoanPayment,
    subscriptionAutoGenerate.isAllowed,
    userId,
  ]);

  return null;
};
