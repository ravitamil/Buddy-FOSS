import {Investment, Portfolio, InvestmentCategory} from '../types';
import {logger as appLogger} from './LoggerService';
import {StorageService} from './storage';
import {getDefaultInvestmentCategories} from './storage/defaultStorageData';

const logger = appLogger.contextLogger('InvestmentDatabaseService');

/**
 * Investment Database Service
 * Handles offline investment persistence and synchronization locally
 */
export const investmentDatabaseService = {
  async savePortfolios(_userId: string, portfolios: Portfolio[]): Promise<void> {
    try {
      if (portfolios.length === 0) return;

      const existing = await StorageService.getPortfolios();
      const map = new Map<string, Portfolio>(existing.map((p) => [p.id, p]));

      for (const port of portfolios) {
        map.set(port.id, {
          ...port,
          lastUpdated: new Date(),
        });

        if (port.investments && port.investments.length > 0) {
          await this.saveInvestments(
            _userId,
            port.investments.map((inv) => ({...inv, portfolioId: port.id})),
          );
        }
      }

      await StorageService.savePortfolios(Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving portfolios:', error);
      throw error;
    }
  },

  async getPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const portfolios = await StorageService.getPortfolios();
      const allInvestments = await this.getInvestments(userId);

      return portfolios.map((p) => {
        const investments = allInvestments.filter((inv) => inv.portfolioId === p.id);
        const totalValue = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchaseAmount || 0), 0);
        const totalReturns = totalValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

        return {
          ...p,
          investments,
          totalValue,
          totalInvested,
          totalReturns,
          returnPercentage,
          lastUpdated: p.lastUpdated ? new Date(p.lastUpdated) : new Date(),
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        };
      });
    } catch (error) {
      logger.error('Error getting portfolios:', error);
      return [];
    }
  },

  async saveInvestments(
    _userId: string,
    investments: (Investment & {portfolioId?: string})[],
  ): Promise<void> {
    try {
      if (investments.length === 0) return;

      const existing = await StorageService.getInvestments();
      const map = new Map<string, Investment>(existing.map((i) => [i.id, i]));

      for (const inv of investments) {
        map.set(inv.id, {
          ...inv,
          purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate) : new Date(),
          lastUpdated: new Date(),
          createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
        });
      }

      await StorageService.saveInvestments(Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving investments:', error);
      throw error;
    }
  },

  async getInvestments(_userId: string, portfolioId?: string): Promise<Investment[]> {
    try {
      const investments = await StorageService.getInvestments();
      const parsed = investments.map((inv) => ({
        ...inv,
        purchaseDate: new Date(inv.purchaseDate),
        lastUpdated: inv.lastUpdated ? new Date(inv.lastUpdated) : new Date(),
        createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
      }));

      if (portfolioId) {
        return parsed.filter((inv) => inv.portfolioId === portfolioId);
      }
      return parsed;
    } catch (error) {
      logger.error('Error getting investments:', error);
      return [];
    }
  },

  async deleteInvestment(_userId: string, id: string): Promise<void> {
    try {
      const existing = await StorageService.getInvestments();
      const remaining = existing.filter((inv) => inv.id !== id);
      await StorageService.saveInvestments(remaining);
    } catch (error) {
      logger.error('Error deleting investment:', error);
      throw error;
    }
  },

  async saveInvestmentCategories(_userId: string, categories: InvestmentCategory[]): Promise<void> {
    try {
      if (categories.length === 0) return;

      const existing = await StorageService.getInvestmentCategories();
      const map = new Map<string, InvestmentCategory>(existing.map((c) => [c.id, c]));

      for (const cat of categories) {
        map.set(cat.id, cat);
      }

      await StorageService.saveInvestmentCategories(Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving investment categories:', error);
      throw error;
    }
  },

  async deleteInvestmentCategory(_userId: string, categoryId: string): Promise<void> {
    try {
      const existing = await StorageService.getInvestmentCategories();
      const remaining = existing.filter((cat) => cat.id !== categoryId);
      await StorageService.saveInvestmentCategories(remaining);
    } catch (error) {
      logger.error('Error deleting investment category:', error);
      throw error;
    }
  },

  async getInvestmentCategories(_userId: string): Promise<InvestmentCategory[]> {
    try {
      const categories = await StorageService.getInvestmentCategories();
      if (!categories || categories.length === 0) {
        return getDefaultInvestmentCategories();
      }
      return categories;
    } catch (error) {
      logger.error('Error getting investment categories:', error);
      return getDefaultInvestmentCategories();
    }
  },
};
