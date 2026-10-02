import {walletDatabaseService} from '@/services/WalletDatabaseService';
import type {Wallet} from './types';
import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('WalletService');

const normalizeWallet = (wallet: Wallet): Wallet => ({
  ...wallet,
  lastUpdated: wallet.lastUpdated
    ? wallet.lastUpdated instanceof Date
      ? wallet.lastUpdated
      : new Date(wallet.lastUpdated)
    : undefined,
});

export const walletService = {
  async getAll(userId?: string): Promise<Wallet[]> {
    if (!userId) return [];
    const cloudWallets = await walletDatabaseService.getWallets(userId);
    return cloudWallets.map(normalizeWallet);
  },

  async seedDefaults(userId: string): Promise<Wallet[]> {
    if (!userId) throw new Error('Authentication required');
    const seeded = await walletDatabaseService.seedDefaultWallets(userId);
    return seeded.map(normalizeWallet);
  },

  async create(userId: string, wallet: Omit<Wallet, 'id'>): Promise<Wallet> {
    if (!userId) throw new Error('Authentication required');

    try {
      const created = await walletDatabaseService.createWallet(userId, wallet);
      return normalizeWallet(created);
    } catch (error) {
      logger.error('Failed to create wallet in cloud:', error);
      throw error;
    }
  },

  async update(userId: string, id: string, updates: Partial<Wallet>): Promise<Wallet> {
    if (!userId) throw new Error('Authentication required');

    try {
      const updated = await walletDatabaseService.updateWallet(userId, id, updates);
      return normalizeWallet(updated);
    } catch (error) {
      logger.error('Failed to update wallet in cloud:', error);
      throw error;
    }
  },

  async delete(userId: string, id: string): Promise<string> {
    if (!userId) throw new Error('Authentication required');

    try {
      await walletDatabaseService.deleteWallet(userId, id);
      return id;
    } catch (error) {
      logger.error('Failed to delete wallet from cloud:', error);
      throw error;
    }
  },
};
