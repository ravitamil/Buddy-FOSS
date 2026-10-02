import {BottomSheet, BottomSheetAction} from '@ravitamil/buddy-ui/overlays';
import {Button, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

import {FormField} from '@ravitamil/buddy-ui/FormField';

import {FONT_FAMILIES} from '@/utils/fonts';
import type {UseSubscriptionDetailScreenResult} from '../hooks/useSubscriptionDetailScreen';

interface SubscriptionPaymentSheetsProps {
  screen: UseSubscriptionDetailScreenResult;
}

function currencySymbol(currency: string): string {
  if (currency === 'INR') return '₹';
  if (currency === 'EUR') return '€';
  return '$';
}

interface PaymentFormSheetProps {
  screen: UseSubscriptionDetailScreenResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  buttonText: string;
  buttonTone: 'primary' | 'success';
}

function PaymentFormSheet({
  screen,
  open,
  onOpenChange,
  title,
  buttonText,
  buttonTone,
}: PaymentFormSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      defaultPosition={0}
      moveOnKeyboardChange
      scrollable
      title={title}
      description="Record the payment amount and date for this subscription"
      footer={
        <Button
          size="large"
          variant={buttonTone}
          onPress={() => {
            void screen.handleConfirmPayment();
          }}>
          {buttonText}
        </Button>
      }>
      <VStack gap="$4">
        <VStack alignItems="center" justifyContent="center" paddingVertical="$4">
          <Text variant="caption" color="$textSecondary" marginBottom="$2">
            Payment Amount
          </Text>
          <FormField
            value={screen.paymentDraft.amount}
            onChangeText={screen.setPaymentAmount}
            keyboardType="numeric"
            size="large"
            style={{fontSize: 40, fontFamily: FONT_FAMILIES.BOLD, textAlign: 'center'}}
            placeholder="0.00"
            containerStyle={{alignSelf: 'stretch'}}
            leftIcon={
              <Text fontSize="$8" color="$textSecondary" fontWeight="bold" paddingRight="$2">
                {currencySymbol(screen.currency)}
              </Text>
            }
          />
        </VStack>
        <VStack gap="$2">
          <Text variant="caption" color="$textSecondary" weight="medium">
            Payment Date
          </Text>
          <BottomSheetAction
            label={screen.paymentDraft.date.toLocaleDateString()}
            description="Change payment date"
            icon="calendar"
            showChevron={false}
            onPress={() => screen.setShowPaymentDatePicker(true)}
          />
        </VStack>
        {screen.showPaymentDatePicker ? (
          <DateTimePicker
            value={screen.paymentDraft.date}
            mode="date"
            display="default"
            onChange={screen.handlePaymentDateChange}
            maximumDate={new Date()}
          />
        ) : null}
        {screen.subscription ? (
          <VStack backgroundColor="$elementBackground" padding="$3" borderRadius="$3">
            <Text variant="body2" color="$textSecondary">
              Recording payment for cycle due:{' '}
              <Text weight="bold" color="$text">
                {new Date(screen.subscription.nextBilling).toLocaleDateString()}
              </Text>
            </Text>
          </VStack>
        ) : null}
      </VStack>
    </BottomSheet>
  );
}

export function SubscriptionPaymentSheets({screen}: SubscriptionPaymentSheetsProps) {
  return (
    <>
      <PaymentFormSheet
        screen={screen}
        open={screen.showPaymentSheet}
        onOpenChange={screen.setShowPaymentSheet}
        title="Confirm Payment"
        buttonText="Confirm Payment"
        buttonTone="success"
      />
      <PaymentFormSheet
        screen={screen}
        open={screen.showEditSheet}
        onOpenChange={screen.resetEditSheet}
        title="Edit Payment"
        buttonText="Update Payment"
        buttonTone="primary"
      />
      <BottomSheet
        open={screen.showOptionsSheet}
        onOpenChange={screen.resetOptionsSheet}
        snapPoints={[35]}
        defaultPosition={0}
        title="Payment Options"
        description={
          screen.selectedPayment
            ? `${screen.currency} ${screen.selectedPayment.amount} on ${new Date(
                screen.selectedPayment.date,
              ).toLocaleDateString()}`
            : 'Choose how to manage this payment'
        }>
        <BottomSheetAction
          label="Edit payment"
          description="Change the amount or payment date"
          icon="create-outline"
          onPress={screen.handleEditPayment}
        />
        <BottomSheetAction
          label="Delete payment"
          description="Remove this payment record"
          icon="trash-outline"
          tone="destructive"
          onPress={screen.handleDeletePayment}
        />
      </BottomSheet>
    </>
  );
}
