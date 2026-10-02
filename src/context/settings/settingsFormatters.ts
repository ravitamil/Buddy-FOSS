import {getCurrencySymbol} from '@/constants/currencies';
import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('SettingsContext');

export const createCurrencyFormatter = (currency: string) => {
  return (amount: number): string => {
    const symbol = getCurrencySymbol(currency);

    if (Number.isNaN(amount) || !Number.isFinite(amount)) {
      return `${symbol}0`;
    }

    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);

    const formatWithDecimals = (value: number, suffix = ''): string => {
      const isWholeNumber = value % 1 === 0;
      return `${symbol}${isWholeNumber ? value.toFixed(0) : value.toFixed(2)}${suffix}`;
    };

    let formatted: string;

    if (absAmount >= 1_000_000_000) {
      formatted = formatWithDecimals(absAmount / 1_000_000_000, 'B');
    } else if (absAmount >= 1_000_000) {
      formatted = formatWithDecimals(absAmount / 1_000_000, 'M');
    } else if (absAmount >= 1_000) {
      formatted = formatWithDecimals(absAmount / 1_000, 'K');
    } else {
      formatted = formatWithDecimals(absAmount);
    }

    return isNegative ? `-${formatted}` : formatted;
  };
};

export const createExactCurrencyFormatter = (currency: string) => {
  return (amount: number): string => {
    const symbol = getCurrencySymbol(currency);

    if (Number.isNaN(amount) || !Number.isFinite(amount)) {
      return `${symbol}0.00`;
    }

    return `${symbol}${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
  };
};

export const createDateFormatter = (language: string) => {
  return (date: Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
    try {
      if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      switch (format) {
        case 'relative':
          if (diffDays === 0) return 'Today';
          if (diffDays === 1) return 'Yesterday';
          if (diffDays === -1) return 'Tomorrow';
          if (diffDays > 0 && diffDays <= 7) return `${diffDays} days ago`;
          if (diffDays < 0 && diffDays >= -7) return `In ${Math.abs(diffDays)} days`;
          return date.toLocaleDateString(language, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          });

        case 'long':
          return date.toLocaleDateString(language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

        case 'short':
        default:
          return date.toLocaleDateString(language, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          });
      }
    } catch (error) {
      logger.error('Date formatting failed', error);
      return date.toLocaleDateString();
    }
  };
};
