import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('ContextFoundation');

interface SyncAuthUser {
  uid?: string;
  isAnonymous?: boolean;
}

export interface SyncAuthService {
  getCurrentUser: () => SyncAuthUser | null | Promise<SyncAuthUser | null>;
}

interface DatabaseLikeError {
  code?: string;
}

export interface SyncOptions {
  skipIfAnonymous?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export const syncWithRemote = async <T>(
  localData: T[],
  remoteOperation: (data: T[]) => Promise<void>,
  context: string,
  options: SyncOptions = {},
  authService?: SyncAuthService,
): Promise<void> => {
  const {skipIfAnonymous = true, retryOnFailure = false, maxRetries = 3} = options;

  try {
    let user: SyncAuthUser | null = null;

    if (authService) {
      user = await authService.getCurrentUser();
    } else {
      try {
        const {UnifiedAuthService} = await import('../services/UnifiedAuthService');
        user = await UnifiedAuthService.getInstance().getCurrentUser();
      } catch {
        logger.debug('Auth service not available, proceeding with sync', {context});
      }
    }

    if (skipIfAnonymous && user && (!user.uid || user.isAnonymous)) {
      logger.debug('Skipping remote sync (no authenticated user)', {context});
      return;
    }

    await remoteOperation(localData);
    logger.debug('Successfully synced to remote', {context});
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? (error as DatabaseLikeError).code
        : undefined;
    const hint = appLogger.getDatabaseErrorHint(code);
    const telemetry = appLogger.buildDatabaseTelemetryTags(
      'context-foundation',
      'syncWithRemote',
      code,
    );
    logger.error('Remote sync failed, data saved locally', error, {context, code, hint, telemetry});

    if (retryOnFailure && maxRetries > 0) {
      logger.debug('Scheduling retry for remote sync', {context});
    }
  }
};
