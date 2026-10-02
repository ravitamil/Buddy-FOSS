import {Transaction, RecurrenceFrequency} from '../types';
import {StorageService} from './storage';
import dayjs from 'dayjs';
import {addMonths, addYears} from '../utils/dateUtils';

export interface RecurringTransactionTemplate {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  recurrenceFrequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrenceDate: string;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  lastProcessedDate?: string;
  notes?: string;

  // Group expense support
  groupId?: string;
  groupName?: string;
  groupEmoji?: string;
  splitMethod?: 'equal' | 'custom' | 'percentage' | 'shares';
  groupMemberIds?: string[];
  paidBy?: string;
}

export interface RecurringTransactionConfig {
  enabled: boolean;
  checkInterval: number; // Check interval in milliseconds
  maxFutureTransactions: number; // Maximum number of future transactions to create
}

export class RecurringTransactionService {
  private static instance: RecurringTransactionService;
  private config: RecurringTransactionConfig;
  private processingInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      checkInterval: 60 * 60 * 1000, // Check every hour
      maxFutureTransactions: 12, // Create up to 12 future transactions
    };
  }

  static getInstance(): RecurringTransactionService {
    if (!RecurringTransactionService.instance) {
      RecurringTransactionService.instance = new RecurringTransactionService();
    }
    return RecurringTransactionService.instance;
  }

  /**
   * Get all recurring transaction templates
   */
  async getRecurringTemplates(): Promise<RecurringTransactionTemplate[]> {
    try {
      return await StorageService.getRecurringTemplates();
    } catch (error) {
      appLogger.error('Error getting recurring templates:', error);
      return [];
    }
  }

  /**
   * Save recurring transaction template
   */
  async saveRecurringTemplate(template: RecurringTransactionTemplate): Promise<void> {
    try {
      const templates = await this.getRecurringTemplates();
      const existingIndex = templates.findIndex((t) => t.id === template.id);

      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }

      await StorageService.saveRecurringTemplates(templates);
    } catch (error) {
      appLogger.error('Error saving recurring template:', error);
      throw error;
    }
  }

  /**
   * Delete recurring transaction template
   */
  async deleteRecurringTemplate(templateId: string): Promise<void> {
    try {
      const templates = await this.getRecurringTemplates();
      const filteredTemplates = templates.filter((t) => t.id !== templateId);
      await StorageService.saveRecurringTemplates(filteredTemplates);
    } catch (error) {
      appLogger.error('Error deleting recurring template:', error);
      throw error;
    }
  }

  /**
   * Calculate next occurrence date based on frequency
   */
  calculateNextOccurrence(date: string, frequency: RecurrenceFrequency): string {
    const nextDate = dayjs(date);

    switch (frequency) {
      case 'daily':
        return nextDate.add(1, 'day').format('YYYY-MM-DD');
      case 'biweekly':
        return nextDate.add(14, 'day').format('YYYY-MM-DD');
      case 'monthly':
        return nextDate.add(1, 'month').format('YYYY-MM-DD');
      case 'quarterly':
        return nextDate.add(3, 'month').format('YYYY-MM-DD');
      case 'semiannually':
        return nextDate.add(6, 'month').format('YYYY-MM-DD');
      case 'annually':
        return nextDate.add(1, 'year').format('YYYY-MM-DD');
      case 'once':
      default:
        return date;
    }
  }

  /**
   * Check if a recurring transaction should be processed
   */
  shouldProcessRecurring(template: RecurringTransactionTemplate): boolean {
    if (!template.isActive || template.recurrenceFrequency === 'once') {
      return false;
    }

    const now = dayjs();
    const nextOccurrence = dayjs(template.nextOccurrenceDate);

    // Check if we've reached or passed the next occurrence date
    if (now.isSame(nextOccurrence, 'day') || now.isAfter(nextOccurrence, 'day')) {
      // Check if we haven't exceeded the end date
      if (
        !template.endDate ||
        now.isSame(dayjs(template.endDate), 'day') ||
        now.isBefore(dayjs(template.endDate), 'day')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Process recurring transactions and create new instances
   */
  async processRecurringTransactions(): Promise<Transaction[]> {
    if (!this.config.enabled) {
      return [];
    }

    try {
      const templates = await this.getRecurringTemplates();
      const newTransactions: Transaction[] = [];
      const now = dayjs();

      for (const template of templates) {
        if (this.shouldProcessRecurring(template)) {
          // Create new transaction instance
          const newTransaction: Transaction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            amount: template.amount,
            category: template.category,
            description: template.description,
            date: now.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            type: template.type,
            isRecurring: true,
            parentRecurringId: template.id,
            recurrenceFrequency: template.recurrenceFrequency,
            nextOccurrenceDate: this.calculateNextOccurrence(
              template.nextOccurrenceDate,
              template.recurrenceFrequency,
            ),
            // Group expense fields
            groupId: template.groupId,
            groupName: template.groupName,
            groupEmoji: template.groupEmoji,
            splitMethod: template.splitMethod,
            paidBy: template.paidBy,
          };

          newTransactions.push(newTransaction);

          // Update template with next occurrence date
          template.lastProcessedDate = now.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
          template.nextOccurrenceDate = this.calculateNextOccurrence(
            template.nextOccurrenceDate,
            template.recurrenceFrequency,
          );

          // Check if we've exceeded the end date
          if (
            template.endDate &&
            dayjs(template.nextOccurrenceDate).isAfter(dayjs(template.endDate), 'day')
          ) {
            template.isActive = false;
          }

          await this.saveRecurringTemplate(template);
        }
      }

      return newTransactions;
    } catch (error) {
      appLogger.error('Error processing recurring transactions:', error);
      return [];
    }
  }

  /**
   * Create a new recurring transaction template from a transaction
   */
  async createRecurringTemplate(
    transaction: Omit<Transaction, 'id'>,
    frequency: RecurrenceFrequency,
    endDate?: string,
  ): Promise<RecurringTransactionTemplate> {
    const now = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const template: RecurringTransactionTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      recurrenceFrequency: frequency,
      startDate: transaction.date,
      endDate,
      nextOccurrenceDate: this.calculateNextOccurrence(transaction.date, frequency),
      isActive: true,
      createdAt: now,
      lastModified: now,
    };

    await this.saveRecurringTemplate(template);
    return template;
  }

  /**
   * Update recurring template settings
   */
  async updateRecurringTemplate(
    templateId: string,
    updates: Partial<RecurringTransactionTemplate>,
  ): Promise<void> {
    const templates = await this.getRecurringTemplates();
    const templateIndex = templates.findIndex((t) => t.id === templateId);

    if (templateIndex === -1) {
      throw new Error('Recurring template not found');
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
    };

    await StorageService.saveRecurringTemplates(templates);
  }

  /**
   * Get all active recurring templates
   */
  async getActiveRecurringTemplates(): Promise<RecurringTransactionTemplate[]> {
    const templates = await this.getRecurringTemplates();
    return templates.filter((t) => t.isActive && t.recurrenceFrequency !== 'once');
  }

  /**
   * Pause a recurring template
   */
  async pauseRecurringTemplate(templateId: string): Promise<void> {
    await this.updateRecurringTemplate(templateId, {isActive: false});
  }

  /**
   * Resume a recurring template
   */
  async resumeRecurringTemplate(templateId: string): Promise<void> {
    const templates = await this.getRecurringTemplates();
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error('Recurring template not found');
    }

    // Recalculate next occurrence date from now
    const now = dayjs();
    const nextOccurrence = this.calculateNextOccurrence(
      now.format('YYYY-MM-DD'),
      template.recurrenceFrequency,
    );

    await this.updateRecurringTemplate(templateId, {
      isActive: true,
      nextOccurrenceDate: nextOccurrence,
    });
  }

  /**
   * Start automatic processing of recurring transactions
   */
  startAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      void this.processRecurringTransactions().catch((error) => {
        appLogger.error('Error in auto-processing recurring transactions:', error);
      });
    }, this.config.checkInterval);
  }

  /**
   * Stop automatic processing
   */
  stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Get statistics about recurring transactions
   */
  async getRecurringStats(): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    pausedTemplates: number;
    totalProcessed: number;
  }> {
    const templates = await this.getRecurringTemplates();
    const activeTemplates = templates.filter((t) => t.isActive);
    const pausedTemplates = templates.filter((t) => !t.isActive);

    // Count processed transactions by checking for lastProcessedDate
    const processedTemplates = templates.filter((t) => t.lastProcessedDate);

    return {
      totalTemplates: templates.length,
      activeTemplates: activeTemplates.length,
      pausedTemplates: pausedTemplates.length,
      totalProcessed: processedTemplates.length,
    };
  }

  /**
   * Clean up expired recurring templates
   */
  async cleanupExpiredTemplates(): Promise<number> {
    const templates = await this.getRecurringTemplates();
    const now = dayjs();

    const expiredTemplates = templates.filter((t) => {
      if (!t.endDate) return false;
      return dayjs(t.endDate).isBefore(now, 'day');
    });

    for (const template of expiredTemplates) {
      await this.deleteRecurringTemplate(template.id);
    }

    return expiredTemplates.length;
  }
}
