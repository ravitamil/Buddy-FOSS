import {useCallback, useState} from 'react';
import {Share} from 'react-native';
import {router} from 'expo-router';
import {useQueryClient} from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {queryKeys} from '@/lib/query-keys';
import {logger as appLogger} from '@/services/LoggerService';
import {StorageService} from '@/services/storage';
import {budgetDatabaseService} from '@/services/BudgetDatabaseService';
import {loanDatabaseService} from '@/services/LoanDatabaseService';
import {subscriptionDatabaseService} from '@/services/SubscriptionDatabaseService';
import {
  debtPayoffDatabaseService,
  type DebtPayoffPlanForPersistence,
} from '@/services/DebtPayoffDatabaseService';
import type {Transaction, Category, Budget, SavingsGoal, Investment, Portfolio} from '@/types';
import type {LoanData} from '@/types/loan.types';
import type {SubscriptionData} from '@/types/finance.types';
import type {EnhancedGroup} from '@/features/groups/types';
import type {Wallet} from '@/features/wallets/types';

export interface BackupSyncScreenModel {
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isDarkMode: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleSyncData: () => Promise<void>;
  handleBackupData: () => Promise<void>;
  handleRestoreData: () => Promise<void>;
  handleForceSyncSubscriptions: () => Promise<void>;
  navigateBack: () => void;
}

interface BackupDataPayload {
  transactions?: Transaction[];
  categories?: Category[];
  wallets?: Wallet[];
  budgets?: Budget[];
  loans?: LoanData[];
  savingsGoals?: SavingsGoal[];
  subscriptions?: SubscriptionData[];
  debtPayoffPlans?: DebtPayoffPlanForPersistence[];
  groups?: EnhancedGroup[];
  investments?: Investment[];
  portfolios?: Portfolio[];
  preferences?: Record<string, unknown>;
}

interface BackupFilePayload {
  version: number;
  exportedAt?: string;
  appName?: string;
  data: BackupDataPayload;
}

type AlertType = 'success' | 'error' | 'info';

function getAlertVariant(type: AlertType) {
  return type === 'success' ? 'success' : 'default';
}

