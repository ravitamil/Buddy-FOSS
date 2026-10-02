import {groupDatabaseService} from '@/services/GroupDatabaseService';
import type {EnhancedGroup} from './types';

export const groupService = {
  getAll: (userId: string) => groupDatabaseService.getGroups(userId),
  saveMany: (userId: string, groups: EnhancedGroup[]) =>
    groupDatabaseService.saveGroups(userId, groups),
  create: (userId: string, group: EnhancedGroup) => groupDatabaseService.saveGroup(userId, group),
  update: (userId: string, group: EnhancedGroup) => groupDatabaseService.saveGroup(userId, group),
  delete: (userId: string, id: string) => groupDatabaseService.deleteGroup(userId, id),
};
