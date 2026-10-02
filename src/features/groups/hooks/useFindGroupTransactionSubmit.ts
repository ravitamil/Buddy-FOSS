import {useCallback} from 'react';

import type {GroupContextType} from '@/features/groups/context/groupContextTypes';
import type {EnhancedGroup} from '@/features/groups/types';
import {logger as appLogger} from '@/services/LoggerService';
import type {MemberDebt} from '@/types';
import type {calculateGroupBalance} from '@/utils/groupBalanceUtils.optimized';
import {validateExpense, validatePayment, validateSplits} from '@/utils/validation/schemas';
import type {GroupSplitType, GroupTransactionType} from '../types/addGroupTransaction';
import {
  buildSettlementNote,
  buildSplitDetails,
  getFirstError,
  getSelectedDebtIds,
} from './findGroupAndAddTransactionUtils';

interface Args {
  selectedGroup: EnhancedGroup | null;
  amount: string;
  description: string;
  transactionType: GroupTransactionType;
  paidBy: string;
  receivedBy: string[];
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  selectedDebts: Record<string, boolean>;
  splitAmounts: Record<string, number>;
  groupBalance: ReturnType<typeof calculateGroupBalance> | null;
  enhancedGroups: GroupContextType;
  settingsFormatCurrencyExact: (amount: number) => string;
  getMemberDebts: () => MemberDebt[];
  navigateBackSafely: () => void;
  showAlert: (options: {title: string; message: string; actions: Array<{text: string}>}) => void;
}

export const useFindGroupTransactionSubmit = ({
  selectedGroup,
  amount,
  description,
  transactionType,
  paidBy,
  receivedBy,
  splitType,
  customAmounts,
  selectedDebts,
  splitAmounts,
  groupBalance,
  enhancedGroups,
  settingsFormatCurrencyExact,
  getMemberDebts,
  navigateBackSafely,
  showAlert,
}: Args) =>
  useCallback(async () => {
    appLogger.debug('FindGroupAndAddTransactionScreen: submit started');
    if (!selectedGroup) {
      showAlert({
        title: 'No Group Selected',
        message: 'Please select a group first',
        actions: [{text: 'OK'}],
      });
      return;
    }

    if (transactionType === 'expense') {
      const totalAmount = Number.parseFloat(amount);
      const details =
        splitType === 'custom'
          ? Object.fromEntries(
              Object.entries(customAmounts).map(([id, value]) => [
                id,
                Number.parseFloat(value) || 0,
              ]),
            )
          : {};
      const expenseValidation = validateExpense({
        description,
        amount,
        splitMethod: splitType,
        splitDetails: details,
        membersCount: selectedGroup.members.length,
      });
      if (!expenseValidation.valid) {
        showAlert({
          title: 'Invalid Fields',
          message: getFirstError(expenseValidation.errors),
          actions: [{text: 'OK'}],
        });
        return;
      }
      if (splitType !== 'equal') {
        const splitValidation = validateSplits(
          splitType,
          totalAmount,
          details,
          selectedGroup.members.length,
        );
        if (!splitValidation.valid) {
          showAlert({
            title: 'Invalid Split',
            message: getFirstError(splitValidation.errors),
            actions: [{text: 'OK'}],
          });
          return;
        }
      }
    } else {
      const paymentValidation = validatePayment({description, amount, paidBy, receivedBy});
      if (!paymentValidation.valid) {
        showAlert({
          title: 'Invalid Fields',
          message: getFirstError(paymentValidation.errors),
          actions: [{text: 'OK'}],
        });
        return;
      }
    }

    if (transactionType === 'payment' && receivedBy.length !== 1) {
      showAlert({
        title: receivedBy.length === 0 ? 'No Recipient' : 'Select One Recipient',
        message:
          receivedBy.length === 0
            ? 'Please select one member to settle with'
            : 'Pairwise settlements support only one recipient per transaction.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    const totalAmount = Number.parseFloat(amount);
    if (Number.isNaN(totalAmount) || totalAmount <= 0) {
      showAlert({
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than 0',
        actions: [{text: 'OK'}],
      });
      return;
    }

    try {
      if (transactionType === 'expense') {
        await enhancedGroups.addGroupExpense(selectedGroup.id, {
          amount: totalAmount,
          description: description.trim(),
          paidBy,
          category: description.trim(),
          splitMethod: splitType,
          splitDetails: buildSplitDetails({selectedGroup, splitAmounts, totalAmount}),
          notes: 'Expense added via mobile app',
        });
        appLogger.debug('FindGroupAndAddTransactionScreen: transaction added successfully');
        navigateBackSafely();
        return;
      }

      const toMemberId = receivedBy[0];
      const pairwiseDebt = getMemberDebts().find((debt) => debt.creditorId === toMemberId);
      const maxSettleAmount = pairwiseDebt?.amount ?? 0;
      if (maxSettleAmount <= 0.01) {
        showAlert({
          title: 'No Direct Debt',
          message:
            'You do not owe this member directly. Select a member you owe to record a settlement.',
          actions: [{text: 'OK'}],
        });
        return;
      }
      if (totalAmount > maxSettleAmount + 0.01) {
        showAlert({
          title: 'Amount Exceeds Debt',
          message: `You can settle up to ${settingsFormatCurrencyExact(maxSettleAmount)} with this member.`,
          actions: [{text: 'OK'}],
        });
        return;
      }

      await enhancedGroups.recordSettlement(selectedGroup.id, {
        fromMemberId: paidBy,
        toMemberId,
        amount: totalAmount,
        description: buildSettlementNote({
          description,
          selectedDebtTxIds: getSelectedDebtIds({groupBalance, paidBy, selectedDebts}),
          selectedGroup,
        }),
      });
      appLogger.debug('Payment validation passed and transaction recorded successfully');
      navigateBackSafely();
    } catch (error) {
      appLogger.error('FindGroupAndAddTransactionScreen: error adding transaction', error);
      showAlert({
        title: 'Error',
        message: 'Failed to add transaction',
        actions: [{text: 'OK'}],
      });
    }
  }, [
    amount,
    customAmounts,
    description,
    enhancedGroups,
    getMemberDebts,
    groupBalance,
    navigateBackSafely,
    paidBy,
    receivedBy,
    selectedDebts,
    selectedGroup,
    settingsFormatCurrencyExact,
    showAlert,
    splitAmounts,
    splitType,
    transactionType,
  ]);
