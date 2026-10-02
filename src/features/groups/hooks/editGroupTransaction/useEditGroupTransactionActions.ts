import {useCallback} from 'react';
import * as ImagePicker from 'expo-image-picker';
import type {ImperativeRouter} from 'expo-router';

import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import {SupabaseStorageService} from '@/services/SupabaseStorageService';
import {validateExpense, validateSplits} from '@/utils/validation/schemas';
import type {Transaction} from '@/types';
import type {GroupContextType} from '../../context/groupContextTypes';
import type {GroupSplitType, GroupWithAvatarMembers} from '../../types/addGroupTransaction';
import {createEditGroupTransactionSplitDetails} from './editGroupTransactionModels';

const logger = appLogger.contextLogger('EditGroupTransactionScreen');

interface UseEditGroupTransactionActionsParams {
  group: GroupWithAvatarMembers | null;
  existingTransaction?: Transaction;
  transactionId: string;
  amount: string;
  description: string;
  selectedCategoryId: string;
  paidBy: string;
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  receiptUri: string | null;
  currentUserMember?: {id: string};
  currency?: string;
  groupCurrency?: string;
  expenseCategories: Array<{id: string; name: string}>;
  router: ImperativeRouter;
  editGroupExpense: GroupContextType['editGroupExpense'];
  showAlert: ReturnType<typeof useAlert>['showAlert'];
  showToast: (toast: {title: string; type: 'success' | 'error'}) => void;
  setLoading: (value: boolean) => void;
  setReceiptUri: (value: string | null) => void;
  calculateSplitAmounts: () => Record<string, number>;
}

