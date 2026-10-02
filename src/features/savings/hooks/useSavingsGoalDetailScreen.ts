import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';
import dayjs from 'dayjs';

import {useSettings} from '@/context/SettingsContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {appRoutes} from '@/navigation/routes';
import {logger as appLogger} from '@/services/LoggerService';
import {useSavingsState} from './useSavingsState';

const logger = appLogger.contextLogger('SavingsGoalDetailScreen');

const categoryIcons: Record<string, string> = {
  'Emergency Fund': 'shield',
  Vacation: 'airplane',
  Home: 'home',
  Education: 'school',
  Retirement: 'leaf',
  Car: 'car',
  Wedding: 'heart',
  Health: 'fitness',
  Technology: 'laptop',
  Hobby: 'game-controller',
  Charity: 'heart',
  Other: 'ellipsis-horizontal',
};

const categoryColors: Record<string, string> = {
  'Emergency Fund': '#EF4444',
  Vacation: '#3B82F6',
  Home: '#10B981',
  Education: '#8B5CF6',
  Retirement: '#F59E0B',
  Car: '#06B6D4',
  Wedding: '#EC4899',
  Health: '#8B5CF6',
  Technology: '#6366F1',
  Hobby: '#14B8A6',
  Charity: '#F97316',
  Other: '#6B7280',
};

interface UseSavingsGoalDetailScreenOptions {
  goalId: string;
  fromCreation?: boolean;
}

export const useSavingsGoalDetailScreen = ({
  goalId,
  fromCreation = false,
}: UseSavingsGoalDetailScreenOptions) => {
  const {formatCurrency} = useSettings();
  const {savingsGoals, deleteSavingsGoal, depositSavingsGoal} = useSavingsState();
  const {showAlert} = useAlert();
  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isAddingAmount, setIsAddingAmount] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const goal = useMemo(
    () => savingsGoals.find((item) => item.id === goalId) ?? null,
    [goalId, savingsGoals, retryCount],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!goal && goalId) {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [goal, goalId, retryCount]);

  useEffect(() => {
    if (goal) {
      setLoadingTimeout(false);
    }
  }, [goal]);

  const handleGoBack = useCallback(() => {
    if (fromCreation) {
      router.replace('/');
      return;
    }

    router.back();
  }, [fromCreation]);

  const handleEditGoal = useCallback(() => {
    if (goal?.isRetirementGoal) {
      router.push({
        pathname: '/retirement-planning',
        params: {id: goalId},
      });
      return;
    }
    router.push(appRoutes.savingsGoalEdit(goalId));
  }, [goal?.isRetirementGoal, goalId]);

  const handleRetry = useCallback(() => {
    setLoadingTimeout(false);
    setRetryCount((current) => current + 1);
  }, []);

  const handleDeleteGoal = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const cancelDeleteGoal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const confirmDeleteGoal = useCallback(async () => {
    if (!goal) return;

    try {
      await deleteSavingsGoal(goal.id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      logger.error('Error deleting savings goal', error, {goalId});
      showAlert({
        title: 'Error',
        message: 'Failed to delete savings goal. Please try again.',
        actions: [{text: 'OK', style: 'default'}],
      });
    }
  }, [deleteSavingsGoal, goal, goalId, showAlert]);

  const addAmountToGoal = useCallback(
    async (amount: string) => {
      if (!goal || !amount) return false;

      try {
        const additionalAmount = parseFloat(amount);
        if (Number.isNaN(additionalAmount) || additionalAmount <= 0) {
          showAlert({
            title: 'Error',
            message: 'Please enter a valid amount',
            actions: [{text: 'OK', style: 'default'}],
          });
          return false;
        }

        await depositSavingsGoal(goal.id, additionalAmount);

        showAlert({
          title: 'Success',
          message: 'Amount added to savings successfully',
          actions: [{text: 'OK', style: 'default'}],
        });
        return true;
      } catch (error) {
        logger.error('Error adding to savings', error, {goalId, amount});
        showAlert({
          title: 'Error',
          message: 'Failed to add amount to savings',
          actions: [{text: 'OK', style: 'default'}],
        });
        return false;
      }
    },
    [depositSavingsGoal, goal, goalId, showAlert],
  );

  const handleAddToCurrent = useCallback(() => {
    if (!goal) return;
    setAddAmount('');
    setShowAddAmountModal(true);
  }, [goal]);

  const cancelAddAmount = useCallback(() => {
    if (isAddingAmount) return;
    setShowAddAmountModal(false);
    setAddAmount('');
  }, [isAddingAmount]);

  const confirmAddAmount = useCallback(async () => {
    if (isAddingAmount) return;

    setIsAddingAmount(true);
    const didAddAmount = await addAmountToGoal(addAmount);
    setIsAddingAmount(false);

    if (didAddAmount) {
      setShowAddAmountModal(false);
      setAddAmount('');
    }
  }, [addAmount, addAmountToGoal, isAddingAmount]);

  const handleShowTips = useCallback(() => {
    showAlert({
      title: 'Savings Tips',
      message: 'Consider setting up automatic transfers to help reach your goal faster!',
      actions: [{text: 'OK', style: 'default'}],
    });
  }, [showAlert]);

  const goalMetrics = useMemo(() => {
    if (!goal) return null;

    const progressPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    const amountLeft = goal.targetAmount - goal.currentAmount;
    const daysToDeadline = dayjs(goal.deadline).diff(dayjs(), 'day');
    const category = goal.category || 'Other';

    return {
      amountLeft,
      daysToDeadline,
      goalColor: categoryColors[category] || categoryColors.Other,
      goalIcon: categoryIcons[category] || 'flag',
      isGoalCompleted: progressPercentage >= 100,
      progressPercentage,
    };
  }, [goal]);

  return {
    cancelDeleteGoal,
    cancelAddAmount,
    confirmAddAmount,
    addAmount,
    confirmDeleteGoal,
    formatCurrency,
    goal,
    goalId,
    goalMetrics,
    handleAddToCurrent,
    handleDeleteGoal,
    handleEditGoal,
    handleGoBack,
    handleRetry,
    handleShowTips,
    headerProps,
    isDarkMode,
    isAddingAmount,
    loadingTimeout,
    onScroll,
    savingsGoalsCount: savingsGoals.length,
    setAddAmount,
    showAddAmountModal,
    showDeleteModal,
  };
};
