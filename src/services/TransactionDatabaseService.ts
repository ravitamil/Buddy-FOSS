import {StorageService} from './storage';
import {SplitDetail, Transaction} from '../types';
import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('TransactionDatabaseService');

type JsonValue = string | number | boolean | null | JsonValue[] | {[key: string]: JsonValue};

type TransactionCategoryInput = string | {id?: unknown};

interface TransactionWithRuntimeCategory extends Omit<Transaction, 'category'> {
  category: TransactionCategoryInput;
}

interface UnifiedTransactionDbRow {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string | null;
  date: string;
  type: Transaction['type'];
  group_id: string | null;
  paid_by: string;
  received_by: string[] | null;
  split_method: Transaction['splitMethod'] | null;
  split_among: JsonValue;
  split_amounts: JsonValue;
  split_details: JsonValue;
  is_settlement: boolean;
  settled_debts: JsonValue;
  settled_debt_amounts: JsonValue;
  receipt_url: string | null | undefined;
  receipt_urls: string[];
  notes: string | undefined;
  transaction_currency: string | null;
  fx_rate_applied: number | null;
  loan_id?: string | null;
  subscription_id?: string | null;
  savings_goal_id?: string | null;
  wallet_id?: string | null;
  tags?: JsonValue;
  is_recurring: boolean | undefined;
  recurrence_frequency: Transaction['recurrenceFrequency'] | undefined;
  updated_at: string;
}

interface CategoryJoinRow {
  id?: string | null;
  name?: string | null;
  icon?: string | null;
  color?: string | null;
  type?: string | null;
  is_default?: boolean | null;
}

interface TransactionSelectRow {
  id: string;
  user_id?: string | null;
  amount: number;
  description: string;
  category_id?: string | null;
  date: string;
  type: Transaction['type'];
  group_id?: string | null;
  paid_by?: string | null;
  received_by?: string[] | null;
  split_method?: Transaction['splitMethod'] | null;
  split_among?: unknown;
  split_amounts?: unknown;
  split_details?: unknown;
  is_settlement?: boolean | null;
  settled_debts?: unknown;
  settled_debt_amounts?: unknown;
  receipt_url?: string | null;
  receipt_urls?: string[] | null;
  notes?: string;
  transaction_currency?: string | null;
  fx_rate_applied?: number | null;
  loan_id?: string | null;
  subscription_id?: string | null;
  savings_goal_id?: string | null;
  wallet_id?: string | null;
  tags?: unknown;
  is_recurring?: boolean;
  recurrence_frequency?: Transaction['recurrenceFrequency'] | null;
  updated_at: string;
  categories?: CategoryJoinRow | CategoryJoinRow[] | null;
}

interface TransactionIdRow {
  id: string;
}

