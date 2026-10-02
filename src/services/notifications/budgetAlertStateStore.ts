import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from '../LoggerService';
import {parseJson} from './notificationStorage';
import {
  parseBudgetAlertStates,
  type BudgetAlertState,
  type BudgetAlertThreshold,
} from './budgetNotificationTypes';

const logger = appLogger.serviceLogger('BudgetAlertStateStore');

export class BudgetAlertStateStore {
  private alertStates: Map<string, BudgetAlertState> = new Map();

  constructor(private readonly storageKey: string) {}

  async load(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const states = parseBudgetAlertStates(parseJson(data));
        this.alertStates = new Map(states.map((state) => [state.budgetId, state]));
      }
    } catch (error) {
      logger.error('Error loading alert states', error);
    }
  }

  hasAlertBeenSent(budgetId: string, threshold: BudgetAlertThreshold): boolean {
    const state = this.alertStates.get(budgetId);
    if (!state) return false;

    const today = this.getTodayKey();
    if (state.lastAlertDate !== today) {
      state.alertedThresholds = [];
      return false;
    }

    return state.alertedThresholds.includes(threshold);
  }

  markAlertSent(budgetId: string, threshold: BudgetAlertThreshold): void {
    const today = this.getTodayKey();
    const state = this.alertStates.get(budgetId);

    if (state) {
      state.alertedThresholds.push(threshold);
      state.lastAlertDate = today;
    } else {
      this.alertStates.set(budgetId, {
        budgetId,
        alertedThresholds: [threshold],
        lastAlertDate: today,
      });
    }

    void this.save();
  }

  async reset(budgetId: string): Promise<void> {
    this.alertStates.delete(budgetId);
    await this.save();
  }

  private async save(): Promise<void> {
    try {
      const states = Array.from(this.alertStates.values());
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(states));
    } catch (error) {
      logger.error('Error saving alert states', error);
    }
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }
}
