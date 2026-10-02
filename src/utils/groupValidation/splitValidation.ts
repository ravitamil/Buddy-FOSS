import type {GroupMember} from '@/types';
import type {ValidationResult} from './groupValidationTypes';

export const validateSplitAmounts = (
  splitAmounts: Record<string, number>,
  totalAmount: number,
  groupMembers: GroupMember[],
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const memberIds = groupMembers.map((member) => member.id);
    const splitMemberIds = Object.keys(splitAmounts);
    const amounts = Object.values(splitAmounts);

    const invalidMembers = splitMemberIds.filter((id) => !memberIds.includes(id));
    if (invalidMembers.length > 0) {
      errors.push(`Split includes invalid members: ${invalidMembers.join(', ')}`);
    }

    amounts.forEach((amount, index) => {
      if (typeof amount !== 'number' || !isFinite(amount)) {
        errors.push(`Split amount ${index + 1} is not a valid number`);
      } else if (amount < 0) {
        errors.push(`Split amount ${index + 1} cannot be negative`);
      }
    });

    const splitTotal = amounts.reduce((sum, amount) => sum + amount, 0);
    const difference = Math.abs(splitTotal - Math.abs(totalAmount));

    if (difference > 0.01) {
      errors.push(
        `Split total (${splitTotal.toFixed(2)}) doesn't match transaction amount (${Math.abs(totalAmount).toFixed(2)})`,
      );
    }

    if (splitMemberIds.length === 0) {
      warnings.push('No members specified in split');
    } else if (splitMemberIds.length === 1) {
      warnings.push('Split is for only one member');
    }

    const zeroAmounts = amounts.filter((amount) => amount === 0).length;
    if (zeroAmounts > 0) {
      warnings.push(`${zeroAmounts} member(s) have zero split amount`);
    }
  } catch (error) {
    appLogger.error('ðŸ” validateSplitAmounts: Validation error:', error);
    errors.push(
      `Split validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
