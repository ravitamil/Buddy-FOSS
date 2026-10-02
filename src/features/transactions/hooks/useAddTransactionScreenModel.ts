import {useCallback, useEffect, useMemo, useState} from 'react';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {BackHandler, Keyboard, Platform} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useCategory} from '@/context/CategoryContext';
import {useSettings} from '@/context/SettingsContext';
import {useTransaction} from '@/context/TransactionContext';
import {useAlert} from '@/hooks/useAlert';
import {useAuth} from '@/context/AuthContext';
import {useWallets} from '@/features/wallets/queries';
import {findCategoryBudgetProgress, useBudgetCycleModel, useBudgetState} from '@/features/budgets';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {getCurrencySymbol} from '@/constants/currencies';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category, RecurrenceFrequency, Transaction} from '@/types';

import type {AddTransactionRouteType, RecurringTransactionTemplateResult} from '../types';
import {
  buildAddTransactionReadModel,
  filterTransactionCategories,
  getCategoryName,
  getRouteTransactionType,
  recurrenceFrequencies,
  sanitizeAmountInput,
} from './addTransactionScreenModelUtils';
import {saveAddTransaction} from './addTransactionActions';

const logger = appLogger.contextLogger('AddTransactionScreen');

const createRecurringTransaction = (
  transactionData: Omit<Transaction, 'id'>,
): Promise<RecurringTransactionTemplateResult> => {
  return Promise.resolve({
    id: `template_${Date.now()}`,
    nextOccurrenceDate: new Date().toISOString(),
    ...transactionData,
  });
};

