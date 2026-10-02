import {Transaction, SplitDetail} from '../../../types';
import {CRUDOperations, generateEntityId} from '../../../types/context-foundation';
import {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {
  buildGroupExpenseTransaction,
  GroupExpenseInput,
  updateGroupExpenseTransaction,
} from '../utils/groupExpenseTransactions';

interface GroupActor {
  uid?: string | null;
  displayName?: string | null;
}

interface GroupExpenseActionDeps {
  groups: EnhancedGroup[];
  groupsCRUD: Pick<CRUDOperations<EnhancedGroup>, 'update'>;
  actor: GroupActor;
  normalizeSplitDetails: (
    members: EnhancedGroupMember[],
    totalAmount: number,
    splitMethod: NonNullable<GroupExpenseInput['splitMethod']>,
    provided?: SplitDetail[],
  ) => SplitDetail[];
  recalculateMemberBalances: (
    members: EnhancedGroupMember[],
    transactions: Transaction[],
    groupId: string,
  ) => EnhancedGroupMember[];
  logActivity: (
    groupId: string,
    actorUserId: string | undefined,
    actorName: string,
    action: 'expense_added' | 'expense_edited' | 'expense_deleted',
    metadata: Record<string, unknown>,
  ) => void;
}

const findGroupOrThrow = (groups: EnhancedGroup[], groupId: string): EnhancedGroup => {
  const group = groups.find((candidate) => candidate.id === groupId);
  if (!group) throw new Error('Group not found');
  return group;
};

export const createGroupExpenseActions = ({
  groups,
  groupsCRUD,
  actor,
  normalizeSplitDetails,
  recalculateMemberBalances,
  logActivity,
}: GroupExpenseActionDeps) => ({
  addGroupExpense: async (
    groupId: string,
    expenseData: GroupExpenseInput,
  ): Promise<Transaction> => {
    const group = findGroupOrThrow(groups, groupId);
    const splitMethod = expenseData.splitMethod || 'equal';
    const splitDetails = normalizeSplitDetails(
      group.members,
      expenseData.amount,
      splitMethod,
      expenseData.splitDetails,
    );

    const newTransaction = buildGroupExpenseTransaction({
      id: generateEntityId(),
      groupId,
      expense: expenseData,
      splitMethod,
      splitDetails,
    });
    const updatedTransactions = [...group.transactions, newTransaction];
    const updatedMembers = recalculateMemberBalances(group.members, updatedTransactions, groupId);

    await groupsCRUD.update(groupId, {
      transactions: updatedTransactions,
      members: updatedMembers,
    });

    const paidByMember = group.members.find((member) => member.id === expenseData.paidBy);
    logActivity(
      groupId,
      actor.uid ?? undefined,
      paidByMember?.name || actor.displayName || 'Unknown',
      'expense_added',
      {
        transactionId: newTransaction.id,
        description: expenseData.description,
        amount: expenseData.amount,
      },
    );

    return newTransaction;
  },

  editGroupExpense: async (
    groupId: string,
    transactionId: string,
    expenseData: GroupExpenseInput,
  ): Promise<Transaction> => {
    const group = findGroupOrThrow(groups, groupId);
    const splitMethod = expenseData.splitMethod || 'equal';
    const splitDetails = normalizeSplitDetails(
      group.members,
      expenseData.amount,
      splitMethod,
      expenseData.splitDetails,
    );

    const updatedTransactions = group.transactions.map((transaction) =>
      transaction.id === transactionId
        ? updateGroupExpenseTransaction({
            transaction,
            expense: expenseData,
            splitMethod,
            splitDetails,
          })
        : transaction,
    );
    const updatedMembers = recalculateMemberBalances(group.members, updatedTransactions, groupId);

    await groupsCRUD.update(groupId, {
      transactions: updatedTransactions,
      members: updatedMembers,
    });

    logActivity(groupId, actor.uid ?? undefined, actor.displayName || 'Unknown', 'expense_edited', {
      transactionId,
      description: expenseData.description,
      amount: expenseData.amount,
    });

    return updatedTransactions.find((transaction) => transaction.id === transactionId)!;
  },

  deleteGroupExpense: async (groupId: string, transactionId: string): Promise<void> => {
    const group = findGroupOrThrow(groups, groupId);
    const deletedTransaction = group.transactions.find(
      (transaction) => transaction.id === transactionId,
    );
    const updatedTransactions = group.transactions.filter(
      (transaction) => transaction.id !== transactionId,
    );
    const updatedMembers = recalculateMemberBalances(group.members, updatedTransactions, groupId);

    await groupsCRUD.update(groupId, {
      transactions: updatedTransactions,
      members: updatedMembers,
    });

    logActivity(
      groupId,
      actor.uid ?? undefined,
      actor.displayName || 'Unknown',
      'expense_deleted',
      {
        transactionId,
        description: deletedTransaction?.description,
      },
    );
  },
});
