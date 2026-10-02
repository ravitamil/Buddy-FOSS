import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import type {SubscriptionData} from '../types/finance.types';
import type {LoanData} from '../types/loan.types';
import {calculateMaturityDate} from '@/features/loans/calculations';
import appLogger from './LoggerService';
import type {
  PaymentStats,
  RecordLoanPaymentFunction,
  RecordSubscriptionPaymentFunction,
  ScheduledPayment,
} from './autoTransaction/autoTransactionTypes';
import {
  buildScheduledPayments,
  createLoanPaymentPayload,
  createPaymentStats,
  createSubscriptionPaymentPayload,
  emptyPaymentStats,
  getProcessedPaymentKey,
  isPaymentDue,
  isUpcomingPayment,
  parseScheduledPayments,
} from './autoTransaction/autoTransactionUtils';
import {isCachedFeatureActionAllowed} from '@/features/featureControls/runtime';

export class AutoTransactionService {
  private static readonly SCHEDULED_PAYMENTS_KEY = '@BuddyApp:scheduledPayments';
  private static readonly LAST_PROCESSED_KEY = '@BuddyApp:lastProcessedDate';
  private static recordLoanPaymentFunction: RecordLoanPaymentFunction | null = null;
  private static recordSubscriptionPaymentFunction: RecordSubscriptionPaymentFunction | null = null;
  private static subscriptions: SubscriptionData[] = [];
  private static loans: LoanData[] = [];

  static setPaymentSources(subscriptions: SubscriptionData[], loans: LoanData[]): void {
    this.subscriptions = subscriptions;
    this.loans = loans;
  }

  static setRecordLoanPaymentFunction(recordLoanPaymentFn: RecordLoanPaymentFunction): void {
    this.recordLoanPaymentFunction = recordLoanPaymentFn;
    appLogger.debug('AutoTransactionService: Loan payment function registered');
  }

  static setRecordSubscriptionPaymentFunction(
    recordSubscriptionPaymentFn: RecordSubscriptionPaymentFunction,
  ): void {
    this.recordSubscriptionPaymentFunction = recordSubscriptionPaymentFn;
  }

  static async initialize(signal?: AbortSignal): Promise<void> {
    appLogger.debug('AutoTransactionService: Initializing');
    try {
      if (signal?.aborted) return;
      await this.processScheduledPayments(signal);
      if (signal?.aborted) return;
      await this.updateScheduledPayments(signal);
    } catch (error) {
      appLogger.error('AutoTransactionService: Error during initialization:', error);
    }
  }

  static async processScheduledPayments(signal?: AbortSignal): Promise<void> {
    appLogger.debug('AutoTransactionService: Processing scheduled payments');

    try {
      const today = dayjs();
      const todayStr = today.format('YYYY-MM-DD');
      const subscriptions = this.subscriptions;
      const loans = this.loans;
      let transactionsGenerated = 0;

      for (const subscription of subscriptions) {
        if (signal?.aborted) return;
        const processed = await this.processSubscriptionIfDue(subscription, today, todayStr);
        if (processed) transactionsGenerated++;
      }

      for (const loan of loans) {
        if (signal?.aborted) return;
        const processed = await this.processLoanIfDue(loan, today, todayStr);
        if (processed) transactionsGenerated++;
      }

      appLogger.debug(
        `AutoTransactionService: Generated ${transactionsGenerated} automatic transactions`,
      );
      if (!signal?.aborted) {
        await AsyncStorage.setItem(this.LAST_PROCESSED_KEY, todayStr);
      }
    } catch (error) {
      appLogger.error('AutoTransactionService: Error processing scheduled payments:', error);
    }
  }

  static async updateScheduledPayments(signal?: AbortSignal): Promise<void> {
    appLogger.debug('AutoTransactionService: Updating scheduled payments');

    try {
      const subscriptions = this.subscriptions;
      const loans = this.loans;
      const scheduledPayments = buildScheduledPayments({subscriptions, loans});

      if (signal?.aborted) return;
      await AsyncStorage.setItem(this.SCHEDULED_PAYMENTS_KEY, JSON.stringify(scheduledPayments));
      appLogger.debug(
        `AutoTransactionService: Updated ${scheduledPayments.length} scheduled payments`,
      );
    } catch (error) {
      appLogger.error('AutoTransactionService: Error updating scheduled payments:', error);
    }
  }

  static async getScheduledPayments(): Promise<ScheduledPayment[]> {
    try {
      const data = await AsyncStorage.getItem(this.SCHEDULED_PAYMENTS_KEY);
      return parseScheduledPayments(data);
    } catch (error) {
      appLogger.error('AutoTransactionService: Error getting scheduled payments:', error);
      return [];
    }
  }

  static async getUpcomingPayments(): Promise<ScheduledPayment[]> {
    try {
      const allPayments = await this.getScheduledPayments();
      const today = dayjs();

      return allPayments
        .filter((payment) => isUpcomingPayment(payment, today))
        .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
    } catch (error) {
      appLogger.error('AutoTransactionService: Error getting upcoming payments:', error);
      return [];
    }
  }