// Helper functions
function serializeJsonField<T>(value: T | undefined): JsonValue {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getCategoryObjectId(category: TransactionCategoryInput): string | undefined {
  if (!isObject(category)) return undefined;
  return typeof category.id === 'string' ? category.id : undefined;
}

function normalizeSplitDetails(splitDetails: SplitDetail[] | undefined): SplitDetail[] | undefined {
  return splitDetails?.map((detail) => ({
    ...detail,
    settledDate: detail.settledDate ? new Date(detail.settledDate) : undefined,
  }));
}

function getCategoryIdForDb(tx: Transaction): string | null {
  // Settlement/payment transactions have no category — always null
  if (tx.isSettlement) {
    return null;
  }

  let categoryId = tx.categoryId;
  if (!categoryId) {
    const category = (tx as TransactionWithRuntimeCategory).category;
    if (typeof category === 'string') {
      categoryId = category;
    } else {
      categoryId = getCategoryObjectId(category);
    }
  }
  // Never return 'uncategorized' — that's not a valid FK value
  if (categoryId === 'uncategorized') return null;
  return categoryId || null;
}

function mapToDbRow(userId: string, tx: Transaction): UnifiedTransactionDbRow {
  return {
    id: tx.id,
    user_id: userId,
    amount: tx.amount,
    description: tx.description,
    category_id: getCategoryIdForDb(tx),
    date: tx.date,
    type: tx.type,
    group_id: tx.groupId || null,
    paid_by: tx.paidBy || userId,
    received_by: tx.receivedBy
      ? Array.isArray(tx.receivedBy)
        ? tx.receivedBy
        : [tx.receivedBy]
      : null,
    split_method: tx.splitMethod || null,
    split_among: serializeJsonField(tx.splitAmong),
    split_amounts: serializeJsonField(tx.splitAmounts),
    split_details: serializeJsonField(tx.splitDetails),
    is_settlement: tx.isSettlement ?? false,
    settled_debts: serializeJsonField(tx.settledDebts),
    settled_debt_amounts: serializeJsonField(tx.settledDebtAmounts),
    receipt_url:
      tx.receiptUrl || (tx.receiptUrls && tx.receiptUrls.length > 0 ? tx.receiptUrls[0] : null),
    receipt_urls: tx.receiptUrls || (tx.receiptUrl ? [tx.receiptUrl] : []),
    notes: tx.notes,
    transaction_currency: tx.transactionCurrency || null,
    fx_rate_applied: typeof tx.fxRateApplied === 'number' ? tx.fxRateApplied : null,
    loan_id: tx.loanId || null,
    subscription_id: tx.subscriptionId || null,
    savings_goal_id: tx.savingsGoalId || null,
    wallet_id: tx.walletId || null,
    tags: serializeJsonField(tx.tags),
    is_recurring: tx.isRecurring,
    recurrence_frequency: tx.recurrenceFrequency,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transaction Database Service
 * Handles unified transaction persistence and synchronization using Supabase PostgreSQL
 */
export const transactionDatabaseService = {
  async saveTransactions(userId: string, transactions: Transaction[]): Promise<void> {
    try {
      if (transactions.length === 0) return;

      const existing = await StorageService.getTransactions();
      const map = new Map<string, Transaction>(existing.map((tx) => [tx.id, tx]));

      for (const tx of transactions) {
        map.set(tx.id, {
          ...tx,
          paidBy: tx.paidBy || userId,
          lastModified: new Date(),
        });
      }

      await StorageService.saveTransactions(Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving transactions:', error);
      throw error;
    }
  },

  async getTransactions(
    userId: string,
    options?: {groupId?: string; personalOnly?: boolean},
  ): Promise<Transaction[]> {
    try {
      let list = await StorageService.getTransactions();

      if (options?.groupId) {
        list = list.filter((tx) => tx.groupId === options.groupId);
      } else if (options?.personalOnly) {
        list = list.filter((tx) => !tx.groupId);
      }

      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      logger.error('Error getting transactions:', error);
      throw error;
    }
  },

  mapTransaction(row: unknown): Transaction {
    const txRow = row as TransactionSelectRow;
    const categoryObj = Array.isArray(txRow.categories) ? txRow.categories[0] : txRow.categories;
    const cat = categoryObj || {};
    const splitAmong = parseJsonField<string[] | undefined>(txRow.split_among, undefined);
    const splitAmounts = parseJsonField<Record<string, number> | undefined>(
      txRow.split_amounts,
      undefined,
    );
    const splitDetailsRaw = parseJsonField<SplitDetail[] | undefined>(
      txRow.split_details,
      undefined,
    );
    const settledDebts = parseJsonField<string[] | undefined>(txRow.settled_debts, undefined);
    const settledDebtAmounts = parseJsonField<Record<string, number> | undefined>(
      txRow.settled_debt_amounts,
      undefined,
    );
    const splitDetails = normalizeSplitDetails(splitDetailsRaw);
    const tags = parseJsonField<string[] | undefined>(txRow.tags, undefined);

    return {
      id: txRow.id,
      amount: txRow.amount,
      description: txRow.description,
      category: txRow.is_settlement
        ? 'Settlement'
        : categoryObj && cat.id
          ? cat.id
          : txRow.category_id || 'uncategorized',
      categoryId: cat.id || txRow.category_id || undefined,
      date: txRow.date,
      type: txRow.type,
      groupId: txRow.group_id || undefined,
      paidBy: txRow.paid_by || txRow.user_id || undefined,
      receivedBy: txRow.received_by || undefined,
      splitAmong,
      splitAmounts,
      splitMethod: txRow.split_method || undefined,
      splitDetails,
      isSettlement: !!txRow.is_settlement,
      settledDebts,
      settledDebtAmounts,
      loanId: txRow.loan_id ?? undefined,
      subscriptionId: txRow.subscription_id ?? undefined,
      savingsGoalId: txRow.savings_goal_id ?? undefined,
      walletId: txRow.wallet_id ?? undefined,
      tags,
      receiptUrl: txRow.receipt_url ?? undefined,
      receiptUrls: txRow.receipt_urls || (txRow.receipt_url ? [txRow.receipt_url] : []),
      notes: txRow.notes,
      transactionCurrency: txRow.transaction_currency || undefined,
      fxRateApplied: typeof txRow.fx_rate_applied === 'number' ? txRow.fx_rate_applied : undefined,
      isRecurring: txRow.is_recurring,
      recurrenceFrequency: txRow.recurrence_frequency ?? undefined,
      lastModified: new Date(txRow.updated_at),
    };
  },

  async deleteTransaction(_userId: string, id: string): Promise<void> {
    try {
      const existing = await StorageService.getTransactions();
      await StorageService.saveTransactions(existing.filter((tx) => tx.id !== id));
    } catch (error) {
      logger.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async pruneGroupTransactions(
    _userId: string,
    groupId: string,
    keepTransactionIds: string[],
  ): Promise<void> {
    try {
      const keepSet = new Set(keepTransactionIds);
      const existing = await StorageService.getTransactions();
      const remaining = existing.filter((tx) => tx.groupId !== groupId || keepSet.has(tx.id));
      await StorageService.saveTransactions(remaining);
    } catch (error) {
      logger.error('Error pruning group transactions:', error);
      throw error;
    }
  },
};
