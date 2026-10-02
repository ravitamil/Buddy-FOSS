import * as SMS from 'expo-sms';
import appLogger from './LoggerService';

// Alias exported logger instance to match existing call sites

/**
 * SMS Service for handling SMS functionality using expo-sms
 *
 * Note: expo-sms is NOT a config plugin - it's a library for sending SMS messages.
 * It should be imported and used as a service, not configured in app.config.js plugins.
 */
export class SmsService {
  /**
   * Check if SMS is available on the device
   * @returns Promise<boolean> - true if SMS is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      return await SMS.isAvailableAsync();
    } catch (error) {
      appLogger.error('Error checking SMS availability:', error);
      return false;
    }
  }

  /**
   * Send SMS message to recipients
   * @param addresses - Phone number(s) to send to
   * @param message - Message content
   * @param attachments - Optional attachments
   * @returns Promise<SMS.SMSResponse>
   */
  static async sendSMS(
    addresses: string | string[],
    message: string,
    attachments?: SMS.SMSAttachment | SMS.SMSAttachment[],
  ): Promise<SMS.SMSResponse | null> {
    try {
      // Check if SMS is available first
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        appLogger.warn('SMS is not available on this device');
        return null;
      }

      // Prepare options
      const options: SMS.SMSOptions = {};
      if (attachments) {
        options.attachments = attachments;
      }

      // Send SMS
      const result = await SMS.sendSMSAsync(addresses, message, options);

      appLogger.debug('SMS sent with result:', result);
      return result;
    } catch (error) {
      appLogger.error('Error sending SMS:', error);
      return null;
    }
  }

  /**
   * Send transaction notification SMS
   * @param phoneNumber - Recipient phone number
   * @param transactionDetails - Transaction information
   */
  static async sendTransactionNotification(
    phoneNumber: string,
    transactionDetails: {
      amount: number;
      type: 'income' | 'expense';
      category: string;
      description?: string;
    },
  ): Promise<SMS.SMSResponse | null> {
    const {amount, type, category, description} = transactionDetails;

    const message = `
Buddy Transaction Alert
${type === 'income' ? '💰' : '💸'} ${type.toUpperCase()}: $${amount.toFixed(2)}
📂 Category: ${category}
${description ? `📝 Note: ${description}` : ''}
    `.trim();

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send budget alert SMS
   * @param phoneNumber - Recipient phone number
   * @param budgetInfo - Budget alert information
   */
  static async sendBudgetAlert(
    phoneNumber: string,
    budgetInfo: {
      category: string;
      spent: number;
      limit: number;
      percentage: number;
    },
  ): Promise<SMS.SMSResponse | null> {
    const {category, spent, limit, percentage} = budgetInfo;

    const message = `
⚠️ Buddy Budget Alert
📂 ${category}
💸 Spent: $${spent.toFixed(2)} / $${limit.toFixed(2)}
📊 ${percentage.toFixed(1)}% of budget used
${percentage >= 90 ? '🚨 Budget almost exceeded!' : percentage >= 75 ? '⚠️ Approaching budget limit' : ''}
    `.trim();

    return await this.sendSMS(phoneNumber, message);
  }
}

/**
 * Example usage:
 *
 * // Check availability
 * const available = await SmsService.isAvailable();
 *
 * // Send simple SMS
 * const result = await SmsService.sendSMS(
 *   '+1234567890',
 *   'Hello from Buddy!'
 * );
 *
 * // Send transaction notification
 * await SmsService.sendTransactionNotification('+1234567890', {
 *   amount: 25.50,
 *   type: 'expense',
 *   category: 'Food',
 *   description: 'Lunch at cafe'
 * });
 *
 * // Send budget alert
 * await SmsService.sendBudgetAlert('+1234567890', {
 *   category: 'Groceries',
 *   spent: 450,
 *   limit: 500,
 *   percentage: 90
 * });
 */
