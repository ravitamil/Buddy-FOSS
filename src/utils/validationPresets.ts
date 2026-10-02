/**
 * Validation presets for common form fields
 * Uses existing ValidationRules to create reusable validation configurations
 */

import {ValidationRules, ValidationRule} from './formValidation';

/**
 * Predefined validation presets for common form fields
 * These presets combine multiple validation rules for typical use cases
 */
export const VALIDATION_PRESETS = {
  /**
   * Email validation preset
   * Requires a valid email format
   */
  email: ValidationRules.email('Please enter a valid email address'),

  /**
   * Phone validation preset
   * Requires a valid phone number format (10+ digits with optional formatting)
   */
  phone: ValidationRules.phone('Please enter a valid phone number'),

  /**
   * Amount/Currency validation preset
   * Requires a valid monetary amount (up to 2 decimal places)
   */
  amount: ValidationRules.currency('Please enter a valid amount'),

  /**
   * Password validation preset
   * Requires minimum 8 characters
   */
  password: ValidationRules.minLength(8, 'Password must be at least 8 characters'),

  /**
   * Required field preset
   * Basic required field validation
   */
  required: ValidationRules.required('This field is required'),

  /**
   * Name validation preset
   * Required field with minimum 2 characters, no special characters
   */
  name: [
    ValidationRules.required('Name is required'),
    ValidationRules.minLength(2, 'Name must be at least 2 characters'),
    ValidationRules.noSpecialChars('Name cannot contain special characters'),
  ] as ValidationRule[],

  /**
   * Numeric validation preset
   * Requires a valid positive number
   */
  numeric: ValidationRules.positiveNumber('Please enter a valid positive number'),

  /**
   * Description validation preset
   * Optional field with maximum length
   */
  description: ValidationRules.maxLength(500, 'Description must be no more than 500 characters'),
} as const;

export default VALIDATION_PRESETS;
