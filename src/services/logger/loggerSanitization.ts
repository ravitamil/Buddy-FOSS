import type {LogEntry} from './loggerTypes';

const PII_FIELDS = ['email', 'phone', 'phoneNumber', 'address', 'ssn', 'creditCard', 'password'];

export function sanitizeData(data: unknown): unknown {
  if (!data) return data;

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const clonedData = cloneLogData(data);
  return sanitizeObject(clonedData);
}

export function sanitizeContext(context?: LogEntry['context']): LogEntry['context'] {
  if (!context) return context;

  const sanitized = {...context};

  if (!__DEV__ && sanitized.userId) {
    sanitized.userId = `user_${sanitized.userId.substring(0, 4)}...`;
  }

  return sanitized;
}

function cloneLogData(data: object): unknown {
  try {
    const serialized = JSON.stringify(data, (_key: string, value: unknown): unknown => {
      if (typeof value === 'function') return '[Function]';
      if (typeof value === 'symbol') return String(value);
      return value;
    });

    if (serialized === undefined) {
      return '[Unserializable Object]';
    }

    return JSON.parse(serialized) as unknown;
  } catch {
    try {
      return Array.isArray(data)
        ? [...(data as unknown[])]
        : {...(data as Record<string, unknown>)};
    } catch {
      return '[Unserializable Object]';
    }
  }
}

function sanitizeObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      PII_FIELDS.includes(key.toLowerCase()) ? '[REDACTED]' : sanitizeObject(entry),
    ]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
