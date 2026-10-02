import type {GroupMember} from '@/types';
import type {ValidationResult} from './groupValidationTypes';

export const validateGroupMember = (
  member: Partial<GroupMember>,
  index?: number,
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = index !== undefined ? `Member ${index + 1}` : 'Member';

  try {
    if (!member.id || member.id.trim().length === 0) {
      errors.push(`${prefix}: ID is required`);
    }

    if (!member.name || member.name.trim().length === 0) {
      errors.push(`${prefix}: Name is required`);
    } else if (member.name.trim().length < 1) {
      errors.push(`${prefix}: Name must be at least 1 character long`);
    } else if (member.name.trim().length > 100) {
      errors.push(`${prefix}: Name must be less than 100 characters`);
    }

    if (!member.role) {
      errors.push(`${prefix}: Role is required`);
    } else if (!['creator', 'member'].includes(member.role)) {
      errors.push(`${prefix}: Role must be either 'creator' or 'member'`);
    }

    if (!member.joinedAt) {
      errors.push(`${prefix}: Join date is required`);
    } else if (new Date(member.joinedAt) > new Date()) {
      errors.push(`${prefix}: Join date cannot be in the future`);
    }

    if (member.isActive === undefined || member.isActive === null) {
      warnings.push(`${prefix}: Active status not specified, defaulting to true`);
    }

    if (typeof member.balance === 'number') {
      if (!isFinite(member.balance)) {
        errors.push(`${prefix}: Balance must be a valid number`);
      } else if (Math.abs(member.balance) > 1000000) {
        warnings.push(`${prefix}: Balance is very large (${member.balance})`);
      }
    }

    if (typeof member.totalPaid === 'number') {
      if (!isFinite(member.totalPaid) || member.totalPaid < 0) {
        errors.push(`${prefix}: Total paid must be a non-negative number`);
      }
    }

    if (typeof member.totalOwed === 'number') {
      if (!isFinite(member.totalOwed) || member.totalOwed < 0) {
        errors.push(`${prefix}: Total owed must be a non-negative number`);
      }
    }
  } catch (error) {
    appLogger.error('ðŸ” validateGroupMember: Validation error:', error);
    errors.push(
      `${prefix}: Validation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
