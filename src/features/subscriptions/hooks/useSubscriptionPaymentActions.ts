import {useCallback} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';

import type {SubscriptionContextType} from '../context/subscriptionContextTypes';
import {useFeatureActionGuard} from '@/features/featureControls';
import {logger as appLogger} from '@/services/LoggerService';
import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';
import {parsePaymentAmount} from './subscriptionDetailReadModels';
import {createManualPaymentPayload, isDecimalInput, toDateInput} from './subscriptionDetailUtils';

const logger = appLogger.contextLogger('SubscriptionDetailScreen');

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

type ShowAlert = (config: {title: string; message: string; actions?: AlertAction[]}) => void;

type PaymentOperations = Pick<
  SubscriptionContextType,
  'addSubscriptionPayment' | 'updateSubscriptionPayment' | 'deleteSubscriptionPayment'
>;

interface UseSubscriptionPaymentActionsOptions extends PaymentOperations {
  subscriptionId: string;
  subscription: SubscriptionData | null;
  editingPayment: PaymentRecord | null;
  selectedPayment: PaymentRecord | null;
  paymentAmount: string;
  paymentDate: Date;
  setEditingPayment: Dispatch<SetStateAction<PaymentRecord | null>>;
  setSelectedPayment: Dispatch<SetStateAction<PaymentRecord | null>>;
  setPaymentAmount: Dispatch<SetStateAction<string>>;
  setPaymentDate: Dispatch<SetStateAction<Date>>;
  setShowPaymentSheet: Dispatch<SetStateAction<boolean>>;
  setShowEditSheet: Dispatch<SetStateAction<boolean>>;
  setShowOptionsSheet: Dispatch<SetStateAction<boolean>>;
  setShowPaymentDatePicker: Dispatch<SetStateAction<boolean>>;
  loadSubscriptionData: () => Promise<void>;
  showAlert: ShowAlert;
}

export function useSubscriptionPaymentActions({
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
  addSubscriptionPayment,
  updateSubscriptionPayment,
  deleteSubscriptionPayment,
}: UseSubscriptionPaymentActionsOptions) {
  const paymentAccess = useFeatureActionGuard('subscriptions.recordPayment');
  const handlePaymentAmountChange = useCallback(
    (text: string) => {
      if (isDecimalInput(text)) setPaymentAmount(text);
    },
    [setPaymentAmount],
  );

  const handleMarkAsPaid = useCallback(() => {
    if (!subscription) return;
    setPaymentAmount(String(subscription.amount));
    setPaymentDate(new Date());
    setShowPaymentSheet(true);
  }, [setPaymentAmount, setPaymentDate, setShowPaymentSheet, subscription]);

  const handleConfirmPayment = useCallback(async () => {
    const amount = parsePaymentAmount(paymentAmount);
    if (amount === null) {
      showAlert({
        title: 'Invalid Amount',
        message: 'Please enter a valid payment amount',
        actions: [{text: 'OK'}],
      });
      return;
    }

    try {
      paymentAccess.assertAllowed();
      if (editingPayment) {
        await updateSubscriptionPayment(subscriptionId, editingPayment.id, {
          amount,
          date: toDateInput(paymentDate),
        });
        showAlert({
          title: 'Success',
          message: 'Payment updated successfully',
          actions: [{text: 'OK'}],
        });
        setShowEditSheet(false);
        setEditingPayment(null);
      } else {
        await addSubscriptionPayment(
          subscriptionId,
          createManualPaymentPayload(amount, paymentDate),
        );
        showAlert({
          title: 'Success',
          message: 'Payment recorded successfully',
          actions: [{text: 'OK'}],
        });
        setShowPaymentSheet(false);
      }

      setPaymentAmount('');
      setPaymentDate(new Date());
      await loadSubscriptionData();
    } catch (error) {
      logger.error('Error processing payment', error);
      showAlert({title: 'Error', message: 'Failed to process payment', actions: [{text: 'OK'}]});
    }
  }, [
    addSubscriptionPayment,
    editingPayment,
    loadSubscriptionData,
    paymentAmount,
    paymentDate,
    paymentAccess,
    setEditingPayment,
    setPaymentAmount,
    setPaymentDate,
    setShowEditSheet,
    setShowPaymentSheet,
    showAlert,
    subscriptionId,
    updateSubscriptionPayment,
  ]);

  const handlePaymentDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowPaymentDatePicker(false);
      if (selectedDate) setPaymentDate(selectedDate);
    },
    [setPaymentDate, setShowPaymentDatePicker],
  );

  const handlePaymentAction = useCallback(
    (payment: PaymentRecord) => {
      setSelectedPayment(payment);
      setShowOptionsSheet(true);
    },
    [setSelectedPayment, setShowOptionsSheet],
  );

  const handleEditPayment = useCallback(() => {
    if (!selectedPayment) return;
    setShowOptionsSheet(false);
    setTimeout(() => {
      setEditingPayment(selectedPayment);
      setPaymentAmount(String(selectedPayment.amount));
      setPaymentDate(new Date(selectedPayment.date));
      setShowEditSheet(true);
    }, 300);
  }, [
    selectedPayment,
    setEditingPayment,
    setPaymentAmount,
    setPaymentDate,
    setShowEditSheet,
    setShowOptionsSheet,
  ]);

  const handleDeletePayment = useCallback(() => {
    if (!selectedPayment) return;
    setShowOptionsSheet(false);
    setTimeout(() => {
      showAlert({
        title: 'Delete Payment',
        message:
          'Are you sure you want to delete this payment record? This will not affect the subscription due date.',
        actions: [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  paymentAccess.assertAllowed();
                  await deleteSubscriptionPayment(subscriptionId, selectedPayment.id);
                  await loadSubscriptionData();
                  showAlert({
                    title: 'Success',
                    message: 'Payment deleted successfully',
                    actions: [{text: 'OK'}],
                  });
                } catch (error) {
                  logger.error('Failed to delete subscription payment', error);
                  showAlert({
                    title: 'Error',
                    message: 'Failed to delete payment',
                    actions: [{text: 'OK'}],
                  });
                }
              })();
            },
          },
        ],
      });
    }, 300);
  }, [
    deleteSubscriptionPayment,
    loadSubscriptionData,
    paymentAccess,
    selectedPayment,
    setShowOptionsSheet,
    showAlert,
    subscriptionId,
  ]);

  const resetEditSheet = useCallback(
    (open: boolean) => {
      setShowEditSheet(open);
      if (!open) {
        setEditingPayment(null);
        setPaymentAmount('');
      }
    },
    [setEditingPayment, setPaymentAmount, setShowEditSheet],
  );

  const resetOptionsSheet = useCallback(
    (open: boolean) => {
      setShowOptionsSheet(open);
      if (!open) setSelectedPayment(null);
    },
    [setSelectedPayment, setShowOptionsSheet],
  );

  return {
    setPaymentAmount: handlePaymentAmountChange,
    handleMarkAsPaid,
    handleConfirmPayment,
    handlePaymentDateChange,
    handlePaymentAction,
    handleEditPayment,
    handleDeletePayment,
    resetEditSheet,
    resetOptionsSheet,
  };
}
