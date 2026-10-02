/**
 * Form validation utilities for standardized form components
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a field value against provided rules
 */
export const validateField = (value: string, rules: ValidationRule[]): ValidationResult => {
  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || value.trim().length === 0)) {
      return {
        isValid: false,
        error: rule.message,
      };
    }

    // Skip other validations if value is empty and not required
    if (!value || value.trim().length === 0) {
      continue;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        error: rule.message,
      };
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        error: rule.message,
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        isValid: false,
        error: rule.message,
      };
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return {
        isValid: false,
        error: rule.message,
      };
    }
  }

  return {isValid: true};
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    required: true,
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`,
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  }),

  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message,
  }),

  numeric: (message: string = 'Please enter a valid number'): ValidationRule => ({
    pattern: /^\d+(\.\d+)?$/,
    message,
  }),

  positiveNumber: (message: string = 'Please enter a positive number'): ValidationRule => ({
    custom: (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    message,
  }),

  currency: (message: string = 'Please enter a valid amount'): ValidationRule => ({
    pattern: /^\d+(\.\d{1,2})?$/,
    message,
  }),

  noSpecialChars: (message: string = 'Special characters are not allowed'): ValidationRule => ({
    pattern: /^[a-zA-Z0-9\s]*$/,
    message,
  }),

  alphanumeric: (message: string = 'Only letters and numbers are allowed'): ValidationRule => ({
    pattern: /^[a-zA-Z0-9]*$/,
    message,
  }),

  custom: (validator: (value: string) => boolean, message: string): ValidationRule => ({
    custom: validator,
    message,
  }),
};

/**
 * Validates multiple fields at once
 */
export const validateForm = (
  fields: Record<string, string>,
  rules: Record<string, ValidationRule[]>,
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    const fieldRules = rules[fieldName] || [];
    results[fieldName] = validateField(fieldValue, fieldRules);
  }

  return results;
};

/**
 * Checks if form is valid based on validation results
 */
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every((result) => result.isValid);
};

/**
 * Gets first error message from validation results
 */
export const getFirstError = (
  validationResults: Record<string, ValidationResult>,
): string | undefined => {
  for (const result of Object.values(validationResults)) {
    if (!result.isValid && result.error) {
      return result.error;
    }
  }
  return undefined;
};

/**
 * Real-time validation hook for form fields
 */
export const useFieldValidation = (
  value: string,
  rules: ValidationRule[],
  validateOnChange: boolean = false,
) => {
  const [validationResult, setValidationResult] = React.useState<ValidationResult>({isValid: true});
  const [hasBlurred, setHasBlurred] = React.useState(false);

  React.useEffect(() => {
    if (validateOnChange || hasBlurred) {
      const result = validateField(value, rules);
      setValidationResult(result);
    }
  }, [value, rules, validateOnChange, hasBlurred]);

  const onBlur = React.useCallback(() => {
    setHasBlurred(true);
    const result = validateField(value, rules);
    setValidationResult(result);
  }, [value, rules]);

  return {
    ...validationResult,
    onBlur,
  };
};

// Re-export React for the hook
import React from 'react';
