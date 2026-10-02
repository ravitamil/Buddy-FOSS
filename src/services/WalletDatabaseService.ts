import type {Wallet} from '@/features/wallets/types';
import {logger as appLogger} from './LoggerService';
import {StorageService} from './storage';

const logger = appLogger.contextLogger('WalletDatabaseService');

export const DEFAULT_WALLETS: Omit<Wallet, 'id'>[] = [
  {
    name: 'Cash',
    type: 'cash',
    balance: 0,
    currency: 'USD',
    color: '#4CAF50',
    icon: 'cash',
    isExcludedFromNetWorth: false,
  },
  {
    name: 'Main Account',
    type: 'bank',
    balance: 0,
    currency: 'USD',
    color: '#2196F3',
    icon: 'bank',
    isExcludedFromNetWorth: false,
  },
];

export const walletDatabaseService = {
  async getWallets(_userId: string): Promise<Wallet[]> {
    try {
      const wallets = await StorageService.getWallets();
      if (wallets && wallets.length > 0) {
        return wallets;
      }
      return await this.seedDefaultWallets(_userId);
    } catch (error) {
      logger.error('Failed to get wallets:', error);
      throw error;
    }
  },

  async createWallet(_userId: string, wallet: Omit<Wallet, 'id'>): Promise<Wallet> {
    try {
      const newWallet: Wallet = {
        ...wallet,
        id: `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        lastUpdated: new Date(),
      };

      const existing = await StorageService.getWallets();
      existing.push(newWallet);
      await StorageService.saveWallets(existing);

      return newWallet;
    } catch (error) {
      logger.error('Failed to create wallet:', error);
      throw error;
    }
  },

  async updateWallet(_userId: string, id: string, updates: Partial<Wallet>): Promise<Wallet> {
    try {
      const existing = await StorageService.getWallets();
      const index = existing.findIndex((w) => w.id === id);

      if (index === -1) {
        throw new Error('Wallet not found');
      }

      const updated: Wallet = {
        ...existing[index],
        ...updates,
        id,
        lastUpdated: new Date(),
      };

      existing[index] = updated;
      await StorageService.saveWallets(existing);

      return updated;
    } catch (error) {
      logger.error('Failed to update wallet:', error);
      throw error;
    }
  },

  async deleteWallet(_userId: string, id: string): Promise<void> {
    try {
      const existing = await StorageService.getWallets();
      await StorageService.saveWallets(existing.filter((w) => w.id !== id));
    } catch (error) {
      logger.error('Failed to delete wallet:', error);
      throw error;
    }
  },

  async syncLocalWallets(_userId: string, localWallets: Wallet[]): Promise<Wallet[]> {
    try {
      if (localWallets.length === 0) return [];
      await StorageService.saveWallets(localWallets);
      return localWallets;
    } catch (error) {
      logger.error('Failed to sync local wallets:', error);
      throw error;
    }
  },

  async seedDefaultWallets(_userId: string, currency: string = 'USD'): Promise<Wallet[]> {
    try {
      const existing = await StorageService.getWallets();
      if (existing.length > 0) return existing;

      const seeded: Wallet[] = DEFAULT_WALLETS.map((w, index) => ({
        ...w,
        id: `wallet_default_${index + 1}`,
        currency,
        lastUpdated: new Date(),
      }));

      await StorageService.saveWallets(seeded);
      return seeded;
    } catch (error) {
      logger.error('Failed to seed default wallets:', error);
      throw error;
    }
  },
};