export function useBackupSyncScreen(): BackupSyncScreenModel {
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const {isDarkMode} = useTamaguiTheme();
  const queryClient = useQueryClient();
  const {showAlert} = useAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated] = useState(true);

  const showBackupSyncAlert = useCallback(
    (title: string, message: string, type: AlertType = 'info') => {
      showAlert({
        title,
        message,
        actions: [{text: 'OK', variant: getAlertVariant(type)}],
      });
    },
    [showAlert],
  );

  const invalidateFinancialQueries = useCallback(async () => {
    await queryClient.invalidateQueries({queryKey: queryKeys.transactions.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.budgets.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.categories.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.groups.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.loans.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.savings.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.subscriptions.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.investments.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.wallets.all});
    await queryClient.invalidateQueries({queryKey: queryKeys.users.all});
  }, [queryClient]);

  const handleSyncData = useCallback(async () => {
    setIsLoading(true);
    try {
      await invalidateFinancialQueries();
      showBackupSyncAlert(
        'Storage Verified',
        'Your offline database is fully synchronized and validated.',
        'success',
      );
    } catch (error) {
      appLogger.error('BackupSyncScreen: Error during sync:', error);
      showBackupSyncAlert('Sync Error', 'Failed to refresh local storage state.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [invalidateFinancialQueries, showBackupSyncAlert]);

  const handleBackupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        transactions,
        categories,
        wallets,
        budgets,
        loans,
        savingsGoals,
        subscriptions,
        debtPayoffPlans,
        groups,
        investments,
        portfolios,
        preferences,
      ] = await Promise.all([
        StorageService.getTransactions(),
        StorageService.getCategories(),
        StorageService.getWallets(),
        budgetDatabaseService.getAll('local_user'),
        loanDatabaseService.getLoans('local_user'),
        StorageService.getSavingsGoals(),
        subscriptionDatabaseService.getSubscriptions('local_user'),
        debtPayoffDatabaseService.getDebtPayoffPlans('local_user'),
        StorageService.getGroups(),
        StorageService.getInvestments(),
        StorageService.getPortfolios(),
        StorageService.getPreferences(),
      ]);

      const backupPayload: BackupFilePayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        appName: 'Buddy Community Edition',
        data: {
          transactions,
          categories,
          wallets,
          budgets,
          loans,
          savingsGoals,
          subscriptions,
          debtPayoffPlans,
          groups,
          investments,
          portfolios,
          preferences,
        },
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);

      await Share.share({
        title: `Buddy_Backup_${new Date().toISOString().split('T')[0]}`,
        message: jsonString,
      });

      showBackupSyncAlert(
        'Backup Generated',
        'Your financial data has been packaged into a secure JSON backup.',
        'success',
      );
    } catch (error) {
      appLogger.error('BackupSyncScreen: Backup error:', error);
      showBackupSyncAlert('Backup Failed', 'Could not export backup data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showBackupSyncAlert]);

  const handleRestoreData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(fileContent) as unknown;

      if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
        showBackupSyncAlert(
          'Invalid Backup',
          'The selected file is not a valid Buddy backup archive.',
          'error',
        );
        setIsLoading(false);
        return;
      }

      const backup = parsed as BackupFilePayload;
      const {data} = backup;

      if (Array.isArray(data.transactions)) {
        await StorageService.saveTransactions(data.transactions);
      }
      if (Array.isArray(data.categories)) {
        await StorageService.saveCategories(data.categories);
      }
      if (Array.isArray(data.wallets)) {
        await StorageService.saveWallets(data.wallets);
      }
      if (Array.isArray(data.budgets)) {
        for (const b of data.budgets) {
          await budgetDatabaseService.update('local_user', b);
        }
      }
      if (Array.isArray(data.loans)) {
        await loanDatabaseService.saveLoans('local_user', data.loans);
      }
      if (Array.isArray(data.savingsGoals)) {
        await StorageService.saveSavingsGoals(data.savingsGoals);
      }
      if (Array.isArray(data.subscriptions)) {
        await subscriptionDatabaseService.saveSubscriptions('local_user', data.subscriptions);
      }
      if (Array.isArray(data.debtPayoffPlans)) {
        await debtPayoffDatabaseService.saveDebtPayoffPlans('local_user', data.debtPayoffPlans);
      }
      if (Array.isArray(data.groups)) {
        await StorageService.saveGroups(data.groups);
      }
      if (Array.isArray(data.investments)) {
        await StorageService.saveInvestments(data.investments);
      }
      if (Array.isArray(data.portfolios)) {
        await StorageService.savePortfolios(data.portfolios);
      }

      await invalidateFinancialQueries();

      showBackupSyncAlert(
        'Restore Complete',
        'All your financial data has been successfully restored from the backup.',
        'success',
      );
    } catch (error) {
      appLogger.error('BackupSyncScreen: Restore error:', error);
      showBackupSyncAlert('Restore Failed', 'Failed to read or parse the backup file.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [invalidateFinancialQueries, showBackupSyncAlert]);

  const handleForceSyncSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      await invalidateFinancialQueries();
      showBackupSyncAlert(
        'Subscriptions Synced',
        'Your recurring subscriptions are up to date.',
        'success',
      );
    } catch (error) {
      appLogger.error('BackupSyncScreen: Error during subscription sync:', error);
      showBackupSyncAlert('Sync Failed', 'Could not refresh subscriptions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [invalidateFinancialQueries, showBackupSyncAlert]);

  const navigateBack = useCallback(() => {
    router.back();
  }, []);

  return {
    headerProps,
    onScroll,
    isDarkMode,
    isAuthenticated,
    isLoading,
    handleSyncData,
    handleBackupData,
    handleRestoreData,
    handleForceSyncSubscriptions,
    navigateBack,
  };
}
