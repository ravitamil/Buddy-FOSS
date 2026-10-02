import type {GroupMember, Transaction} from '@/types';
import type {ValidationResult} from './groupValidationTypes';

export const validateBalanceCalculationInputs = (
  transactions: Transaction[],
  members: GroupMember[],
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (!Array.isArray(transactions)) {
      errors.push('Transactions must be an array');
    }

    if (!Array.isArray(members)) {
      errors.push('Members must be an array');
    }

    if (members.length === 0) {
      errors.push('Cannot calculate balance with no members');
    }

    if (transactions.length === 0) {
      warnings.push('No transactions to calculate balance from');
    }

    const memberIds = new Set(members.map((member) => member.id));
    const referencedMemberIds = collectReferencedMemberIds(transactions);
    const orphanedMembers = Array.from(referencedMemberIds).filter((id) => !memberIds.has(id));

    if (orphanedMembers.length > 0) {
      errors.push(`Transactions reference non-existent members: ${orphanedMembers.join(', ')}`);
    }

    const inactiveMembers = members.filter((member) => member.isActive === false);
    if (inactiveMembers.length > 0) {
      warnings.push(`${inactiveMembers.length} member(s) are marked as inactive`);
    }
  } catch (error) {
    appLogger.error('ðŸ” validateBalanceCalculationInputs: Validation error:', error);
    errors.push(
      `Balance calculation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

function collectReferencedMemberIds(transactions: Transaction[]) {
  const referencedMemberIds = new Set<string>();

  transactions.forEach((transaction) => {
    if (transaction.paidBy) {
      referencedMemberIds.add(transaction.paidBy);
    }

    if (transaction.splitAmong) {
      transaction.splitAmong.forEach((id) => referencedMemberIds.add(id));
    }

    if (transaction.splitAmounts) {
      Object.keys(transaction.splitAmounts).forEach((id) => referencedMemberIds.add(id));
    }
  });

  return referencedMemberIds;
}