export function useAddTransactionScreenModel() {
  const {type, editId} = useLocalSearchParams<{type?: string; editId?: string}>();
  const router = useRouter();
  const {transactions, addTransaction, updateTransaction} = useTransaction();
  const {categories} = useCategory();
  const {formatCurrency, currency} = useSettings();
  const {onScroll, headerProps, isScrollingDown} = useProgressiveBlurHeader();
  const {showAlert} = useAlert();
  const {activeBudget} = useBudgetState();
  const {user} = useAuth();
  const {data: wallets = []} = useWallets(user?.uid ?? '');
  const budgetCycle = useBudgetCycleModel(activeBudget);

  const transactionType = getRouteTransactionType(type);
  const isIncome = transactionType === 'income';
  const isEditMode = Boolean(editId);

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showWalletSheet, setShowWalletSheet] = useState(false);

  const availableCategories = useMemo(
    () => filterTransactionCategories(categories, transactionType),
    [categories, transactionType],
  );

  useEffect(() => {
    if (!isEditMode || !editId) {
      return;
    }

    const transactionToEdit = transactions.find((transaction) => transaction.id === editId);

    if (!transactionToEdit) {
      showAlert({
        title: 'Error',
        message: 'Transaction not found',
        actions: [{text: 'OK', onPress: () => router.back()}],
      });
      return;
    }

    setAmount(String(Math.abs(transactionToEdit.amount)));
    setDescription(transactionToEdit.description);
    setIsRecurring(transactionToEdit.isRecurring ?? false);
    setRecurrenceFrequency(transactionToEdit.recurrenceFrequency ?? 'monthly');
    setRecurrenceEndDate(
      transactionToEdit.recurrenceEndDate ? new Date(transactionToEdit.recurrenceEndDate) : null,
    );
    setSelectedDate(new Date(transactionToEdit.date));
    setSelectedWalletId(transactionToEdit.walletId ?? null);

    if (transactionToEdit.type !== transactionType) {
      router.setParams({type: transactionToEdit.type});
    }

    const categoryName = getCategoryName(transactionToEdit.category);
    const category = categories.find(
      (item) => item.id === transactionToEdit.categoryId || item.name === categoryName,
    );
    if (category) {
      setSelectedCategory(category);
    }
  }, [categories, editId, isEditMode, router, showAlert, transactionType, transactions]);

  useEffect(() => {
    if (availableCategories.length > 0 && !selectedCategory && !isEditMode) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, isEditMode, selectedCategory]);

  const handleAmountChange = useCallback((text: string) => {
    setAmount(sanitizeAmountInput(text));
  }, []);

  const addQuickAmount = useCallback((delta: number) => {
    setAmount((prev) => {
      const current = Number.parseFloat(prev) || 0;
      const next = Math.max(0, current + delta);
      return next > 0 ? (Number.isInteger(next) ? String(next) : next.toFixed(2)) : '';
    });
  }, []);

  const handleDescriptionSubmit = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const toggleDescriptionExpand = useCallback(() => {
    setIsDescriptionExpanded((current) => !current);
  }, []);

  const onDateChange = useCallback((_: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const onRecurrenceEndDateChange = useCallback((_: DateTimePickerEvent, date?: Date) => {
    setShowRecurrenceEndPicker(false);
    if (date) {
      setRecurrenceEndDate(date);
    }
  }, []);

  const selectTransactionType = useCallback(
    (nextType: AddTransactionRouteType) => {
      router.setParams({type: nextType});
    },
    [router],
  );

  const navigateAddCategory = useCallback(() => {
    router.push('/manage-categories');
  }, [router]);

  const budgetGuardrail = useMemo(() => {
    if (isIncome || !budgetCycle || !selectedCategory) return null;
    const progress = findCategoryBudgetProgress(budgetCycle, selectedCategory);
    if (!progress) return null;

    const parsedAmount = Number.parseFloat(amount) || 0;
    const editedTransaction = isEditMode
      ? transactions.find((transaction) => transaction.id === editId)
      : undefined;
    const editedCategoryMatches =
      editedTransaction?.type === 'expense' &&
      (editedTransaction.categoryId === selectedCategory.id ||
        editedTransaction.category === selectedCategory.name);
    const currentSpent = Math.max(
      0,
      progress.spent - (editedCategoryMatches ? Math.abs(editedTransaction.amount) : 0),
    );
    const spentAfterTransaction = currentSpent + parsedAmount;
    const utilizationAfter =
      progress.amount > 0 ? (spentAfterTransaction / progress.amount) * 100 : 0;

    return {
      categoryName: progress.categoryName,
      allocated: progress.amount,
      currentSpent,
      spentAfterTransaction,
      remainingAfter: progress.amount - spentAfterTransaction,
      utilizationAfter,
      alertThreshold: progress.alertThreshold ?? 80,
      status:
        spentAfterTransaction > progress.amount
          ? ('over' as const)
          : utilizationAfter >= (progress.alertThreshold ?? 80)
            ? ('near' as const)
            : ('safe' as const),
    };
  }, [amount, budgetCycle, editId, isEditMode, isIncome, selectedCategory, transactions]);

  const performSaveTransaction = useCallback(async () => {
    const parsedAmount = Number.parseFloat(amount);

    if (!amount || parsedAmount <= 0) {
      showAlert({
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than 0.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    if (!selectedCategory && availableCategories.length === 0) {
      showAlert({
        title: 'No Categories',
        message: 'Please create a category first before adding a transaction.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    setIsSaving(true);

    try {
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount value');
      }

      await saveAddTransaction(
        {
          parsedAmount,
          description,
          selectedCategoryName: selectedCategory?.name,
          selectedCategoryId: selectedCategory?.id,
          selectedWalletId: selectedWalletId ?? undefined,
          fallbackCategoryName: availableCategories[0]?.name,
          transactionType,
          selectedDate,
          isIncome,
          isEditMode,
          editId,
          isRecurring,
          recurrenceFrequency,
          recurrenceEndDate,
        },
        {
          addTransaction,
          updateTransaction,
          createRecurringTransaction,
          formatCurrency,
          showAlert,
          goBack: router.back,
          logError: (message, error) => logger.error(message, error),
        },
      );
    } catch (error) {
      logger.error('Failed to save transaction', error);
      showAlert({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'save'} transaction. Please try again.`,
        actions: [{text: 'OK'}],
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    addTransaction,
    amount,
    availableCategories,
    description,
    editId,
    formatCurrency,
    isEditMode,
    isIncome,
    isRecurring,
    recurrenceEndDate,
    recurrenceFrequency,
    router,
    selectedCategory,
    selectedWalletId,
    selectedDate,
    showAlert,
    transactionType,
    updateTransaction,
  ]);

  const saveTransaction = useCallback(async () => {
    if (budgetGuardrail?.status === 'over') {
      showAlert({
        title: 'Category budget exceeded',
        message: `This expense puts ${budgetGuardrail.categoryName} over budget by ${formatCurrency(
          Math.abs(budgetGuardrail.remainingAfter),
        )}.`,
        actions: [
          {text: 'Review'},
          {text: 'Save anyway', onPress: () => void performSaveTransaction()},
        ],
      });
      return;
    }

    await performSaveTransaction();
  }, [budgetGuardrail, formatCurrency, performSaveTransaction, showAlert]);

  const readModel = buildAddTransactionReadModel({
    amount,
    isEditMode,
    isIncome,
    isSaving,
  });

  const handleBackPress = useCallback(() => {
    if (showCategorySheet) {
      setShowCategorySheet(false);
      return;
    }
    if (showWalletSheet) {
      setShowWalletSheet(false);
      return;
    }
    if (showDatePicker) {
      setShowDatePicker(false);
      return;
    }
    if (showRecurrenceEndPicker) {
      setShowRecurrenceEndPicker(false);
      return;
    }
    router.back();
  }, [router, showCategorySheet, showDatePicker, showRecurrenceEndPicker, showWalletSheet]);

  // Intercept hardware back press when any sheet/picker is open
  useEffect(() => {
    const hasOpenSheet =
      showCategorySheet || showWalletSheet || showDatePicker || showRecurrenceEndPicker;
    if (!hasOpenSheet) return;

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showCategorySheet) {
        setShowCategorySheet(false);
        return true;
      }
      if (showWalletSheet) {
        setShowWalletSheet(false);
        return true;
      }
      if (showDatePicker) {
        setShowDatePicker(false);
        return true;
      }
      if (showRecurrenceEndPicker) {
        setShowRecurrenceEndPicker(false);
        return true;
      }
      return false;
    });

    return () => backSubscription.remove();
  }, [showCategorySheet, showDatePicker, showRecurrenceEndPicker, showWalletSheet]);

  return {
    title: readModel.title,
    subtitle: readModel.subtitle,
    transactionType,
    isIncome,
    isEditMode,
    amount,
    selectedCategory,
    selectedWalletId,
    description,
    selectedDate,
    showDatePicker,
    isSaving,
    isRecurring,
    recurrenceFrequency,
    recurrenceEndDate,
    showRecurrenceEndPicker,
    isDescriptionExpanded,
    showCategorySheet,
    showWalletSheet,
    availableCategories,
    wallets,
    budgetGuardrail,
    recurrenceFrequencies,
    canSave: readModel.canSave,
    currencyPrefix: getCurrencySymbol(currency),
    onScroll,
    isScrollingDown,
    headerProps,
    onBackPress: handleBackPress,
    formatCurrency,
    setSelectedCategory,
    setSelectedWalletId,
    setDescription,
    setShowDatePicker,
    setShowCategorySheet,
    setShowWalletSheet,
    setIsRecurring,
    setRecurrenceFrequency,
    setRecurrenceEndDate,
    setShowRecurrenceEndPicker,
    handleAmountChange,
    addQuickAmount,
    handleDescriptionSubmit,
    toggleDescriptionExpand,
    onDateChange,
    onRecurrenceEndDateChange,
    selectTransactionType,
    navigateAddCategory,
    saveTransaction,
  };
}
