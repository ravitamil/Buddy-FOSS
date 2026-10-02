declare global {
  // Global logger instance used across modules without explicit imports
  var appLogger: typeof import('../services/LoggerService').default;
}

export {};