export const useEditGroupTransactionActions = ({
  group,
  existingTransaction,
  transactionId,
  amount,
  description,
  selectedCategoryId,
  paidBy,
  splitType,
  customAmounts,
  percentageAmounts,
  sharesAmounts,
  receiptUri,
  currentUserMember,
  currency,
  groupCurrency,
  expenseCategories,
  router,
  editGroupExpense,
  showAlert,
  showToast,
  setLoading,
  setReceiptUri,
  calculateSplitAmounts,
}: UseEditGroupTransactionActionsParams) => {
  const handleSubmit = useCallback(() => {
    void (async () => {
      if (!group || !existingTransaction) {
        return;
      }

      logger.debug('Submit started with form data', {
        description: description.trim(),
        amount,
        paidBy,
        splitType,
        groupId: group.id,
        transactionId,
      });

      const splitDetails = createEditGroupTransactionSplitDetails({
        splitType,
        customAmounts,
        percentageAmounts,
        sharesAmounts,
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
        const firstError = Object.values(expenseValidation.errors).find(Boolean) as string;
        showAlert({title: 'Invalid Fields', message: firstError, actions: [{text: 'OK'}]});
        return;
      }

      if (splitType !== 'equal') {
        const splitValidation = validateSplits(
          splitType,
          Number.parseFloat(amount) || 0,
          splitDetails,
          group.members.length,
        );
        if (!splitValidation.valid) {
          const firstError = Object.values(splitValidation.errors).find(Boolean) as string;
          showAlert({title: 'Invalid Split', message: firstError, actions: [{text: 'OK'}]});
          return;
        }
      }

      setLoading(true);

      const totalAmount = Number.parseFloat(amount);
      if (Number.isNaN(totalAmount) || totalAmount <= 0) {
        logger.debug('Validation failed - invalid amount', {amount});
        showAlert({
          title: 'Invalid Amount',
          message: 'Please enter a valid amount greater than 0',
          actions: [{text: 'OK'}],
        });
        setLoading(false);
        return;
      }

      try {
        const baseCurrency = groupCurrency || currency || 'USD';
        const splitAmounts = calculateSplitAmounts();
        const uploadedReceiptUrl = await syncReceiptUrl({
          groupId: group.id,
          transactionId,
          receiptUri,
          previousReceiptUrl: existingTransaction.receiptUrl,
          showAlert,
          setLoading,
        });

        if (uploadedReceiptUrl === false) {
          return;
        }

        await editGroupExpense(group.id, transactionId, {
          amount: totalAmount,
          description: description.trim(),
          paidBy: paidBy || currentUserMember?.id || '',
          category:
            expenseCategories.find((category) => category.id === selectedCategoryId)?.name ||
            description.trim(),
          categoryId: selectedCategoryId,
          splitMethod: splitType,
          splitDetails: Object.entries(splitAmounts).map(([memberId, splitAmount]) => {
            const member = group.members.find((item) => item.id === memberId);
            const isPaid = memberId === (paidBy || currentUserMember?.id);
            return {
              memberId,
              memberName: member?.name || 'Unknown',
              amount: splitAmount,
              percentage: (splitAmount / totalAmount) * 100,
              isPaid,
              settledAmount: isPaid ? splitAmount : 0,
              settledDate: isPaid ? new Date() : undefined,
            };
          }),
          receiptUrl: uploadedReceiptUrl,
          notes: existingTransaction.notes,
          transactionCurrency: baseCurrency,
          fxRateApplied: 1,
        });

        logger.debug('Transaction updated successfully');
        showToast({title: 'Transaction updated successfully', type: 'success'});
        router.back();
      } catch (error) {
        logger.error('Error updating transaction', error);
        showToast({
          title: error instanceof Error ? error.message : 'Failed to update transaction',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [
    amount,
    calculateSplitAmounts,
    currency,
    currentUserMember?.id,
    customAmounts,
    description,
    editGroupExpense,
    existingTransaction,
    expenseCategories,
    group,
    groupCurrency,
    paidBy,
    percentageAmounts,
    receiptUri,
    router,
    selectedCategoryId,
    setLoading,
    sharesAmounts,
    showAlert,
    showToast,
    splitType,
    transactionId,
  ]);

  const handlePickReceipt = useCallback(() => {
    void (async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
        });

        if (!result.canceled && result.assets.length > 0) {
          setReceiptUri(result.assets[0]?.uri ?? null);
          logger.debug('Selected receipt', {uri: result.assets[0]?.uri});
        }
      } catch (error) {
        logger.error('Error picking receipt', error);
        showAlert({title: 'Error', message: 'Failed to pick image', actions: [{text: 'OK'}]});
      }
    })();
  }, [setReceiptUri, showAlert]);

  return {handleSubmit, handlePickReceipt};
};

const syncReceiptUrl = async ({
  groupId,
  transactionId,
  receiptUri,
  previousReceiptUrl,
  showAlert,
  setLoading,
}: {
  groupId: string;
  transactionId: string;
  receiptUri: string | null;
  previousReceiptUrl?: string;
  showAlert: ReturnType<typeof useAlert>['showAlert'];
  setLoading: (value: boolean) => void;
}): Promise<string | undefined | false> => {
  if (receiptUri === previousReceiptUrl) {
    return previousReceiptUrl;
  }

  if (receiptUri) {
    try {
      logger.debug('Uploading new receipt');
      const uploadedReceiptUrl = await SupabaseStorageService.uploadGroupReceipt(
        groupId,
        transactionId,
        receiptUri,
      );
      logger.debug('Receipt uploaded', {uploadedReceiptUrl});
      return uploadedReceiptUrl;
    } catch (error) {
      logger.error('Failed to upload receipt', error);
      showAlert({
        title: 'Upload Failed',
        message: 'Could not upload the receipt image.',
        actions: [{text: 'OK'}],
      });
      setLoading(false);
      return false;
    }
  }

  if (previousReceiptUrl) {
    try {
      logger.debug('Removing receipt');
      await SupabaseStorageService.removeGroupReceipt(groupId, transactionId);
      logger.debug('Receipt removed');
    } catch (error) {
      logger.warn('Failed to remove receipt, proceeding anyway', error);
    }
  }

  return undefined;
};
