import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import {RecurringTransactionService} from './RecurringTransactionService';
import {StorageService} from './storage';
import {Platform} from 'react-native';

const RECURRING_TRANSACTIONS_TASK = 'recurring-transactions-task';
const TASK_INTERVAL_MINUTES = 60; // Check every hour

export class BackgroundTaskService {
  private static instance: BackgroundTaskService;
  private recurringService: RecurringTransactionService;
  private isInitialized = false;

  private constructor() {
    this.recurringService = RecurringTransactionService.getInstance();
  }

  static getInstance(): BackgroundTaskService {
    if (!BackgroundTaskService.instance) {
      BackgroundTaskService.instance = new BackgroundTaskService();
    }
    return BackgroundTaskService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Define the background task
      TaskManager.defineTask(RECURRING_TRANSACTIONS_TASK, async () => {
        try {
          appLogger.debug('Background task: Processing recurring transactions');

          // Process all recurring transactions
          const transactions = await this.recurringService.processRecurringTransactions();

          appLogger.debug(`Processed ${transactions.length} recurring transactions`);

          // Update last run timestamp
          await StorageService.saveRecurringMetadata({
            lastRecurringTaskRun: new Date().toISOString(),
          });

          return BackgroundTask.BackgroundTaskResult.Success;
        } catch (error) {
          appLogger.error('Background task error:', error);
          return BackgroundTask.BackgroundTaskResult.Failed;
        }
      });

      // Register the background task
      await BackgroundTask.registerTaskAsync(RECURRING_TRANSACTIONS_TASK, {
        minimumInterval: TASK_INTERVAL_MINUTES * 60, // Convert to seconds
      });

      this.isInitialized = true;
      appLogger.debug('Background task service initialized');
    } catch (error) {
      appLogger.error('Failed to initialize background task service:', error);
      throw error;
    }
  }

  async unregisterTask(): Promise<void> {
    try {
      await BackgroundTask.unregisterTaskAsync(RECURRING_TRANSACTIONS_TASK);
      this.isInitialized = false;
      appLogger.debug('Background task unregistered');
    } catch (error) {
      appLogger.error('Failed to unregister background task:', error);
      throw error;
    }
  }

  async isTaskRegistered(): Promise<boolean> {
    try {
      return await TaskManager.isTaskRegisteredAsync(RECURRING_TRANSACTIONS_TASK);
    } catch (error) {
      appLogger.error('Failed to check task registration:', error);
      return false;
    }
  }

  async getTaskStatus(): Promise<BackgroundTask.BackgroundTaskStatus | null> {
    try {
      return await BackgroundTask.getStatusAsync();
    } catch (error) {
      appLogger.error('Failed to get task status:', error);
      return null;
    }
  }

  async getLastRunTime(): Promise<Date | null> {
    try {
      const metadata = await StorageService.getRecurringMetadata();
      return metadata.lastRecurringTaskRun ? new Date(metadata.lastRecurringTaskRun) : null;
    } catch (error) {
      appLogger.error('Failed to get last run time:', error);
      return null;
    }
  }

  // Manual trigger for testing
  async triggerTask(): Promise<void> {
    try {
      appLogger.debug('Manually triggering recurring transactions task');

      // Process all recurring transactions
      const transactions = await this.recurringService.processRecurringTransactions();

      appLogger.debug(`Processed ${transactions.length} recurring transactions`);

      // Update last run timestamp
      await StorageService.saveRecurringMetadata({lastRecurringTaskRun: new Date().toISOString()});

      appLogger.debug('Manual task trigger completed');
    } catch (error) {
      appLogger.error('Manual task trigger failed:', error);
      throw error;
    }
  }
}
