import {
  Transaction,
  Category,
  SpendingLimit,
  SavingsGoal,
  Investment,
  InvestmentCategory,
  InvestmentHistory,
  Portfolio,
  RecurringTransaction,
  RecurringTransactionTemplate,
} from '../types';
import {EnhancedGroup} from '@/features/groups/types';
import type {Wallet} from '@/features/wallets/types';
import {logger as appLogger} from './LoggerService';
import {getDefaultCategories, getDefaultInvestmentCategories} from './storage/defaultStorageData';
import {
  deleteStorageKey,
  deleteStorageKeys,
  readJson,
  writeJson,
} from './storage/secureJsonStorage';
import {
  ALL_DATA_WITH_PREFERENCES_KEYS,
  getCachedProfileKey,
  SESSION_DATA_KEYS,
  STORAGE_KEYS,
  USER_DATA_KEYS,
} from './storage/storageKeys';
import {
  AuthData,
  CachedProfile,
  PaginatedStorageResult,
  RecurringMetadata,
  UserPreferences,
} from './storage/storageTypes';

const logger = appLogger.serviceLogger('StorageService');

export class StorageService {
  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    await writeJson(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  static async getTransactions(): Promise<Transaction[]> {
    logger.operation('getTransactions');
    const result = await readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    logger.info('Transactions retrieved', {count: result.length});
    return result;
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    await writeJson(STORAGE_KEYS.CATEGORIES, categories);
  }

  static async getCategories(): Promise<Category[]> {
    logger.operation('getCategories');
    const result = await readJson<Category[]>(STORAGE_KEYS.CATEGORIES, getDefaultCategories());
    logger.info('Categories retrieved', {count: result.length});
    return result;
  }

  static async saveSpendingLimits(limits: SpendingLimit[]): Promise<void> {
    await writeJson(STORAGE_KEYS.SPENDING_LIMITS, limits);
  }

  static async getSpendingLimits(): Promise<SpendingLimit[]> {
    return readJson<SpendingLimit[]>(STORAGE_KEYS.SPENDING_LIMITS, []);
  }

  static async saveSavingsGoals(goals: SavingsGoal[]): Promise<void> {
    await writeJson(STORAGE_KEYS.SAVINGS_GOALS, goals);
  }

  static async getSavingsGoals(): Promise<SavingsGoal[]> {
    return readJson<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
  }

  static async saveWallets(wallets: Wallet[]): Promise<void> {
    await writeJson(STORAGE_KEYS.WALLETS, wallets);
  }

  static async getWallets(): Promise<Wallet[]> {
    logger.operation('getWallets');
    const result = await readJson<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    logger.info('Wallets retrieved', {count: result.length});
    return result;
  }

  static async saveGroups(groups: EnhancedGroup[]): Promise<void> {
    await writeJson(STORAGE_KEYS.GROUPS, groups);
  }

  static async getGroups(): Promise<EnhancedGroup[]> {
    return readJson<EnhancedGroup[]>(STORAGE_KEYS.GROUPS, []);
  }

  static async saveInvestments(investments: Investment[]): Promise<void> {
    await writeJson(STORAGE_KEYS.INVESTMENTS, investments);
  }

  static async getInvestments(): Promise<Investment[]> {
    logger.operation('getInvestments');
    const result = await readJson<Investment[]>(STORAGE_KEYS.INVESTMENTS, []);
    logger.info('Investments retrieved', {count: result.length});
    return result;
  }

  static async saveInvestmentCategories(categories: InvestmentCategory[]): Promise<void> {
    await writeJson(STORAGE_KEYS.INVESTMENT_CATEGORIES, categories);
  }

  static async getInvestmentCategories(): Promise<InvestmentCategory[]> {
    logger.operation('getInvestmentCategories');
    const result = await readJson<InvestmentCategory[]>(
      STORAGE_KEYS.INVESTMENT_CATEGORIES,
      getDefaultInvestmentCategories(),
    );
    logger.info('Investment categories retrieved', {count: result.length});
    return result;
  }

  static async savePortfolios(portfolios: Portfolio[]): Promise<void> {
    await writeJson(STORAGE_KEYS.PORTFOLIOS, portfolios);
  }

  static async getPortfolios(): Promise<Portfolio[]> {
    logger.operation('getPortfolios');
    const result = await readJson<Portfolio[]>(STORAGE_KEYS.PORTFOLIOS, []);
    logger.info('Portfolios retrieved', {count: result.length});
    return result;
  }

  static async saveInvestmentHistory(history: InvestmentHistory[]): Promise<void> {
    await writeJson(STORAGE_KEYS.INVESTMENT_HISTORY, history);
  }

  static async getInvestmentHistory(): Promise<InvestmentHistory[]> {
    logger.operation('getInvestmentHistory');
    const result = await readJson<InvestmentHistory[]>(STORAGE_KEYS.INVESTMENT_HISTORY, []);
    logger.info('Investment history retrieved', {count: result.length});
    return result;
  }

  static async clearAllData(): Promise<void> {
    await deleteStorageKeys(Object.values(STORAGE_KEYS));
  }

  static async clearUserData(): Promise<void> {
    logger.operation('clearUserData');
    await deleteStorageKeys(USER_DATA_KEYS);
    logger.info('User data cleared successfully');
  }

  static async clearAllDataIncludingPreferences(): Promise<void> {
    logger.operation('clearAllDataIncludingPreferences');
    await deleteStorageKeys(ALL_DATA_WITH_PREFERENCES_KEYS);
    logger.info('All data including preferences cleared successfully');
  }

  static async setCachedProfile(userId: string, profile: CachedProfile): Promise<void> {
    await writeJson(getCachedProfileKey(userId), profile);
  }

  static async getCachedProfile(userId: string): Promise<CachedProfile | null> {
    try {
      return await readJson<CachedProfile | null>(getCachedProfileKey(userId), null);
    } catch {
      return null;
    }
  }

  static async clearCachedProfile(userId: string): Promise<void> {
    await deleteStorageKey(getCachedProfileKey(userId));
  }

  static async clearUserSessionData(): Promise<void> {
    logger.operation('clearUserSessionData');
    await deleteStorageKeys(SESSION_DATA_KEYS);
    logger.info('All user session data cleared successfully');
  }

  static async savePreference(key: keyof UserPreferences, value: string | boolean): Promise<void> {
    const preferences = await this.getPreferences();
    preferences[key] = value;
    await writeJson(STORAGE_KEYS.PREFERENCES, preferences);
  }

  static async getPreferences(): Promise<UserPreferences> {
    logger.operation('getPreferences');
    const result = await readJson<UserPreferences>(STORAGE_KEYS.PREFERENCES, {});
    logger.info('Preferences retrieved', {preferences: result});
    return result;
  }

  static async getPreference(key: keyof UserPreferences): Promise<string | boolean | undefined> {
    const preferences = await this.getPreferences();
    return preferences[key];
  }

  static async saveAuthData(
    authMethod: string | null,
    email: string | null,
    phoneNumber: string | null,
  ): Promise<void> {
    const authData: AuthData = {
      authMethod,
      email,
      phoneNumber,
    };
    await writeJson(STORAGE_KEYS.AUTH_DATA, authData);
  }

  static async getAuthData(): Promise<AuthData> {
    logger.operation('getAuthData');
    const result = await readJson<AuthData>(STORAGE_KEYS.AUTH_DATA, {
      authMethod: null,
      email: null,
      phoneNumber: null,
    });
    logger.info('Auth data retrieved', {authData: result});
    return result;
  }

  static async clearAuthData(): Promise<void> {
    await deleteStorageKey(STORAGE_KEYS.AUTH_DATA);
  }

  static async saveRecurringTransactions(
    recurringTransactions: RecurringTransaction[],
  ): Promise<void> {
    await writeJson(STORAGE_KEYS.RECURRING_TRANSACTIONS, recurringTransactions);
  }

  static async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    logger.operation('getRecurringTransactions');
    const result = await readJson<RecurringTransaction[]>(STORAGE_KEYS.RECURRING_TRANSACTIONS, []);
    logger.info('Recurring transactions retrieved', {count: result.length});
    return result;
  }

