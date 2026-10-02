import {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from 'expo-router';
import {useAuth, useCategory, useGroups, useSettings, useUser} from '@/context';
import {useToast} from '@/context/ToastContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {logger as appLogger} from '@/services/LoggerService';
import type {Transaction} from '@/types';
import type {
  AddGroupTransactionCategory,
  GroupSplitType,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';
import {calculateGroupSplitAmounts, isDecimalInput} from '../utils/groupTransactionFormUtils';
import {isGroupTransactionFormValid} from './addGroupTransactionModels';
import {
  createEditGroupTransactionFormState,
  emptyEditGroupTransactionFormState,
} from './editGroupTransaction/editGroupTransactionModels';
import {useEditGroupTransactionActions} from './editGroupTransaction/useEditGroupTransactionActions';
import {useGroupTransactionFormContext} from './useGroupTransactionFormContext';

const logger = appLogger.contextLogger('EditGroupTransactionScreen');
export interface UseEditGroupTransactionScreenResult {
  group: GroupWithAvatarMembers | null;
  existingTransaction?: Transaction;
  expenseCategories: AddGroupTransactionCategory[];
  description: string;
  selectedCategoryId: string;
  amount: string;
  paidBy: string;
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  loading: boolean;
  isFormValid: boolean;
  receiptUri: string | null;
  currencySymbol: string;
  isDarkMode: boolean;
  userFirstName?: string;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  settingsFormatCurrencyExact: (amount: number) => string;
  getUserDisplayName: () => string;
  setDescription: (value: string) => void;
  setSelectedCategoryId: (value: string) => void;
  setPaidBy: (value: string) => void;
  setSplitType: (value: GroupSplitType) => void;
  setCustomAmounts: (value: Record<string, string>) => void;
  setPercentageAmounts: (value: Record<string, string>) => void;
  setSharesAmounts: (value: Record<string, string>) => void;
  setReceiptUri: (value: string | null) => void;
  handleBack: () => void;
  handleAmountChange: (text: string) => void;
  handlePickReceipt: () => void;
  handleSubmit: () => void;
}

interface UseEditGroupTransactionScreenOptions {
  groupId: string;
  transactionId: string;
}

export const useEditGroupTransactionScreen = ({
  groupId,
  transactionId,
}: UseEditGroupTransactionScreenOptions): UseEditGroupTransactionScreenResult => {
  const router = useRouter();
  const enhancedGroups = useGroups();
  const {groups} = enhancedGroups;
  const {showToast} = useToast();
  const {user} = useAuth();
  const {profile} = useUser();
  const {formatCurrencyExact: settingsFormatCurrencyExact, currency, groupCurrency} = useSettings();
  const {categories} = useCategory();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const {isDarkMode} = useTamaguiTheme();

  const {
    group,
    userFirstName,
    currencySymbol,
    getUserDisplayName,
    currentUserMember,
    expenseCategories,
  } = useGroupTransactionFormContext({
    groups: groups.items as GroupWithAvatarMembers[],
    groupId,
    profile,
    user,
    currency,
    categories,
  });
  const existingTransaction = group?.transactions?.find(
    (transaction) => transaction.id === transactionId,
  );

  const [formState, setFormState] = useState(emptyEditGroupTransactionFormState);
  const [loading, setLoading] = useState(false);
  const {
    description,
    selectedCategoryId,
    amount,
    paidBy,
    splitType,
    customAmounts,
    percentageAmounts,
    sharesAmounts,
    receiptUri,
  } = formState;

  useEffect(() => {
    if (!existingTransaction) {
      return;
    }

    let defaultCategoryId = existingTransaction.categoryId;
    if (!defaultCategoryId || defaultCategoryId === 'exp_other') {
      const otherCategory = expenseCategories.find((category) => category.name === 'Other');
      defaultCategoryId = otherCategory?.id || expenseCategories[0]?.id || '';
    }
    setFormState(
      createEditGroupTransactionFormState({transaction: existingTransaction, defaultCategoryId}),
    );
  }, [existingTransaction, expenseCategories]);

  useEffect(() => {
    logger.debug('Form state', {
      description,
      amount,
      paidBy,
      splitType,
      transactionId,
      groupId,
    });
  }, [amount, description, groupId, paidBy, splitType, transactionId]);

  const calculateSplitAmounts = useCallback(() => {
    return calculateGroupSplitAmounts({
      group,
      amount,
      splitType,
      customAmounts,
      percentageAmounts,
      sharesAmounts,
    });
  }, [amount, customAmounts, group, percentageAmounts, sharesAmounts, splitType]);

  const {handleSubmit, handlePickReceipt} = useEditGroupTransactionActions({
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
    editGroupExpense: enhancedGroups.editGroupExpense,
    showAlert,
    showToast,
    setLoading,
    setReceiptUri: (value) => setFormState((state) => ({...state, receiptUri: value})),
    calculateSplitAmounts,
  });

  const handleSplitTypeChange = useCallback(
    (newSplitType: GroupSplitType) => {
      if (!group) {
        setFormState((state) => ({...state, splitType: newSplitType}));
        return;
      }

      if (newSplitType === 'equal') {
        setFormState((state) => ({
          ...state,
          splitType: 'equal',
          customAmounts: {},
          percentageAmounts: {},
          sharesAmounts: {},
        }));
      } else if (newSplitType === 'shares') {
        const nextShares: Record<string, string> = {};
        group.members.forEach((member) => {
          nextShares[member.id] = formState.sharesAmounts[member.id] || '1';
        });
        setFormState((state) => ({
          ...state,
          splitType: 'shares',
          sharesAmounts: nextShares,
        }));
      } else if (newSplitType === 'percentage') {
        const count = group.members.length || 1;
        const equalPct = (100 / count).toFixed(1);
        const nextPct: Record<string, string> = {};
        group.members.forEach((member) => {
          nextPct[member.id] = formState.percentageAmounts[member.id] || equalPct;
        });
        setFormState((state) => ({
          ...state,
          splitType: 'percentage',
          percentageAmounts: nextPct,
        }));
      } else if (newSplitType === 'custom') {
        const count = group.members.length || 1;
        const parsed = Number.parseFloat(formState.amount) || 0;
        const equalAmt = (parsed / count).toFixed(2);
        const nextCustom: Record<string, string> = {};
        group.members.forEach((member) => {
          nextCustom[member.id] = formState.customAmounts[member.id] || equalAmt;
        });
        setFormState((state) => ({
          ...state,
          splitType: 'custom',
          customAmounts: nextCustom,
        }));
      }
    },
    [
      formState.amount,
      formState.customAmounts,
      formState.percentageAmounts,
      formState.sharesAmounts,
      group,
    ],
  );

  const isFormValid = useMemo(
    () =>
      isGroupTransactionFormValid({
        amount,
        description,
        paidBy,
        receivedBy: [],
        transactionType: 'expense',
        splitType,
        customAmounts,
        percentageAmounts,
        sharesAmounts,
      }),
    [amount, customAmounts, description, paidBy, percentageAmounts, sharesAmounts, splitType],
  );

  return {
    group,
    existingTransaction,
    expenseCategories,
    description,
    selectedCategoryId,
    amount,
    paidBy,
    splitType,
    customAmounts,
    percentageAmounts,
    sharesAmounts,
    loading,
    isFormValid,
    receiptUri,
    currencySymbol,
    isDarkMode,
    userFirstName,
    headerProps,
    onScroll,
    settingsFormatCurrencyExact,
    getUserDisplayName,
    setDescription: (value) => setFormState((state) => ({...state, description: value})),
    setSelectedCategoryId: (value) =>
      setFormState((state) => ({...state, selectedCategoryId: value})),
    setPaidBy: (value) => setFormState((state) => ({...state, paidBy: value})),
    setSplitType: handleSplitTypeChange,
    setCustomAmounts: (value) => setFormState((state) => ({...state, customAmounts: value})),
    setPercentageAmounts: (value) =>
      setFormState((state) => ({...state, percentageAmounts: value})),
    setSharesAmounts: (value) => setFormState((state) => ({...state, sharesAmounts: value})),
    setReceiptUri: (value) => setFormState((state) => ({...state, receiptUri: value})),
    handleBack: () => {
      logger.debug('Back button pressed');
      router.back();
    },
    handleAmountChange: (text) => {
      if (isDecimalInput(text)) {
        setFormState((state) => ({...state, amount: text}));
      }
    },
    handlePickReceipt,
    handleSubmit,
  };
};
