import {semanticHexColor} from '@ravitamil/buddy-ui';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import type {ScrollView} from 'react-native';
import {router} from 'expo-router';
import type {Href} from 'expo-router';

import {useAuth, useCategory, useGroups, useSettings, useTransaction, useUser} from '@/context';
import {useMembership} from '@/context/MembershipContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useFinancialSummary} from '@/features/analytics';
import {useBudgetCycleModel, useBudgetState} from '@/features/budgets';
import {useSavingsState} from '@/features/savings';
import {logger as appLogger} from '@/services/LoggerService';
import {getCurrentUserInfo} from '@/utils/userUtils';

import type {HomeScreenModel} from '../types';
import {createHomeActions} from './homeActions';
import {
  createBudgetData,
  createFinancialData,
  createHomeGroupCards,
  createHomeStatCards,
  createHomeTransactionItems,
} from './homeReadModels';
import {isHomeContentLoading} from './homeLoadingState';

export const useHomeScreen = (): HomeScreenModel => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {transactions, isLoading: isTransactionsLoading} = useTransaction();
  const {categories} = useCategory();
  const {budgets, activeBudget, isLoading: isBudgetsLoading} = useBudgetState();
  const {savingsGoals} = useSavingsState();
  const {groups} = useGroups();
  const {formatCurrency, isInitialized: areSettingsInitialized, syncWithRemote} = useSettings();
  const {user} = useAuth();
  const financialSummary = useFinancialSummary(user?.uid ?? '');
  const {profile, refreshProfile} = useUser();
  const {isPro} = useMembership();
  const {isDarkMode} = useTamaguiTheme();

  const allTransactions = transactions ?? [];
  const allCategories = categories ?? [];
  const isLoading = isHomeContentLoading({
    areSettingsInitialized,
    isBudgetsLoading,
    isTransactionsLoading,
  });
  const isNavigatingRef = useRef(false);
  const navigate = useCallback((path: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 400);
    // Route builders and legacy Home destinations are runtime-validated by Expo Router.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- dynamic Home destinations are validated by Expo Router at runtime.
    router.push(path as Href);
  }, []);

  useEffect(() => {
    appLogger.debug('HomeScreen: component mounted successfully');
    appLogger.debug('HomeScreen: theme mode', isDarkMode ? 'dark' : 'light');
    return () => appLogger.debug('HomeScreen: component unmounting');
  }, [isDarkMode]);

  useEffect(() => {
    try {
      if (typeof refreshProfile === 'function') void refreshProfile();
    } catch (error) {
      appLogger.warn('HomeScreen: failed to refresh profile on mount', error);
    }
  }, [refreshProfile]);

  useEffect(() => {
    if (areSettingsInitialized && user?.uid) {
      void syncWithRemote();
    }
  }, [areSettingsInitialized, syncWithRemote, user?.uid]);

  const greetingName = useMemo(() => {
    try {
      return getCurrentUserInfo(profile?.firstName, profile?.displayName).name;
    } catch {
      return profile?.displayName || profile?.firstName || user?.displayName || 'User';
    }
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const financialData = useMemo(() => createFinancialData(financialSummary), [financialSummary]);
  const statCards = useMemo(
    () =>
      createHomeStatCards({
        transactions: allTransactions,
        financialData,
        formatCurrency,
        navigate,
        userId: user?.uid,
      }),
    [allTransactions, financialData, formatCurrency, navigate, user?.uid],
  );

  const currentActiveBudget = activeBudget ?? budgets?.find((budget) => budget.isActive) ?? null;
  const budgetCycle = useBudgetCycleModel(currentActiveBudget);
  const budgetData = useMemo(
    () => createBudgetData(currentActiveBudget, budgetCycle),
    [budgetCycle, currentActiveBudget],
  );
  const groupCards = useMemo(
    () =>
      createHomeGroupCards({
        groups: groups.items,
        formatCurrency,
        navigate,
        userId: user?.uid,
      }),
    [formatCurrency, groups.items, navigate, user?.uid],
  );
  const recentTransactions = useMemo(
    () =>
      createHomeTransactionItems({
        transactions: allTransactions,
        categories: allCategories,
        navigate,
        groups: groups.items,
        currentUserId: user?.uid,
        currentUserName: greetingName,
      }),
    [allCategories, allTransactions, navigate, groups.items, user?.uid, greetingName],
  );

  const retirementGoalId = savingsGoals?.find((goal) => goal.isRetirementGoal)?.id;
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  }, []);
  const actions = useMemo(
    () =>
      createHomeActions({
        navigate,
        scrollToTop,
        hasActiveBudget: Boolean(currentActiveBudget),
        activeBudgetId: currentActiveBudget?.id,
        retirementGoalId,
      }),
    [currentActiveBudget, navigate, retirementGoalId, scrollToTop],
  );

  return {
    scrollViewRef,
    isLoading,
    isDarkMode,
    greetingName,
    isPro,
    iconColor: isDarkMode ? '#ffffff' : '#000000',
    linkIconColor: semanticHexColor('primary'),
    statCards,
    budgetData,
    groupCards,
    transactions: recentTransactions,
    formatCurrency,
    actions,
  };
};
