// Android Fabric safety guard:
// Disable clipped-subview defaults to prevent addViewAt re-parenting crashes
// when screens/lists are rapidly detached and re-attached.
try {
  const {Platform, ScrollView, FlatList, SectionList, VirtualizedList} = require('react-native');
  if (Platform?.OS === 'android') {
    const disableClipping = (Component) => {
      if (!Component) return;
      Component.defaultProps = {
        ...(Component.defaultProps || {}),
        removeClippedSubviews: false,
      };
    };
    disableClipping(ScrollView);
    disableClipping(FlatList);
    disableClipping(SectionList);
    disableClipping(VirtualizedList);
  }
} catch (e) {
  console.warn('[global] Could not apply Android clipping safety guard:', e?.message || e);
}

// Provide a safe global logger stub immediately
if (!globalThis.EnhancedLoggerService) {
  const stub = {
    debug: (...args) => console.log('[Logger:stub]', ...args),
    info: (...args) => console.info('[Logger:stub]', ...args),
    warn: (...args) => console.warn('[Logger:stub]', ...args),
    error: (...args) => console.error('[Logger:stub]', ...args),
    critical: (...args) => console.error('[Logger:stub]', ...args),
    getRecentLogs: () => [],
  };
  globalThis.EnhancedLoggerService = stub;
  globalThis.appLogger = stub;
  try {
    (0, eval)('var appLogger = globalThis.appLogger');
  } catch (_) {
    // Ignore if eval is restricted
  }
}

// Attach the real app logger instance and create legacy global bindings for
// modules that still read logger globals during startup.
try {
  const real = require('./src/services/LoggerService').default;
  if (real) {
    globalThis.EnhancedLoggerService = real;
    globalThis.appLogger = real;
    // Create global lexical vars for modules referencing bare identifiers.
    try {
      (0, eval)('var EnhancedLoggerService = globalThis.EnhancedLoggerService');
      (0, eval)('var appLogger = globalThis.appLogger');
    } catch (_) {
      // Ignore if eval is restricted
    }
  }
} catch (e) {
  // Keep stub and log once
  console.warn('[global] Failed to initialize app logger, using stub:', e?.message || e);
}
