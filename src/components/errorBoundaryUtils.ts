export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const tokenValue = (token: unknown, fallback: string): string => {
  if (isRecord(token) && typeof token.val === 'string') {
    return token.val;
  }

  return fallback;
};

export const categorizeBoundaryError = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  if (message.includes('timeout')) {
    return 'timeout';
  }
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'permission';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'notFound';
  }

  return 'unknown';
};
