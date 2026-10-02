import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';

import {useSettings} from '@/context';
import {useSubscriptionQuery as useSubscription} from '@/context/SubscriptionContext.query';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';
import type {
  SubscriptionDetailAnalyticsViewModel,
  UseSubscriptionDetailScreenResult,
} from './subscriptionDetailTypes';
import {buildSubscriptionAnalytics} from './subscriptionDetailUtils';
import {useSubscriptionActions} from './useSubscriptionActions';
import {useSubscriptionPaymentActions} from './useSubscriptionPaymentActions';

const logger = appLogger.contextLogger('SubscriptionDetailScreen');

export type {
  SubscriptionDetailAnalyticsViewModel,
  SubscriptionPaymentDraft,
  UseSubscriptionDetailScreenResult,
} from './subscriptionDetailTypes';

interface UseSubscriptionDetailScreenOptions {
  subscriptionId: string;
}

export function useSubscriptionDetailScreen({
  subscriptionId,
}: UseSubscriptionDetailScreenOptions): UseSubscriptionDetailScreenResult {
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});
  const {isDarkMode} = useTamaguiTheme();
  const {currency, formatCurrency} = useSettings();
  const subscriptionOperations = useSubscription();
  const {showAlert} = useAlert();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);

  const loadSubscriptionData = useCallback((): Promise<void> => {
    try {
      setLoading(true);
      setSubscription(subscriptionOperations.getSubscriptionById(subscriptionId) ?? null);
    } catch (error) {
      logger.error('Error loading subscription', error, {subscriptionId});
      showAlert({
        title: 'Error',
        message: 'Failed to load subscription details. Please try again.',
        actions: [{text: 'OK', style: 'default'}],
      });
    } finally {
      setLoading(false);
    }
    return Promise.resolve();
  }, [showAlert, subscriptionId, subscriptionOperations]);

  useEffect(() => {
    if (subscriptionId) void loadSubscriptionData();
  }, [loadSubscriptionData, subscriptionId]);

  const analytics = useMemo<SubscriptionDetailAnalyticsViewModel | null>(
    () => (subscription ? buildSubscriptionAnalytics(subscription) : null),
    [subscription],
  );

  const subscriptionActions = useSubscriptionActions({
    subscriptionId,
    subscription,
    currency,
    setSubscription,
    showAlert,
    deleteSubscription: subscriptionOperations.deleteSubscription,
    pauseSubscription: subscriptionOperations.pauseSubscription,
    resumeSubscription: subscriptionOperations.resumeSubscription,
  });

  const paymentActions = useSubscriptionPaymentActions({
    subscriptionId,
    subscription,
    editingPayment,
    selectedPayment,
    paymentAmount,
    paymentDate,
    setEditingPayment,
    setSelectedPayment,
    setPaymentAmount,
    setPaymentDate,
    setShowPaymentSheet,
    setShowEditSheet,
    setShowOptionsSheet,
    setShowPaymentDatePicker,
    loadSubscriptionData,
    showAlert,
    addSubscriptionPayment: subscriptionOperations.addSubscriptionPayment,
    updateSubscriptionPayment: subscriptionOperations.updateSubscriptionPayment,
    deleteSubscriptionPayment: subscriptionOperations.deleteSubscriptionPayment,
  });

  return {
    subscriptionId,
    subscription,
    loading,
    isDarkMode,
    currency,
    formatCurrency,
    headerProps,
    onScroll,
    showPaymentHistory,
    setShowPaymentHistory,
    showPaymentSheet,
    setShowPaymentSheet,
    showEditSheet,
    setShowEditSheet,
    showOptionsSheet,
    setShowOptionsSheet,
    showPaymentDatePicker,
    setShowPaymentDatePicker,
    editingPayment,
    selectedPayment,
    paymentDraft: {amount: paymentAmount, date: paymentDate},
    analytics,
    handleBack: router.back,
    handleEdit: () => router.push(appRoutes.addEditSubscription(subscriptionId)),
    ...subscriptionActions,
    ...paymentActions,
  };
}
