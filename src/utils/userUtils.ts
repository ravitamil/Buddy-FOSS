import {UnifiedAuthService} from '../services/UnifiedAuthService';

/**
 * Standardized utility functions for current user detection and management
 * This ensures consistent user identification across all screens
 */

export interface CurrentUserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAnonymous: boolean;
}

/**
 * Get standardized current user information
 * This is the single source of truth for current user detection
 */
export const getCurrentUserInfo = (
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): CurrentUserInfo => {
  // Get authenticated user as the primary source
  const authService = UnifiedAuthService.getInstance();
  const authUser = authService.getCurrentUserSync();

  if (!authUser) {
    throw new Error('No authenticated user found');
  }

  // Determine the display name with priority order
  let displayName = '';

  if (userDisplayName && userDisplayName.trim()) {
    displayName = userDisplayName.trim();
  } else if (userFirstName && userFirstName.trim()) {
    displayName = userFirstName.trim();
  } else if (getUserDisplayName) {
    displayName = getUserDisplayName();
  } else if (authUser.displayName) {
    displayName = authUser.displayName;
  } else if (authUser.email) {
    displayName = authUser.email.split('@')[0];
  } else {
    displayName = authUser.isAnonymous ? 'Guest User' : 'User';
  }

  return {
    id: authUser.uid,
    name: displayName,
    email: authUser.email || undefined,
    phone: authUser.phoneNumber || undefined,
    isAnonymous: authUser.isAnonymous,
  };
};

/**
 * Check if a member name matches the current user
 * Uses case-insensitive comparison with proper trimming
 */
export const isCurrentUserMember = (
  memberName: string,
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): boolean => {
  try {
    const currentUser = getCurrentUserInfo(userFirstName, userDisplayName, getUserDisplayName);
    const normalizedMemberName = memberName.toLowerCase().trim();
    const normalizedCurrentName = currentUser.name.toLowerCase().trim();

    return normalizedMemberName === normalizedCurrentName;
  } catch (error) {
    appLogger.warn('isCurrentUserMember: Error checking current user:', error);
    return false;
  }
};

/**
 * Find current user member in a group members array
 */
export const findCurrentUserMember = <T extends {name: string; id?: string}>(
  members: T[],
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): T | undefined => {
  return members.find((member) =>
    isCurrentUserMember(member.name, userFirstName, userDisplayName, getUserDisplayName),
  );
};

/**
 * Get current user's member ID from a group
 */
export const getCurrentUserMemberId = <T extends {name: string; id: string}>(
  members: T[],
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): string | undefined => {
  const currentMember = findCurrentUserMember(
    members,
    userFirstName,
    userDisplayName,
    getUserDisplayName,
  );
  return currentMember?.id;
};

/**
 * Check if current user is the creator of a group
 */
export const isCurrentUserCreator = (
  createdBy: string,
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): boolean => {
  try {
    const currentUser = getCurrentUserInfo(userFirstName, userDisplayName, getUserDisplayName);
    return currentUser.id === createdBy;
  } catch (error) {
    appLogger.warn('isCurrentUserCreator: Error checking current user:', error);
    return false;
  }
};

/**
 * Generate initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format user display name for UI
 */
export const formatUserDisplayName = (
  memberName: string,
  userFirstName?: string | null,
  userDisplayName?: string | null,
  getUserDisplayName?: () => string,
): string => {
  if (isCurrentUserMember(memberName, userFirstName, userDisplayName, getUserDisplayName)) {
    return 'You';
  }
  return memberName;
};
