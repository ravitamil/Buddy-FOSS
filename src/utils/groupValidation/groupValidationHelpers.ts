import type {Group} from '@/types';
import type {ValidationResult} from './groupValidationTypes';

export const withGroupValidation = <T extends unknown[], R>(
  operation: (...args: T) => R,
  validator: (...args: T) => ValidationResult,
  operationName: string,
) => {
  return (...args: T): R => {
    appLogger.debug(`ðŸ” withGroupValidation: Validating ${operationName}`);

    try {
      const validation = validator(...args);

      if (!validation.isValid) {
        const errorMessage = `${operationName} validation failed: ${validation.errors.join(', ')}`;
        appLogger.error(`ðŸ” withGroupValidation: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (validation.warnings.length > 0) {
        appLogger.warn(`ðŸ” withGroupValidation: ${operationName} warnings:`, validation.warnings);
      }

      const result = operation(...args);
      appLogger.debug(`ðŸ” withGroupValidation: ${operationName} completed successfully`);
      return result;
    } catch (error) {
      appLogger.error(`ðŸ” withGroupValidation: ${operationName} failed:`, error);
      throw error;
    }
  };
};

export const sanitizeGroup = (group: Partial<Group>): Partial<Group> => {
  return {
    ...group,
    name: group.name?.trim(),
    description: group.description?.trim() || undefined,
    emoji: group.emoji?.trim() || undefined,
    members: group.members?.map((member) => ({
      ...member,
      name: member.name?.trim(),
    })),
    transactions: group.transactions?.map((transaction) => ({
      ...transaction,
      description: transaction.description?.trim() || '',
      category: transaction.category?.trim() || '',
      notes: transaction.notes?.trim() || undefined,
    })),
  };
};

export const formatValidationErrors = (validation: ValidationResult): string => {
  if (validation.isValid) {
    return 'No errors found';
  }

  let message = 'Validation failed:\n';
  validation.errors.forEach((error, index) => {
    message += `${index + 1}. ${error}\n`;
  });

  if (validation.warnings.length > 0) {
    message += '\nWarnings:\n';
    validation.warnings.forEach((warning, index) => {
      message += `â€¢ ${warning}\n`;
    });
  }

  return message.trim();
};
