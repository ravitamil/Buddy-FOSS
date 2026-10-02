import {useCallback} from 'react';
import {InteractionManager} from 'react-native';
import type {ImperativeRouter} from 'expo-router';
import type {GroupContextType} from '@/features/groups/context/groupContextTypes';
import {logger as appLogger} from '@/services/LoggerService';
import type {MemberDebt} from '@/types';
import {findCurrentUserMember} from '@/utils/userUtils';
import {validateExpense, validatePayment, validateSplits} from '@/utils/validation/schemas';
import type {
  AddGroupTransactionCategory,
  GroupSplitType,
  GroupTransactionType,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';
import {
  buildSplitDetailEntries,
  getFirstValidationError,
  getSafeCategoryId,
  parseSplitDetails,
} from './addGroupTransactionSubmitModels';
import {uploadGroupReceipt} from './addGroupTransactionReceiptUpload';
import {validateSettlementRecipients} from './groupTransactionValidation';

const logger = appLogger.contextLogger('AddGroupTransactionSubmit');

type ShowAlert = (options: {
  title: string;
  message: string;
  actions: Array<{text: string}>;
}) => void;

interface UseAddGroupTransactionSubmitArgs {
  group: GroupWithAvatarMembers | null;
  amount: string;
  description: string;
  transactionType: GroupTransactionType;
  paidBy: string;
  receivedBy: string[];
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  selectedCategoryId: string;
  receiptUri: string | null;
  receiptName?: string;
  receiptMimeType?: string;
  expenseCategories: AddGroupTransactionCategory[];
  currency: string;
  groupCurrency?: string;
  userFirstName?: string;
  router: ImperativeRouter;
  enhancedGroups: GroupContextType;
  settingsFormatCurrencyExact: (amount: number) => string;
  getUserDisplayName: () => string;
  getMemberDebts: () => MemberDebt[];
  calculateSplitAmounts: () => Record<string, number>;
  setLoading: (loading: boolean) => void;
  showAlert: ShowAlert;
}

export const useAddGroupTransactionSubmit = ({
  group,
  amount,
  description,
  transactionType,
  paidBy,
  receivedBy,
  splitType,
  customAmounts,
  percentageAmounts,
  sharesAmounts,
  selectedCategoryId,
  receiptUri,
  receiptName,
  receiptMimeType,
  expenseCategories,
  currency,
  groupCurrency,
  userFirstName,
  router,
  enhancedGroups,
  settingsFormatCurrencyExact,
  getUserDisplayName,
  getMemberDebts,
  calculateSplitAmounts,
  setLoading,
  showAlert,
}: UseAddGroupTransactionSubmitArgs) =>
  useCallback(() => {
    void (async () => {
      if (!group) {
        return;
      }

      logger.debug('Submit started', {
        description: description.trim(),
        amount,
        transactionType,
        paidBy,
        receivedBy,
      });
      const totalAmount = Number.parseFloat(amount);

      if (transactionType === 'expense') {
        const splitDetails = parseSplitDetails(splitType, {
          custom: customAmounts,
          percentage: percentageAmounts,
          shares: sharesAmounts,
        });

        const expenseValidation = validateExpense({
          description,
          amount,
          categoryId: selectedCategoryId,
          splitMethod: splitType,
          splitDetails,
          membersCount: group.members.length,
        });
        if (!expenseValidation.valid) {
          showAlert({
            title: 'Invalid Fields',
            message: getFirstValidationError(expenseValidation.errors),
            actions: [{text: 'OK'}],
          });
          return;
        }
        if (splitType !== 'equal') {
          const splitValidation = validateSplits(
            splitType,
            totalAmount || 0,
            splitDetails,
            group.members.length,
          );
          if (!splitValidation.valid) {
            showAlert({
              title: 'Invalid Split',
              message: getFirstValidationError(splitValidation.errors),
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
            message: getFirstValidationError(paymentValidation.errors),
            actions: [{text: 'OK'}],
          });
          return;
        }
      }

      const recipientError =
        transactionType === 'payment' ? validateSettlementRecipients(receivedBy) : null;
      if (recipientError) {
        showAlert({title: 'No Recipient', message: recipientError, actions: [{text: 'OK'}]});
        return;
      }
      if (transactionType === 'payment' && receivedBy.length > 1) {
        showAlert({
          title: 'Select One Recipient',
          message: 'Pairwise settlements support only one recipient per transaction.',
          actions: [{text: 'OK'}],
        });
        return;
      }
      if (Number.isNaN(totalAmount) || totalAmount <= 0) {
        showAlert({
          title: 'Invalid Amount',
          message: 'Please enter a valid amount greater than 0',
          actions: [{text: 'OK'}],
        });
        return;
      }

      setLoading(true);
      try {
        const currentMember = findCurrentUserMember(
          group.members,
          userFirstName,
          undefined,
          getUserDisplayName,
        );
        const splitAmounts = transactionType === 'expense' ? calculateSplitAmounts() : {};
        const safeCategoryId = getSafeCategoryId(selectedCategoryId);
        let uploadedReceiptUrl: string | undefined = undefined;
        logger.debug('Processing transaction', {
          type: transactionType,
          amount: totalAmount,
          safeCategoryId,
        });
        if (transactionType === 'expense' && receiptUri) {
          try {
            const url = await uploadGroupReceipt(
              group.id,
              receiptUri,
              receiptName,
              receiptMimeType,
            );
            if (url) uploadedReceiptUrl = url;
          } catch (error) {
            logger.error('Failed to upload receipt', error);
            showAlert({
              title: 'Upload Failed',
              message: 'Could not upload receipt or document.',
              actions: [{text: 'OK'}],
            });
            return;
          }
        }

        if (transactionType === 'expense') {
          await enhancedGroups.addGroupExpense(group.id, {
            amount: totalAmount,
            description: description.trim(),
            paidBy: paidBy || currentMember?.id || '',
            category:
              expenseCategories.find((category) => category.id === selectedCategoryId)?.name ||
              description.trim(),
            categoryId: selectedCategoryId,
            splitMethod: splitType,
            splitDetails: buildSplitDetailEntries({
              members: group.members,
              paidBy: paidBy || currentMember?.id || '',
              splitAmounts,
              totalAmount,
              splitType,
              sharesAmounts,
              percentageAmounts,
            }),
            receiptUrl: uploadedReceiptUrl,
            receiptUrls: uploadedReceiptUrl ? [uploadedReceiptUrl] : [],
            notes: 'Expense added via mobile app',
            transactionCurrency: groupCurrency || currency || 'USD',
            fxRateApplied: 1,
          });
        } else if (receivedBy.length > 0) {
          const toMemberId = receivedBy[0];
          const pairwiseDebt = getMemberDebts().find((debt) => debt.creditorId === toMemberId);
          const maxSettleAmount = pairwiseDebt ? pairwiseDebt.amount : 0;

          if (maxSettleAmount <= 0.01) {
            showAlert({
              title: 'No Direct Debt',
              message:
                'You do not owe any money directly to this member. You can only settle direct debts.',
              actions: [{text: 'OK'}],
            });
            return;
          }
          if (totalAmount > maxSettleAmount + 0.01) {
            showAlert({
              title: 'Amount Exceeds Debt',
              message: `You only owe ${settingsFormatCurrencyExact(maxSettleAmount)} to this member. You cannot settle more than you owe directly.`,
              actions: [{text: 'OK'}],
            });
            return;
          }

          await enhancedGroups.recordSettlement(group.id, {
            fromMemberId: paidBy || currentMember?.id || '',
            toMemberId,
            amount: totalAmount,
            description: description.trim() || 'Payment',
          });
        }

        InteractionManager.runAfterInteractions(() => {
          try {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(`/groups/${group.id}`);
            }
          } catch {
            router.back();
          }
        });
      } catch (error) {
        logger.error('Error adding transaction', error);
        showAlert({title: 'Error', message: 'Failed to add transaction', actions: [{text: 'OK'}]});
      } finally {
        setLoading(false);
      }
    })();
  }, [
    amount,
    calculateSplitAmounts,
    currency,
    customAmounts,
    description,
    enhancedGroups,
    expenseCategories,
    getMemberDebts,
    getUserDisplayName,
    group,
    groupCurrency,
    paidBy,
    percentageAmounts,
    receiptMimeType,
    receiptName,
    receiptUri,
    receivedBy,
    router,
    selectedCategoryId,
    settingsFormatCurrencyExact,
    sharesAmounts,
    showAlert,
    splitType,
    transactionType,
    userFirstName,
  ]);
