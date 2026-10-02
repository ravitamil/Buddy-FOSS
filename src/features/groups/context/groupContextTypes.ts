import {CRUDOperations} from '../../../types/context-foundation';
import {MemberDebt, SettlementSuggestion, Transaction} from '../../../types';
import {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {GroupExpenseInput} from '../utils/groupExpenseTransactions';
import {GroupAnalyticsSummary} from '../utils/groupReadModels';
import {GroupSettlementInput} from '../utils/groupSettlement';

export type GroupMemberInput = Omit<
  EnhancedGroupMember,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
>;

export interface GroupContextType {
  syncWithRemote: () => Promise<void>;
  groups: CRUDOperations<EnhancedGroup>;

  addGroupMember: (groupId: string, member: GroupMemberInput) => Promise<EnhancedGroupMember>;
  removeGroupMember: (groupId: string, memberId: string) => Promise<void>;
  updateMemberRole: (
    groupId: string,
    memberId: string,
    role: EnhancedGroupMember['role'],
  ) => Promise<void>;
  updateMemberPermissions: (
    groupId: string,
    memberId: string,
    permissions: Partial<EnhancedGroupMember['permissions']>,
  ) => Promise<void>;

  addGroupExpense: (groupId: string, expense: GroupExpenseInput) => Promise<Transaction>;
  editGroupExpense: (
    groupId: string,
    transactionId: string,
    expense: GroupExpenseInput,
  ) => Promise<Transaction>;
  deleteGroupExpense: (groupId: string, transactionId: string) => Promise<void>;

  calculateSettlements: (groupId: string) => SettlementSuggestion[];
  recordSettlement: (groupId: string, settlement: GroupSettlementInput) => Promise<Transaction>;
  recordBatchSettlements: (
    groupId: string,
    settlements: GroupSettlementInput[],
  ) => Promise<Transaction[]>;

  getGroupAnalytics: (groupId: string) => GroupAnalyticsSummary | null;
  getMemberDebts: (groupId: string) => MemberDebt[];

  isGroupNameUnique: (name: string, excludeId?: string) => boolean;
  validateMemberPermissions: (groupId: string, memberId: string, action: string) => boolean;

  isLoading: boolean;
  error: string | null;
}
