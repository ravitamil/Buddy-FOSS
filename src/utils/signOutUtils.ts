/**
 * Centralized Sign Out Utilities
 * Provides consistent sign out functionality across the application
 */

import {router} from 'expo-router';
import {logger as rootLogger} from '../services/LoggerService';
import {SupabaseAuthService} from '../services/SupabaseAuthService';

const appLogger = rootLogger.serviceLogger('SignOutUtils');

/** Complete sign out: UnifiedAuthService handles remote sign out and comprehensive data wipe */
export async function performCompleteSignOut(): Promise<void> {
  try {
    appLogger.debug('🚪 SignOutUtils: Executing UnifiedAuthService sign out...');
    const {UnifiedAuthService} = await import('../services/UnifiedAuthService');
    const authService = UnifiedAuthService.getInstance();
    await authService.signOut();
    appLogger.debug('✅ SignOutUtils: Complete sign out finished successfully');
  } catch (error) {
    appLogger.error('❌ SignOutUtils: Complete sign out process failed:', error);
    throw error;
  }
}

/** Reset navigation to auth screen after sign out */
export function resetNavigationToAuth(): void {
  appLogger.debug('🧭 SignOutUtils: Resetting navigation to authentication screen...');

  try {
    // Use replace to cleanly mount root auth guard
    router.replace('/');
    appLogger.debug('✅ SignOutUtils: Navigation reset completed');
  } catch (error) {
    appLogger.error('❌ SignOutUtils: Navigation reset failed:', error);
    try {
      router.push('/');
      appLogger.debug('✅ SignOutUtils: Alternative navigation completed');
    } catch (altError) {
      appLogger.error('❌ SignOutUtils: Alternative navigation also failed:', altError);
    }
  }
}

/** Convenience: sign out then navigate to auth */
export async function signOutAndNavigate(): Promise<void> {
  appLogger.debug('🚪 SignOutUtils: Starting sign out with navigation...');

  try {
    await performCompleteSignOut();
    resetNavigationToAuth();
    appLogger.debug('✅ SignOutUtils: Sign out with navigation completed');
  } catch (error) {
    appLogger.error('❌ SignOutUtils: Sign out with navigation failed:', error);

    // Still try to navigate even if sign out partially failed
    try {
      resetNavigationToAuth();
    } catch (navError) {
      appLogger.error('❌ SignOutUtils: Emergency navigation reset failed:', navError);
    }

    throw error;
  }
}
