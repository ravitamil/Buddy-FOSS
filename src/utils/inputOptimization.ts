import React, {useState, useCallback, useRef, useEffect} from 'react';

/**
 * Input optimization utilities to prevent keyboard dismissal and improve performance
 */

/**
 * Custom hook for debounced input values
 */
export const useDebouncedInput = (
  initialValue: string,
  delay: number = 300,
  onDebouncedChange?: (value: string) => void,
) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
        onDebouncedChange?.(newValue);
      }, delay);
    },
    [delay, onDebouncedChange],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
  }, [initialValue]);

  return {
    value,
    debouncedValue,
    handleChange,
    isDebouncing: value !== debouncedValue,
  };
};

/**
 * Custom hook for controlled input that prevents keyboard dismissal
 */
export const useControlledInput = (
  initialValue: string,
  onChangeText?: (text: string) => void,
  validation?: (text: string) => boolean,
) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      // Validate input if validation function is provided
      if (validation && !validation(text)) {
        setHasError(true);
        return;
      }

      setHasError(false);
      setInternalValue(text);
      onChangeText?.(text);
    },
    [onChangeText, validation],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Update internal value when initialValue changes
  useEffect(() => {
    setInternalValue(initialValue);
  }, [initialValue]);

  return {
    value: internalValue,
    onChangeText: handleChangeText,
    onFocus: handleFocus,
    onBlur: handleBlur,
    isFocused,
    hasError,
  };
};

/**
 * Custom hook for optimized search input with debouncing
 */
export const useSearchInput = (
  onSearch: (query: string) => void,
  debounceDelay: number = 300,
  minQueryLength: number = 2,
) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      setIsSearching(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (searchQuery.length >= minQueryLength || searchQuery.length === 0) {
          onSearch(searchQuery);
        }
        setIsSearching(false);
      }, debounceDelay);
    },
    [onSearch, debounceDelay, minQueryLength],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    onSearch('');
    setIsSearching(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [onSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    isSearching,
    handleSearch,
    clearSearch,
  };
};

/**
 * Custom hook for form input with validation and error handling
 */
export const useFormInput = <T = string>(
  initialValue: T,
  validator?: (value: T) => string | null,
  formatter?: (value: string) => T,
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (newValue: string) => {
      const formattedValue = formatter ? formatter(newValue) : (newValue as T);
      setValue(formattedValue);

      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [formatter, error],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);

    if (validator) {
      const validationError = validator(value);
      setError(validationError);
    }
  }, [validator, value]);

  const validate = useCallback(() => {
    if (validator) {
      const validationError = validator(value);
      setError(validationError);
      return validationError === null;
    }
    return true;
  }, [validator, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    isValid: error === null,
    handleChange,
    handleBlur,
    validate,
    reset,
  };
};

/**
 * Input validation utilities
 */
export const inputValidators = {
  required: (value: string) => (value.trim() === '' ? 'This field is required' : null),

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
  },

  phone: (value: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return !phoneRegex.test(value) ? 'Please enter a valid phone number' : null;
  },

  minLength: (min: number) => (value: string) =>
    value.length < min ? `Must be at least ${min} characters` : null,

  maxLength: (max: number) => (value: string) =>
    value.length > max ? `Must be no more than ${max} characters` : null,

  numeric: (value: string) => {
    const numericRegex = /^\d*\.?\d*$/;
    return !numericRegex.test(value) ? 'Please enter a valid number' : null;
  },

  currency: (value: string) => {
    const currencyRegex = /^\d*\.?\d{0,2}$/;
    return !currencyRegex.test(value) ? 'Please enter a valid amount' : null;
  },

  combine:
    (...validators: Array<(value: string) => string | null>) =>
    (value: string) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    },
};

/**
 * Input formatters
 */
export const inputFormatters = {
  currency: (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  },

  phone: (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length >= 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    }

    return cleaned;
  },

  uppercase: (value: string): string => value.toUpperCase(),

  lowercase: (value: string): string => value.toLowerCase(),

  capitalize: (value: string): string =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),

  alphanumeric: (value: string): string => value.replace(/[^a-zA-Z0-9]/g, ''),

  numeric: (value: string): string => value.replace(/[^0-9]/g, ''),
};

/**
 * Performance-optimized TextInput component wrapper
 */
export interface OptimizedTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  validator?: (value: string) => string | null;
  formatter?: (value: string) => string;
  debounceDelay?: number;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
}

type KeyboardPersistentInputRef = {
  isFocused: () => boolean;
  focus: () => void;
};

const isKeyboardPersistentInputRef = (ref: unknown): ref is KeyboardPersistentInputRef =>
  typeof ref === 'object' &&
  ref !== null &&
  'isFocused' in ref &&
  'focus' in ref &&
  typeof ref.isFocused === 'function' &&
  typeof ref.focus === 'function';

/**
 * Hook for preventing keyboard dismissal in forms
 */
export const useKeyboardPersistence = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef<Set<KeyboardPersistentInputRef>>(new Set());

  const registerInput = useCallback((ref: unknown) => {
    if (isKeyboardPersistentInputRef(ref)) {
      inputRefs.current.add(ref);
    }
  }, []);

  const unregisterInput = useCallback((ref: unknown) => {
    if (isKeyboardPersistentInputRef(ref)) {
      inputRefs.current.delete(ref);
    }
  }, []);

  const focusNextInput = useCallback(() => {
    const inputs = Array.from(inputRefs.current);
    const currentIndex = inputs.findIndex((input) => input.isFocused());
    const nextIndex = (currentIndex + 1) % inputs.length;

    if (inputs[nextIndex]) {
      inputs[nextIndex].focus();
    }
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = () => setKeyboardVisible(true);
    const keyboardDidHideListener = () => setKeyboardVisible(false);

    // Note: In a real React Native app, you would use Keyboard.addListener
    // This is a placeholder for the web environment

    return () => {
      // Cleanup listeners
    };
  }, []);

  return {
    keyboardVisible,
    registerInput,
    unregisterInput,
    focusNextInput,
  };
};