  static async saveRecurringTemplates(templates: RecurringTransactionTemplate[]): Promise<void> {
    await writeJson(STORAGE_KEYS.RECURRING_TEMPLATES, templates);
  }

  static async getRecurringTemplates(): Promise<RecurringTransactionTemplate[]> {
    logger.operation('getRecurringTemplates');
    const result = await readJson<RecurringTransactionTemplate[]>(
      STORAGE_KEYS.RECURRING_TEMPLATES,
      [],
    );
    logger.info('Recurring templates retrieved', {count: result.length});
    return result;
  }

  static async saveRecurringMetadata(metadata: RecurringMetadata): Promise<void> {
    await writeJson(STORAGE_KEYS.RECURRING_METADATA, metadata);
  }

  static async getRecurringMetadata(): Promise<RecurringMetadata> {
    logger.operation('getRecurringMetadata');
    const result = await readJson<RecurringMetadata>(STORAGE_KEYS.RECURRING_METADATA, {});
    logger.info('Recurring metadata retrieved', {metadata: result});
    return result;
  }

  static async getPaginatedTransactions(
    page: number,
    pageSize: number = 20,
  ): Promise<PaginatedStorageResult<Transaction>> {
    try {
      return this.paginate(await this.getTransactions(), page, pageSize);
    } catch (error) {
      logger.error('Error getting paginated transactions', error);
      return this.emptyPage();
    }
  }

  static async getPaginatedGroups(
    page: number,
    pageSize: number = 20,
  ): Promise<PaginatedStorageResult<EnhancedGroup>> {
    try {
      return this.paginate(await this.getGroups(), page, pageSize);
    } catch (error) {
      logger.error('Error getting paginated groups', error);
      return this.emptyPage();
    }
  }

  static async getPaginatedInvestments(
    page: number,
    pageSize: number = 20,
  ): Promise<PaginatedStorageResult<Investment>> {
    try {
      return this.paginate(await this.getInvestments(), page, pageSize);
    } catch (error) {
      logger.error('Error getting paginated investments', error);
      return this.emptyPage();
    }
  }

  private static paginate<T>(data: T[], page: number, pageSize: number): PaginatedStorageResult<T> {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      data: data.slice(startIndex, endIndex),
      totalCount: data.length,
      hasNextPage: endIndex < data.length,
      hasPreviousPage: page > 0,
    };
  }

  private static emptyPage<T>(): PaginatedStorageResult<T> {
    return {
      data: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
}
