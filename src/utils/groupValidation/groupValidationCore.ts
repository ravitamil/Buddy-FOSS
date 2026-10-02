import type {Group} from '@/types';
import {validateGroupMember} from './groupMemberValidation';
import {validateTransaction} from './transactionValidation';
import type {ValidationOptions, ValidationResult} from './groupValidationTypes';

export const validateGroup = (
  group: Partial<Group>,
  options: ValidationOptions = {},
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  appLogger.debug('ðŸ” validateGroup: Validating group', group.name || 'unnamed');

  const {
    allowEmptyTransactions = true,
    allowSingleMember = false,
    maxMembers = 50,
    maxTransactions = 1000,
    strictAmountValidation = true,
  } = options;

  try {
    validateGroupRequiredFields(group, errors);
    validateGroupMembers(group, errors, warnings, allowSingleMember, maxMembers);
    validateGroupTransactions(
      group,
      errors,
      warnings,
      allowEmptyTransactions,
      maxTransactions,
      strictAmountValidation,
    );
    validateGroupOptionalFields(group, warnings);
  } catch (error) {
    appLogger.error('ðŸ” validateGroup: Validation error:', error);
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
  };

  appLogger.debug('ðŸ” validateGroup: Validation complete:', {
    isValid: result.isValid,
    errorCount: errors.length,
    warningCount: warnings.length,
  });

  return result;
};

function validateGroupRequiredFields(group: Partial<Group>, errors: string[]) {
  if (!group.name || group.name.trim().length === 0) {
    errors.push('Group name is required');
  } else if (group.name.trim().length < 2) {
    errors.push('Group name must be at least 2 characters long');
  } else if (group.name.trim().length > 50) {
    errors.push('Group name must be less than 50 characters');
  }

  if (!group.id || group.id.trim().length === 0) {
    errors.push('Group ID is required');
  }

  if (!group.createdBy || group.createdBy.trim().length === 0) {
    errors.push('Group creator ID is required');
  }

  if (!group.createdAt) {
    errors.push('Group creation date is required');
  } else if (new Date(group.createdAt) > new Date()) {
    errors.push('Group creation date cannot be in the future');
  }
}

function validateGroupMembers(
  group: Partial<Group>,
  errors: string[],
  warnings: string[],
  allowSingleMember: boolean,
  maxMembers: number,
) {
  if (!group.members || !Array.isArray(group.members)) {
    errors.push('Group members must be an array');
    return;
  }

  const members = group.members;

  if (members.length === 0) {
    errors.push('Group must have at least one member');
  } else if (!allowSingleMember && members.length === 1) {
    warnings.push('Groups with only one member have limited functionality');
  } else if (members.length > maxMembers) {
    errors.push(`Group cannot have more than ${maxMembers} members`);
  }

  const memberIds = new Set<string>();
  const memberNames = new Set<string>();

  members.forEach((member, index) => {
    const memberValidation = validateGroupMember(member, index);
    errors.push(...memberValidation.errors);
    warnings.push(...memberValidation.warnings);

    if (member.id) {
      if (memberIds.has(member.id)) {
        errors.push(`Duplicate member ID found: ${member.id}`);
      } else {
        memberIds.add(member.id);
      }
    }

    if (member.name) {
      if (memberNames.has(member.name.toLowerCase())) {
        warnings.push(`Duplicate member name found: ${member.name}`);
      } else {
        memberNames.add(member.name.toLowerCase());
      }
    }
  });

  if (group.createdBy && !members.some((member) => member.id === group.createdBy)) {
    errors.push('Group creator must be a member of the group');
  }
}

function validateGroupTransactions(
  group: Partial<Group>,
  errors: string[],
  warnings: string[],
  allowEmptyTransactions: boolean,
  maxTransactions: number,
  strictAmountValidation: boolean,
) {
  if (!group.transactions) return;

  if (!Array.isArray(group.transactions)) {
    errors.push('Group transactions must be an array');
    return;
  }

  const transactions = group.transactions;

  if (!allowEmptyTransactions && transactions.length === 0) {
    warnings.push('Group has no transactions');
  } else if (transactions.length > maxTransactions) {
    errors.push(`Group cannot have more than ${maxTransactions} transactions`);
  }

  const transactionIds = new Set<string>();
  transactions.forEach((transaction, index) => {
    const transactionValidation = validateTransaction(transaction, group.members || [], index, {
      strictAmountValidation,
    });
    errors.push(...transactionValidation.errors);
    warnings.push(...transactionValidation.warnings);

    if (!transaction.id) return;

    if (transactionIds.has(transaction.id)) {
      errors.push(`Duplicate transaction ID found: ${transaction.id}`);
    } else {
      transactionIds.add(transaction.id);
    }
  });
}

function validateGroupOptionalFields(group: Partial<Group>, warnings: string[]) {
  if (group.description && group.description.length > 200) {
    warnings.push('Group description is quite long (over 200 characters)');
  }

  if (group.emoji && group.emoji.length > 10) {
    warnings.push('Group emoji should be a single emoji character');
  }
}
