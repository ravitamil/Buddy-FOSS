import {useState, useCallback, useMemo} from 'react';
import {
  validateForm,
  validateField,
  ValidationResult,
  ValidationRule,
} from '../utils/formValidation';
import {logger as appLogger} from '../services/LoggerService';

type FieldValue<T> = T[keyof T];

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitizeInputs?: boolean;
  debounceMs?: number;
}

export interface UseFormValidationReturn<T> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  warnings: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (value: FieldValue<T>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => () => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: FieldValue<T>) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => {isValid: boolean; errors: Partial<Record<keyof T, string>>};
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
}

/**
 * Custom hook for form validation with comprehensive state management
 */
export const useFormValidation = <T extends object>(config: {
  initialData: T;
  validationRules: Record<string, ValidationRule[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}): UseFormValidationReturn<T> => {
  const {
    initialData,
    validationRules,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300,
  } = config;

  // Form state
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [warnings, setWarnings] = useState<Partial<Record<keyof T, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [originalData] = useState<T>(initialData);

  // Memoized validation function
  const validate = useCallback((): ValidationResult => {
    const stringData = Object.fromEntries(
      Object.entries(data).map(([field, value]) => [
        field,
        typeof value === 'string' ? value : String(value ?? ''),
      ]),
    );
    const results = validateForm(stringData, validationRules);

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.entries(results).forEach(([field, result]) => {
      if (!result.isValid && result.error) {
        newErrors[field as keyof T] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    return {isValid, error: isValid ? undefined : 'Form has validation errors'};
  }, [data, validationRules]);

  // Validate single field
  const validateSingleField = useCallback(
    (field: keyof T): string | null => {
      const fieldRules = validationRules[field as string];
      if (!fieldRules) return null;

      const fieldValue = data[field];
      const result = validateField(
        typeof fieldValue === 'string' ? fieldValue : String(fieldValue ?? ''),
        fieldRules,
      );

      setErrors((prev) => {
        const newErrors = {...prev};
        if (!result.isValid && result.error) {
          newErrors[field] = result.error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      return result.error || '';
    },
    [data, validationRules],
  );

  // Update field value
  const updateField = useCallback(
    (field: keyof T, value: FieldValue<T>) => {
      // Simple sanitization for strings
      const processedValue = typeof value === 'string' ? value.trim() : value;

      setData((prev) => ({...prev, [field]: processedValue}));

      // Mark field as touched
      setTouchedFields((prev) => new Set(prev).add(field));

      // Validate on change if enabled
      if (validateOnChange) {
        validateSingleField(field);
      }
    },
    [validateOnChange, validateSingleField],
  );

  // Clear errors
  const clearErrors = useCallback((fields?: (keyof T)[]) => {
    if (fields) {
      setErrors((prev) => {
        const newErrors = {...prev};
        fields.forEach((field) => {
          delete newErrors[field];
        });
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof T) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  }, []);

  // Check if field is touched
  const isFieldTouched = useCallback(
    (field: keyof T) => {
      return touchedFields.has(field);
    },
    [touchedFields],
  );

  // Reset form
  const reset = useCallback(
    (newData?: T) => {
      const resetData = newData || initialData;
      setData(resetData);
      setErrors({});
      setWarnings({});
      setTouchedFields(new Set());
      setIsValidating(false);
    },
    [initialData],
  );

  // Event handlers
  const handleFieldChange = useCallback(
    (field: keyof T) => {
      return (value: FieldValue<T>) => {
        updateField(field, value);
      };
    },
    [updateField],
  );

  const handleFieldBlur = useCallback(
    (field: keyof T) => {
      return () => {
        markFieldTouched(field);
        if (validateOnBlur) {
          validateSingleField(field);
        }
      };
    },
    [markFieldTouched, validateOnBlur, validateSingleField],
  );

  // Computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(originalData);
  }, [data, originalData]);

  // Add missing state for interface compatibility
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert touched fields set to object for interface compatibility
  const touched = useMemo(() => {
    const touchedObj: Partial<Record<keyof T, boolean>> = {};
    touchedFields.forEach((field) => {
      touchedObj[field] = true;
    });
    return touchedObj;
  }, [touchedFields]);

  // Validate all fields function
  const validateAllFields = useCallback(() => {
    const result = validate();
    return {isValid: result.isValid, errors};
  }, [validate, errors]);

  // Handle change events (renamed for interface compatibility)
  const handleChange = useCallback(
    (field: keyof T) => {
      return (value: FieldValue<T>) => {
        updateField(field, value);
      };
    },
    [updateField],
  );

  // Handle blur events
  const handleBlur = useCallback(
    (field: keyof T) => {
      return () => {
        markFieldTouched(field);
        if (validateOnBlur) {
          validateSingleField(field);
        }
      };
    },
    [markFieldTouched, validateOnBlur, validateSingleField],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void> | void) => {
      return async () => {
        setIsSubmitting(true);

        // Validate all fields
        const validationResult = validateAllFields();

        if (validationResult.isValid) {
          try {
            await onSubmit(data);
          } catch (error) {
            appLogger.error('Form submission error:', error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [data, validateAllFields],
  );

  // Reset form
  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  // Set field value
  const setFieldValue = useCallback(
    (field: keyof T, value: FieldValue<T>) => {
      updateField(field, value);
    },
    [updateField],
  );

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => {
      const newErrors = {...prev};
      if (error === null) {
        delete newErrors[field];
      } else {
        newErrors[field] = error;
      }
      return newErrors;
    });
  }, []);

  // Clear field error
  const clearFieldError = useCallback(
    (field: keyof T) => {
      setFieldError(field, null);
    },
    [setFieldError],
  );

  // Validate form function for interface
  const validateFormMethod = useCallback(() => {
    return validateAllFields();
  }, [validateAllFields]);

  return {
    formData: data,
    errors,
    warnings,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateField: validateSingleField,
    validateForm: validateFormMethod,
    clearErrors: clearAllErrors,
    clearFieldError,
  };
};

export default useFormValidation;
