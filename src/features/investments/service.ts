import {investmentDatabaseService} from '@/services/InvestmentDatabaseService';
import type {Investment, InvestmentCategory, Portfolio} from './types';

export const investmentService = {
  getPortfolios: (userId: string) => investmentDatabaseService.getPortfolios(userId),
  savePortfolios: (userId: string, portfolios: Portfolio[]) =>
    investmentDatabaseService.savePortfolios(userId, portfolios),
  getAll: (userId: string, portfolioId?: string) =>
    investmentDatabaseService.getInvestments(userId, portfolioId),
  saveMany: (userId: string, investments: (Investment & {portfolioId?: string})[]) =>
    investmentDatabaseService.saveInvestments(userId, investments),
  create: (userId: string, investment: Investment & {portfolioId?: string}) =>
    investmentDatabaseService.saveInvestments(userId, [investment]),
  update: (userId: string, investment: Investment & {portfolioId?: string}) =>
    investmentDatabaseService.saveInvestments(userId, [investment]),
  delete: (userId: string, id: string) => investmentDatabaseService.deleteInvestment(userId, id),
  getCategories: (userId: string) => investmentDatabaseService.getInvestmentCategories(userId),
  saveCategories: (userId: string, categories: InvestmentCategory[]) =>
    investmentDatabaseService.saveInvestmentCategories(userId, categories),
  deleteCategory: (userId: string, id: string) =>
    investmentDatabaseService.deleteInvestmentCategory(userId, id),
};