  static async clearProcessedRecords(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const processedKeys = keys.filter((key) => key.startsWith('@processed_'));
      await AsyncStorage.multiRemove(processedKeys);
      appLogger.debug(`AutoTransactionService: Cleared ${processedKeys.length} processed records`);
    } catch (error) {
      appLogger.error('AutoTransactionService: Error clearing processed records:', error);
    }
  }

  static async manualProcessPayments(): Promise<void> {
    appLogger.debug('AutoTransactionService: Manual processing triggered');
    await this.processScheduledPayments();
    await this.updateScheduledPayments();
  }

  static async getPaymentStats(): Promise<PaymentStats> {
    try {
      const [scheduledPayments, upcomingPayments, lastProcessedDate] = await Promise.all([
        this.getScheduledPayments(),
        this.getUpcomingPayments(),
        AsyncStorage.getItem(this.LAST_PROCESSED_KEY),
      ]);

      return createPaymentStats({scheduledPayments, upcomingPayments, lastProcessedDate});
    } catch (error) {
      appLogger.error('AutoTransactionService: Error getting payment stats:', error);
      return emptyPaymentStats();
    }
  }

  private static async processSubscriptionIfDue(
    subscription: SubscriptionData,
    today: dayjs.Dayjs,
    todayStr: string,
  ): Promise<boolean> {
    if (!(await isCachedFeatureActionAllowed('subscriptions.autoGenerate'))) {
      appLogger.debug('AutoTransactionService: subscription auto-generation disabled');
      return false;
    }

    if (
      subscription.status !== 'active' ||
      !subscription.autoPayEnabled ||
      !isPaymentDue(subscription.nextBilling, today) ||
      (await this.isAlreadyProcessed(subscription.id, todayStr))
    ) {
      return false;
    }

    await this.generateSubscriptionTransaction(subscription);
    await this.markAsProcessed(subscription.id, todayStr);
    return true;
  }

  private static async processLoanIfDue(
    loan: LoanData,
    today: dayjs.Dayjs,
    todayStr: string,
  ): Promise<boolean> {
    if (!(await isCachedFeatureActionAllowed('loans.autoRecordPayment'))) {
      appLogger.debug('AutoTransactionService: loan auto-recording disabled');
      return false;
    }

    if (
      loan.currentOutstanding <= 0 ||
      loan.status !== 'ACTIVE' ||
      !loan.autoPayEnabled ||
      !isPaymentDue(loan.nextEmiDate, today) ||
      (await this.isAlreadyProcessed(loan.id, todayStr))
    ) {
      return false;
    }

    await this.generateLoanTransaction(loan);
    await this.markAsProcessed(loan.id, todayStr);
    return true;
  }

  private static async generateSubscriptionTransaction(
    subscription: SubscriptionData,
  ): Promise<void> {
    appLogger.debug(
      `AutoTransactionService: Generating subscription transaction for ${subscription.name}`,
    );

    try {
      if (this.recordSubscriptionPaymentFunction) {
        await this.recordSubscriptionPaymentFunction(
          subscription.id,
          createSubscriptionPaymentPayload(subscription),
        );
      } else {
        throw new Error('Subscription payment function is not registered');
      }

      appLogger.debug(
        `AutoTransactionService: Generated subscription transaction for ${subscription.name}`,
      );
    } catch (error) {
      appLogger.error(
        `AutoTransactionService: Error generating subscription transaction for ${subscription.name}:`,
        error,
      );
      throw error;
    }
  }

  private static async generateLoanTransaction(loan: LoanData): Promise<void> {
    appLogger.debug(`AutoTransactionService: Generating loan transaction for ${loan.name}`);

    try {
      if (this.isLoanMatured(loan)) {
        await this.recordFinalLoanPayment(loan);
        return;
      }

      if (this.recordLoanPaymentFunction) {
        await this.recordLoanPaymentFunction(
          loan.id,
          createLoanPaymentPayload(loan, 'Auto-tracked EMI payment'),
        );
        appLogger.debug(
          `AutoTransactionService: Recorded loan payment via AppContext for ${loan.name}`,
        );
      } else {
        throw new Error('Loan payment function is not registered');
      }

      appLogger.debug(`AutoTransactionService: Generated loan transaction for ${loan.name}`);
    } catch (error) {
      appLogger.error(
        `AutoTransactionService: Error generating loan transaction for ${loan.name}:`,
        error,
      );
      throw error;
    }
  }

  private static async recordFinalLoanPayment(loan: LoanData): Promise<void> {
    if (!this.recordLoanPaymentFunction) return;

    await this.recordLoanPaymentFunction(
      loan.id,
      createLoanPaymentPayload(loan, 'Auto-tracked final EMI payment'),
    );
    appLogger.debug(
      `AutoTransactionService: Recorded final loan payment via AppContext for ${loan.name}`,
    );
    appLogger.debug(
      `AutoTransactionService: Loan ${loan.name} has reached maturity and should be closed`,
    );
  }

  private static isLoanMatured(loan: LoanData): boolean {
    const maturityDate = calculateMaturityDate(loan.startDate, loan.tenure);
    const today = dayjs();
    return today.isSame(dayjs(maturityDate), 'day') || today.isAfter(dayjs(maturityDate), 'day');
  }

  private static async isAlreadyProcessed(sourceId: string, date: string): Promise<boolean> {
    try {
      const result = await AsyncStorage.getItem(getProcessedPaymentKey(sourceId, date));
      return result !== null;
    } catch {
      return false;
    }
  }

  private static async markAsProcessed(sourceId: string, date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(getProcessedPaymentKey(sourceId, date), date);
    } catch (error) {
      appLogger.error('AutoTransactionService: Error marking payment as processed:', error);
    }
  }
}

export default AutoTransactionService;
