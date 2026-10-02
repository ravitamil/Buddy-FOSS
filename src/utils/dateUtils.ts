import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

interface TimestampLike {
  toDate: () => Date;
}

function isTimestampLike(input: unknown): input is TimestampLike {
  return (
    typeof input === 'object' &&
    input !== null &&
    'toDate' in input &&
    typeof input.toDate === 'function'
  );
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns Current date as string in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Parse date string or Date object to dayjs object
 * @param date - Date string or Date object
 * @returns dayjs object
 */
export function parseDate(date: string | Date): dayjs.Dayjs {
  return dayjs(date);
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @param format - Format string (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: string = 'MMM DD, YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Check if date1 is before date2
 * @param date1 - First date
 * @param date2 - Second date
 * @returns boolean indicating if date1 is before date2
 */
export function isBefore(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isBefore(dayjs(date2));
}

/**
 * Check if date1 is after date2
 * @param date1 - First date
 * @param date2 - Second date
 * @returns boolean indicating if date1 is after date2
 */
export function isAfter(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isAfter(dayjs(date2));
}

/**
 * Check if two dates are the same
 * @param date1 - First date
 * @param date2 - Second date
 * @returns boolean indicating if dates are the same
 */
export function isSame(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isSame(dayjs(date2));
}

/**
 * Add days to a date
 * @param date - Date to add days to
 * @param days - Number of days to add
 * @returns New date as string in YYYY-MM-DD format
 */
export function addDays(date: string | Date, days: number): string {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
}

/**
 * Add months to a date
 * @param date - Date to add months to
 * @param months - Number of months to add
 * @returns New date as string in YYYY-MM-DD format
 */
export function addMonths(date: string | Date, months: number): string {
  return dayjs(date).add(months, 'month').format('YYYY-MM-DD');
}

/**
 * Add years to a date
 * @param date - Date to add years to
 * @param years - Number of years to add
 * @returns New date as string in YYYY-MM-DD format
 */
export function addYears(date: string | Date, years: number): string {
  return dayjs(date).add(years, 'year').format('YYYY-MM-DD');
}

/**
 * Calculate difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days (positive if date1 > date2)
 */
export function diffInDays(date1: string | Date, date2: string | Date): number {
  return dayjs(date1).diff(dayjs(date2), 'day');
}

/**
 * Calculate difference in months between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in months (positive if date1 > date2)
 */
export function diffInMonths(date1: string | Date, date2: string | Date): number {
  return dayjs(date1).diff(dayjs(date2), 'month');
}

/**
 * Get start of month for a date
 * @param date - Date to get start of month for
 * @returns Start of month as string in YYYY-MM-DD format
 */
export function startOfMonth(date: string | Date): string {
  return dayjs(date).startOf('month').format('YYYY-MM-DD');
}

/**
 * Get end of month for a date
 * @param date - Date to get end of month for
 * @returns End of month as string in YYYY-MM-DD format
 */
export function endOfMonth(date: string | Date): string {
  return dayjs(date).endOf('month').format('YYYY-MM-DD');
}

/**
 * Get start of day for a date
 * @param date - Date to get start of day for
 * @returns Start of day as string in YYYY-MM-DD format
 */
export function startOfDay(date: string | Date): string {
  return dayjs(date).startOf('day').format('YYYY-MM-DD');
}

/**
 * Get end of day for a date
 * @param date - Date to get end of day for
 * @returns End of day as string in YYYY-MM-DD format
 */
export function endOfDay(date: string | Date): string {
  return dayjs(date).endOf('day').format('YYYY-MM-DD');
}

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: string | Date): boolean {
  return dayjs(date).isValid();
}

/**
 * Convert date to UTC format
 * @param date - Date to convert
 * @returns UTC date as string in YYYY-MM-DD format
 */
export function toUTC(date: string | Date): string {
  return dayjs(date).utc().format('YYYY-MM-DD');
}

/**
 * Convert date from UTC format
 * @param date - UTC date to convert
 * @returns Local date as string in YYYY-MM-DD format
 */
export function fromUTC(date: string | Date): string {
  return dayjs.utc(date).local().format('YYYY-MM-DD');
}

/**
 * Safely convert various date-like inputs to epoch milliseconds.
 * Handles Date, ISO strings, numbers, and Firestore Timestamp-like objects.
 */
export function getTimeSafe(input: unknown): number {
  if (input == null) return 0;
  if (input instanceof Date) return input.getTime();
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    const parsed = Date.parse(input);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Firestore Timestamp-like object
  try {
    if (isTimestampLike(input)) {
      const d = input.toDate();
      if (d instanceof Date) return d.getTime();
    }
  } catch {}
  return 0;
}
