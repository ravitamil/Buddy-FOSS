import {useCallback, useEffect, useMemo, useState} from 'react';
import {BackHandler} from 'react-native';
import {useRouter} from 'expo-router';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useAuth} from '@/context/AuthContext';
import {useCategory} from '@/context/CategoryContext';
import {useGroups} from '@/context/GroupContext';
import {useSettings} from '@/context/SettingsContext';
import {useTransaction} from '@/context/TransactionContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {useWallets} from '@/features/wallets/queries';
import {appRoutes} from '@/navigation/routes';
import type {Category, Transaction} from '@/types';

interface UseTransactionDetailScreenModelOptions {
  transactionId?: string;
}

export interface TransactionDetailIcon {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface TransactionDetailScreenModel {
  transaction?: Transaction;
  category?: Category;
  walletName?: string;
  groupName?: string;
  isLoanPayment: boolean;
  isSubscriptionPayment: boolean;
  isGroupTransaction: boolean;
  canEditAmount: boolean;
  transactionIcon: TransactionDetailIcon;
  isDarkMode: boolean;
  showDeleteModal: boolean;
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  largeTitleStyle: ReturnType<typeof useProgressiveBlurHeader>['largeTitleStyle'];
  formatCurrency: (amount: number) => string;
  goBack: () => void;
  editTransaction: () => void;
  navigateToSource: () => void;
  requestDeleteTransaction: () => void;
  cancelDeleteTransaction: () => void;
  confirmDeleteTransaction: () => Promise<void>;
}

const getTransactionIcon = (transaction?: Transaction): TransactionDetailIcon => {
  if (transaction?.type === 'expense') {
    return {name: 'arrow-up', color: '$danger'};
  }

  return {name: 'arrow-down', color: '$badgeSuccessText'};
};

export function useTransactionDetailScreenModel({
  transactionId,
}: UseTransactionDetailScreenModelOptions = {}): TransactionDetailScreenModel {
  const router = useRouter();
  const {user} = useAuth();
  const {formatCurrency} = useSettings();
  const {transactions, deleteTransaction} = useTransaction();
  const {categories} = useCategory();
  const {groups} = useGroups();
  const {data: wallets = []} = useWallets(user?.uid ?? '');
  const {isDarkMode} = useTamaguiTheme();
  const {showAlert} = useAlert();
  const {onScroll, headerProps, largeTitleStyle} = useProgressiveBlurHeader();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentTransactionId = transactionId ?? '';
  const transaction = useMemo(
    () => transactions.find((item) => item.id === currentTransactionId),
    [currentTransactionId, transactions],
  );

  const category = useMemo(
    () =>
      transaction
        ? categories.find(
            (item) => item.id === transaction.category || item.name === transaction.category,
          )
        : undefined,
    [categories, transaction],
  );

  const transactionIcon = useMemo(() => getTransactionIcon(transaction), [transaction]);

  const walletName = useMemo(() => {
    if (!transaction?.walletId) return undefined;
    const wallet = wallets.find((w) => w.id === transaction.walletId);
    return wallet?.name;
  }, [transaction?.walletId, wallets]);

  const groupName = useMemo(() => {
    if (!transaction?.groupId) return undefined;
    const group = groups.items.find((g) => g.id === transaction.groupId);
    return group?.name;
  }, [groups.items, transaction?.groupId]);

  const isLoanPayment = Boolean(transaction?.loanId);
  const isSubscriptionPayment = Boolean(transaction?.subscriptionId);
  const isGroupTransaction = Boolean(transaction?.groupId);
  const canEditAmount = !isLoanPayment;

  const goBack = useCallback(() => {
    if (showDeleteModal) {
      setShowDeleteModal(false);
      return;
    }
    router.back();
  }, [router, showDeleteModal]);

  useEffect(() => {
    if (!showDeleteModal) return;

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowDeleteModal(false);
      return true;
    });

    return () => backSubscription.remove();
  }, [showDeleteModal]);

  const navigateToSource = useCallback(() => {
    if (!transaction) return;
    if (transaction.groupId) {
      router.push(appRoutes.groupTransactionDetail(transaction.groupId, transaction.id));
    } else if (transaction.loanId) {
      router.push(appRoutes.loanDetail(transaction.loanId));
    } else if (transaction.subscriptionId) {
      router.push(appRoutes.subscriptionDetail(transaction.subscriptionId));
    }
  }, [router, transaction]);

  const editTransaction = useCallback(() => {
    if (!transaction) {
      return;
    }

    if (transaction.groupId) {
      router.push(appRoutes.groupEditTransaction(transaction.groupId, transaction.id));
    } else {
      router.push(appRoutes.editTransaction(transaction.id));
    }
  }, [router, transaction]);

  const requestDeleteTransaction = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const cancelDeleteTransaction = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const confirmDeleteTransaction = useCallback(async () => {
    if (!transaction) return;

    try {
      await deleteTransaction(transaction.id);
      setShowDeleteModal(false);
      router.back();
    } catch {
      setShowDeleteModal(false);
      showAlert({
        title: 'Error',
        message: 'Failed to delete transaction. Please try again.',
        actions: [{text: 'OK'}],
      });
    }
  }, [deleteTransaction, router, showAlert, transaction]);

  return {
    transaction,
    category,
    walletName,
    groupName,
    isLoanPayment,
    isSubscriptionPayment,
    isGroupTransaction,
    canEditAmount,
    transactionIcon,
    isDarkMode,
    showDeleteModal,
    onScroll,
    headerProps,
    largeTitleStyle,
    formatCurrency,
    goBack,
    editTransaction,
    navigateToSource,
    requestDeleteTransaction,
    cancelDeleteTransaction,
    confirmDeleteTransaction,
  };
}
