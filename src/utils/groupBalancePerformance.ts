import type {GroupMember, Transaction} from '../types';
import type {
  CalculationCache,
  GroupBalanceCalculation,
  PerformanceMetrics,
} from './groupBalanceTypes';
import {GROUP_BALANCE_PERFORMANCE_CONFIG} from './groupBalanceTypes';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private cache: CalculationCache = {};
  private cacheOrder: string[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  createHash(data: unknown): string {
    return JSON.stringify(data).replace(/\s/g, '');
  }

  generateTransactionHash(transactions: Transaction[]): string {
    const transactionData = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.date,
      paidBy: transaction.paidBy,
      receivedBy: transaction.receivedBy,
      type: transaction.type,
      splitMethod: transaction.splitMethod,
      splitAmounts: transaction.splitAmounts,
      splitDetails: transaction.splitDetails,
      splitAmong: transaction.splitAmong,
      isSettlement: transaction.isSettlement,
      settledDebts: transaction.settledDebts,
      settledDebtAmounts: transaction.settledDebtAmounts,
      transactionCurrency: transaction.transactionCurrency,
      fxRateApplied: transaction.fxRateApplied,
    }));
    return this.createHash(transactionData);
  }

  generateMemberHash(members: GroupMember[]): string {
    const memberData = members.map((member) => ({
      id: member.id,
      name: member.name,
      isActive: member.isActive,
    }));
    return this.createHash(memberData);
  }

  getCacheKey(transactions: Transaction[], members: GroupMember[]): string {
    const transactionHash = this.generateTransactionHash(transactions);
    const memberHash = this.generateMemberHash(members);
    return `${transactionHash}_${memberHash}`;
  }

  getCachedResult(key: string): GroupBalanceCalculation | null {
    const cached = this.cache[key];
    if (!cached) return null;

    if (Date.now() - cached.timestamp > GROUP_BALANCE_PERFORMANCE_CONFIG.CACHE_TTL) {
      this.evictFromCache(key);
      return null;
    }

    const index = this.cacheOrder.indexOf(key);
    if (index > -1) {
      this.cacheOrder.splice(index, 1);
    }
    this.cacheOrder.push(key);

    return cached.result;
  }

  setCachedResult(
    key: string,
    result: GroupBalanceCalculation,
    metrics: PerformanceMetrics,
    dependencies: {transactionHash: string; memberHash: string},
  ): void {
    if (this.cacheOrder.length >= GROUP_BALANCE_PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = this.cacheOrder.shift();
      if (oldestKey) {
        delete this.cache[oldestKey];
      }
    }

    this.cache[key] = {
      result,
      timestamp: Date.now(),
      dependencies,
      metrics,
    };

    this.cacheOrder.push(key);
  }

  private evictFromCache(key: string): void {
    delete this.cache[key];
    const index = this.cacheOrder.indexOf(key);
    if (index > -1) {
      this.cacheOrder.splice(index, 1);
    }
  }

  clearCache(): void {
    this.cache = {};
    this.cacheOrder = [];
  }

  getCacheStats() {
    const totalRequests = this.cacheOrder.length;
    const currentSize = Object.keys(this.cache).length;
    const hitRate = totalRequests > 0 ? (totalRequests / (totalRequests + currentSize)) * 100 : 0;

    return {
      currentSize,
      maxSize: GROUP_BALANCE_PERFORMANCE_CONFIG.MAX_CACHE_SIZE,
      hitRate: `${hitRate.toFixed(2)}%`,
      cacheOrderLength: this.cacheOrder.length,
    };
  }
}
