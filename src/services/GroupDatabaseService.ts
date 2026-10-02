import {EnhancedGroup} from '@/features/groups/types';
import {logger as appLogger} from './LoggerService';
import {StorageService} from './storage';
import {transactionDatabaseService} from './TransactionDatabaseService';

const logger = appLogger.contextLogger('GroupDatabaseService');

/**
 * Group Database Service
 * Handles offline group expense splitting persistence locally
 */
export const groupDatabaseService = {
  async saveGroups(userId: string, groups: EnhancedGroup[]): Promise<void> {
    try {
      if (groups.length === 0) return;
      for (const group of groups) {
        await this.saveGroup(userId, group);
      }
    } catch (error) {
      logger.error('Error saving groups:', error);
      throw error;
    }
  },

  async saveGroup(userId: string, group: EnhancedGroup): Promise<void> {
    try {
      const existing = await StorageService.getGroups();
      const map = new Map<string, EnhancedGroup>(existing.map((g) => [g.id, g]));

      const updatedGroup: EnhancedGroup = {
        ...group,
        createdBy: group.createdBy || userId,
        isActive: group.isActive !== undefined ? group.isActive : true,
        updatedAt: new Date(),
        createdAt: group.createdAt ? new Date(group.createdAt) : new Date(),
        members: (group.members || []).map((m) => ({
          ...m,
          joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(m.joinedAt),
          updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(m.joinedAt),
        })),
      };

      map.set(group.id, updatedGroup);
      await StorageService.saveGroups(Array.from(map.values()));

      // Save + prune transactions for this group
      const groupTransactions = (group.transactions || []).map((t) => ({...t, groupId: group.id}));
      if (groupTransactions.length > 0) {
        await transactionDatabaseService.saveTransactions(userId, groupTransactions);
      }
      await transactionDatabaseService.pruneGroupTransactions(
        userId,
        group.id,
        groupTransactions.map((t) => t.id),
      );
    } catch (error) {
      logger.error('Error saving individual group:', error);
      throw error;
    }
  },

  async getGroups(userId: string): Promise<EnhancedGroup[]> {
    try {
      const groups = await StorageService.getGroups();
      const allTransactions = await transactionDatabaseService.getTransactions(userId);

      return groups.map((g) => {
        const groupTransactions = allTransactions.filter((t) => t.groupId === g.id);
        return {
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
          members: (g.members || []).map((m) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(m.joinedAt),
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(m.joinedAt),
          })),
          transactions: groupTransactions,
        };
      });
    } catch (error) {
      logger.error('Error getting groups:', error);
      return [];
    }
  },

  async deleteGroup(userId: string, groupId: string): Promise<void> {
    try {
      // 1. Delete group transactions
      await transactionDatabaseService.pruneGroupTransactions(userId, groupId, []);

      // 2. Delete group from local storage
      const existing = await StorageService.getGroups();
      const remaining = existing.filter((g) => g.id !== groupId);
      await StorageService.saveGroups(remaining);
    } catch (error) {
      logger.error('Error deleting group:', error);
      throw error;
    }
  },
};
