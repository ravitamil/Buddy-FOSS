import {
  validateField,
  ValidationRules,
  validateForm,
  isFormValid,
  getFirstError,
} from './formValidation';

describe('formValidation', () => {
  describe('ValidationRules', () => {
    describe('required', () => {
      it('should create required validation rule', () => {
        const rule = ValidationRules.required();
        expect(rule.required).toBe(true);
        expect(rule.message).toBe('This field is required');
      });

      it('should accept custom message', () => {
        const rule = ValidationRules.required('Custom required message');
        expect(rule.message).toBe('Custom required message');
      });
    });

    describe('minLength', () => {
      it('should create minLength validation rule', () => {
        const rule = ValidationRules.minLength(5);
        expect(rule.minLength).toBe(5);
        expect(rule.message).toBe('Must be at least 5 characters');
      });

      it('should accept custom message', () => {
        const rule = ValidationRules.minLength(3, 'Too short');
        expect(rule.message).toBe('Too short');
      });
    });

    describe('maxLength', () => {
      it('should create maxLength validation rule', () => {
        const rule = ValidationRules.maxLength(10);
        expect(rule.maxLength).toBe(10);
        expect(rule.message).toBe('Must be no more than 10 characters');
      });

      it('should accept custom message', () => {
        const rule = ValidationRules.maxLength(5, 'Too long');
        expect(rule.message).toBe('Too long');
      });
    });

    describe('email', () => {
      it('should create email validation rule', () => {
        const rule = ValidationRules.email();
        expect(rule.pattern).toBeDefined();
        expect(rule.message).toBe('Please enter a valid email address');
      });

      it('should accept custom message', () => {
        const rule = ValidationRules.email('Invalid email');
        expect(rule.message).toBe('Invalid email');
      });
    });

    describe('phone', () => {
      it('should create phone validation rule', () => {
        const rule = ValidationRules.phone();
        expect(rule.pattern).toBeDefined();
        expect(rule.message).toBe('Please enter a valid phone number');
      });
    });

    describe('numeric', () => {
      it('should create numeric validation rule', () => {
        const rule = ValidationRules.numeric();
        expect(rule.pattern).toBeDefined();
        expect(rule.message).toBe('Please enter a valid number');
      });
    });

    describe('positiveNumber', () => {
      it('should create positive number validation rule', () => {
        const rule = ValidationRules.positiveNumber();
        expect(rule.custom).toBeDefined();
        expect(rule.message).toBe('Please enter a positive number');
      });
    });

    describe('currency', () => {
      it('should create currency validation rule', () => {
        const rule = ValidationRules.currency();
        expect(rule.pattern).toBeDefined();
        expect(rule.message).toBe('Please enter a valid amount');
      });
    });

    describe('custom', () => {
      it('should create custom validation rule', () => {
        const validator = (value: string) => value === 'test';
        const rule = ValidationRules.custom(validator, 'Custom error');

        expect(rule.custom).toBe(validator);
        expect(rule.message).toBe('Custom error');
      });
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules = [ValidationRules.required()];

      // Empty string should fail
      const emptyResult = validateField('', rules);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('This field is required');

      // Whitespace only should fail
      const whitespaceResult = validateField('   ', rules);
      expect(whitespaceResult.isValid).toBe(false);
      expect(whitespaceResult.error).toBe('This field is required');

      // Valid value should pass
      const validResult = validateField('test', rules);
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();
    });

    it('should validate minimum length', () => {
      const rules = [ValidationRules.minLength(5)];

      // Too short should fail
      const shortResult = validateField('abc', rules);
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.error).toBe('Must be at least 5 characters');

      // Exact length should pass
      const exactResult = validateField('abcde', rules);
      expect(exactResult.isValid).toBe(true);

      // Longer should pass
      const longResult = validateField('abcdef', rules);
      expect(longResult.isValid).toBe(true);
    });

    it('should validate maximum length', () => {
      const rules = [ValidationRules.maxLength(5)];

      // Too long should fail
      const longResult = validateField('abcdefgh', rules);
      expect(longResult.isValid).toBe(false);
      expect(longResult.error).toBe('Must be no more than 5 characters');

      // Exact length should pass
      const exactResult = validateField('abcde', rules);
      expect(exactResult.isValid).toBe(true);

      // Shorter should pass
      const shortResult = validateField('abc', rules);
      expect(shortResult.isValid).toBe(true);
    });

    it('should validate email pattern', () => {
      const rules = [ValidationRules.email()];

      // Invalid emails should fail
      const invalidResults = [
        validateField('invalid', rules),
        validateField('invalid@', rules),
        validateField('@invalid.com', rules),
        validateField('invalid@.com', rules),
      ];

      invalidResults.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid email address');
      });

      // Valid emails should pass
      const validResults = [
        validateField('test@example.com', rules),
        validateField('user.name@domain.co.uk', rules),
        validateField('test+tag@example.org', rules),
      ];

      validResults.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate phone pattern', () => {
      const rules = [ValidationRules.phone()];

      // Invalid phones should fail
      const invalidResult = validateField('123', rules);
      expect(invalidResult.isValid).toBe(false);

      // Valid phones should pass
      const validResults = [
        validateField('1234567890', rules),
        validateField('+1 (555) 123-4567', rules),
        validateField('+44 20 7946 0958', rules),
      ];

      validResults.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate numeric pattern', () => {
      const rules = [ValidationRules.numeric()];

      // Invalid numbers should fail
      const invalidResults = [
        validateField('abc', rules),
        validateField('12.34.56', rules),
        validateField('12a34', rules),
      ];

      invalidResults.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid number');
      });

      // Valid numbers should pass
      const validResults = [
        validateField('123', rules),
        validateField('123.45', rules),
        validateField('0.5', rules),
      ];

      validResults.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate positive numbers', () => {
      const rules = [ValidationRules.positiveNumber()];

      // Non-positive numbers should fail
      const invalidResults = [
        validateField('-5', rules),
        validateField('0', rules),
        validateField('abc', rules),
      ];

      invalidResults.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a positive number');
      });

      // Positive numbers should pass
      const validResults = [
        validateField('1', rules),
        validateField('5.5', rules),
        validateField('100', rules),
      ];

      validResults.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate currency format', () => {
      const rules = [ValidationRules.currency()];

      // Invalid currency formats should fail
      const invalidResults = [
        validateField('123.456', rules), // Too many decimal places
        validateField('12.3.4', rules), // Multiple decimal points
        validateField('abc', rules), // Non-numeric
      ];

      invalidResults.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid amount');
      });

      // Valid currency formats should pass
      const validResults = [
        validateField('123', rules),
        validateField('123.45', rules),
        validateField('0.99', rules),
      ];

      validResults.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should validate custom rules', () => {
      const customRule = ValidationRules.custom(
        (value) => value.startsWith('test'),
        'Must start with "test"',
      );

      const invalidResult = validateField('invalid', [customRule]);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Must start with "test"');

      const validResult = validateField('test123', [customRule]);
      expect(validResult.isValid).toBe(true);
    });

    it('should validate multiple rules in order', () => {
      const rules = [
        ValidationRules.required(),
        ValidationRules.minLength(5),
        ValidationRules.email(),
      ];

      // Should fail on first rule (required)
      const emptyResult = validateField('', rules);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('This field is required');

      // Should fail on second rule (minLength)
      const shortResult = validateField('ab', rules);
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.error).toBe('Must be at least 5 characters');

      // Should fail on third rule (email)
      const invalidEmailResult = validateField('abcdef', rules);
      expect(invalidEmailResult.isValid).toBe(false);
      expect(invalidEmailResult.error).toBe('Please enter a valid email address');

      // Should pass all rules
      const validResult = validateField('test@example.com', rules);
      expect(validResult.isValid).toBe(true);
    });

    it('should skip validation for empty non-required fields', () => {
      const rules = [ValidationRules.minLength(5)];

      const emptyResult = validateField('', rules);
      expect(emptyResult.isValid).toBe(true);

      const whitespaceResult = validateField('   ', rules);
      expect(whitespaceResult.isValid).toBe(true);
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields', () => {
      const fields = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: 'password123',
      };

      const rules = {
        email: [ValidationRules.required(), ValidationRules.email()],
        password: [ValidationRules.required(), ValidationRules.minLength(8)],
        confirmPassword: [ValidationRules.required()],
      };

      const results = validateForm(fields, rules);

      expect(results.email.isValid).toBe(true);
      expect(results.password.isValid).toBe(false);
      expect(results.password.error).toBe('Must be at least 8 characters');
      expect(results.confirmPassword.isValid).toBe(true);
    });

    it('should handle fields without rules', () => {
      const fields = {
        name: 'John',
        email: 'test@example.com',
      };

      const rules = {
        email: [ValidationRules.required(), ValidationRules.email()],
      };

      const results = validateForm(fields, rules);

      expect(results.name.isValid).toBe(true);
      expect(results.email.isValid).toBe(true);
    });
  });

  describe('isFormValid', () => {
    it('should return true when all fields are valid', () => {
      const results = {
        field1: {isValid: true},
        field2: {isValid: true},
        field3: {isValid: true},
      };

      expect(isFormValid(results)).toBe(true);
    });

    it('should return false when any field is invalid', () => {
      const results = {
        field1: {isValid: true},
        field2: {isValid: false, error: 'Error'},
        field3: {isValid: true},
      };

      expect(isFormValid(results)).toBe(false);
    });

    it('should handle empty results', () => {
      expect(isFormValid({})).toBe(true);
    });
  });

  describe('getFirstError', () => {
    it('should return first error message', () => {
      const results = {
        field1: {isValid: true},
        field2: {isValid: false, error: 'First error'},
        field3: {isValid: false, error: 'Second error'},
      };

      expect(getFirstError(results)).toBe('First error');
    });

    it('should return undefined when no errors', () => {
      const results = {
        field1: {isValid: true},
        field2: {isValid: true},
      };

      expect(getFirstError(results)).toBeUndefined();
    });

    it('should handle empty results', () => {
      expect(getFirstError({})).toBeUndefined();
    });
  });
});
