import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';

import {useAuth} from '@/context/AuthContext';
import {useSettings} from '@/context/SettingsContext';
import {logger as appLogger} from '@/services/LoggerService';
import {NotificationService} from '@/services/NotificationService';
import {budgetNotificationService} from '@/services/BudgetNotificationService';
import {useBudgetCycleModel, useBudgetState} from '@/features/budgets';
import {useLoanQuery} from '@/context/LoanContext.query';
import {useSubscriptionQuery} from '@/context/SubscriptionContext.query';
import {serializeLoanDates} from '@/features/loans/calculations';

const logger = appLogger.serviceLogger('NotificationInitializer');

export function NotificationInitializer() {
  const {isAuthenticated, user} = useAuth();
  const {isInitialized, notifications} = useSettings();
  const initializedForUser = useRef<string | null>(null);
  const {activeBudget} = useBudgetState();
  const budgetCycle = useBudgetCycleModel(activeBudget);
  const {loans} = useLoanQuery();
  const {subscriptions} = useSubscriptionQuery();

  useEffect(() => {
    NotificationService.setPaymentSources(subscriptions, loans.items.map(serializeLoanDates));
  }, [loans.items, subscriptions]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      initializedForUser.current = null;
      return;
    }
    if (!isInitialized || !notifications.pushNotifications) return;
    if (initializedForUser.current === user.uid) return;

    const initializationTask = InteractionManager.runAfterInteractions(() => {
      if (initializedForUser.current === user.uid) return;
      initializedForUser.current = user.uid;
      void Promise.all([
        NotificationService.initialize(),
        budgetNotificationService.initialize(),
      ]).catch((error) => {
        logger.warn('Failed to initialize notifications', error);
      });
    });

    return () => initializationTask.cancel();
  }, [isAuthenticated, isInitialized, notifications.pushNotifications, user]);

  useEffect(() => {
    if (!notifications.pushNotifications || !activeBudget || !budgetCycle) return;

    void budgetNotificationService
      .checkBudgetCycleThresholds({budget: activeBudget, model: budgetCycle})
      .catch((error) => logger.warn('Failed to evaluate budget notifications', error));
  }, [activeBudget, budgetCycle, notifications.pushNotifications]);

  return null;
}
