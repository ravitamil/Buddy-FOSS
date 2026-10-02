/**
 * Authentication Token Manager
 * Handles token validation, refresh, and management
 */

import {AuthTokens} from '../types/auth.types';
import {logger as appLogger} from './LoggerService';

type JwtPayload = Record<string, unknown>;

interface IdTokenUserInfo {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  iat?: number;
  exp?: number;
}

const isRecord = (value: unknown): value is JwtPayload =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readStringClaim = (payload: JwtPayload, claim: string): string | undefined => {
  const value = payload[claim];
  return typeof value === 'string' ? value : undefined;
};

const readNumberClaim = (payload: JwtPayload, claim: string): number | undefined => {
  const value = payload[claim];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const readBooleanClaim = (payload: JwtPayload, claim: string): boolean | undefined => {
  const value = payload[claim];
  return typeof value === 'boolean' ? value : undefined;
};

const normalizeBase64UrlPayload = (payload: string): string => {
  const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
  return base64Payload + '='.repeat((4 - (base64Payload.length % 4)) % 4);
};

class AuthTokenManager {
  private static instance: AuthTokenManager;
  private readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes buffer before expiry

  private constructor() {}

  public static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager();
    }
    return AuthTokenManager.instance;
  }

  /**
   * Check if token is valid (not expired)
   */
  public isTokenValid(tokens: AuthTokens): boolean {
    if (!tokens.expiresAt) {
      return false;
    }

    const now = Date.now();
    const expiryWithBuffer = tokens.expiresAt - this.TOKEN_BUFFER_TIME;

    return now < expiryWithBuffer;
  }

  /**
   * Check if token needs refresh (within buffer time)
   */
  public needsRefresh(tokens: AuthTokens): boolean {
    if (!tokens.expiresAt) {
      return true;
    }

    const now = Date.now();
    const expiryWithBuffer = tokens.expiresAt - this.TOKEN_BUFFER_TIME;

    return now >= expiryWithBuffer;
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  public getTimeUntilExpiry(tokens: AuthTokens): number {
    if (!tokens.expiresAt) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, tokens.expiresAt - now);
  }

  /**
   * Get time until token needs refresh (in milliseconds)
   */
  public getTimeUntilRefresh(tokens: AuthTokens): number {
    if (!tokens.expiresAt) {
      return 0;
    }

    const now = Date.now();
    const refreshTime = tokens.expiresAt - this.TOKEN_BUFFER_TIME;
    return Math.max(0, refreshTime - now);
  }

  /**
   * Create tokens object with expiry time
   */
  public createTokens(
    idToken: string,
    accessToken: string,
    expiresIn?: number,
    refreshToken?: string,
  ): AuthTokens {
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : Date.now() + 60 * 60 * 1000; // Default 1 hour

    return {
      idToken,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Update token expiry time
   */
  public updateTokenExpiry(tokens: AuthTokens, expiresIn: number): AuthTokens {
    return {
      ...tokens,
      expiresAt: Date.now() + expiresIn * 1000,
    };
  }

  /**
   * Validate token format (basic validation)
   */
  public validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Decode JWT payload (without verification)
   * Note: This is for reading claims only, not for security validation
   */
  public decodeJWTPayload(token: string): JwtPayload | null {
    try {
      if (!this.validateTokenFormat(token)) {
        return null;
      }

      const parts = token.split('.');
      const payload = parts[1];
      if (!payload) {
        return null;
      }

      const decoded = atob(normalizeBase64UrlPayload(payload));
      const parsedPayload: unknown = JSON.parse(decoded);
      return isRecord(parsedPayload) ? parsedPayload : null;
    } catch (error) {
      appLogger.error('Failed to decode JWT payload:', error);
      return null;
    }
  }

  /**
   * Get token expiry from JWT
   */
  public getJWTExpiry(token: string): number | null {
    const payload = this.decodeJWTPayload(token);
    if (!payload) {
      return null;
    }

    const expiresAt = readNumberClaim(payload, 'exp');
    if (!expiresAt) {
      return null;
    }

    // JWT exp is in seconds, convert to milliseconds
    return expiresAt * 1000;
  }

  /**
   * Get user info from ID token
   */
  public getUserInfoFromIdToken(idToken: string): IdTokenUserInfo | null {
    const payload = this.decodeJWTPayload(idToken);
    if (!payload) {
      return null;
    }

    return {
      sub: readStringClaim(payload, 'sub'), // User ID
      email: readStringClaim(payload, 'email'),
      email_verified: readBooleanClaim(payload, 'email_verified'),
      name: readStringClaim(payload, 'name'),
      given_name: readStringClaim(payload, 'given_name'),
      family_name: readStringClaim(payload, 'family_name'),
      picture: readStringClaim(payload, 'picture'),
      locale: readStringClaim(payload, 'locale'),
      iat: readNumberClaim(payload, 'iat'), // Issued at
      exp: readNumberClaim(payload, 'exp'), // Expires at
    };
  }

  /**
   * Check if tokens are from the same user
   */
  public areTokensFromSameUser(tokens1: AuthTokens, tokens2: AuthTokens): boolean {
    if (!tokens1.idToken || !tokens2.idToken) {
      return false;
    }

    const user1 = this.getUserInfoFromIdToken(tokens1.idToken);
    const user2 = this.getUserInfoFromIdToken(tokens2.idToken);

    if (!user1?.sub || !user2?.sub) {
      return false;
    }

    return user1.sub === user2.sub;
  }

  /**
   * Clear sensitive token data from memory
   */
  public clearTokens(tokens: AuthTokens): void {
    // In a real implementation, you might want to overwrite the token strings
    // This is a placeholder for security cleanup
    tokens.idToken = '';
    tokens.accessToken = '';
    if (tokens.refreshToken) {
      tokens.refreshToken = '';
    }
  }

  /**
   * Get authorization header value
   */
  public getAuthorizationHeader(tokens: AuthTokens): string | null {
    if (!this.isTokenValid(tokens)) {
      return null;
    }

    return `Bearer ${tokens.accessToken}`;
  }

  /**
   * Schedule automatic token refresh
   */
  public scheduleTokenRefresh(
    tokens: AuthTokens,
    refreshCallback: () => Promise<void>,
  ): ReturnType<typeof setTimeout> | null {
    const timeUntilRefresh = this.getTimeUntilRefresh(tokens);

    if (timeUntilRefresh <= 0) {
      // Token already needs refresh
      this.runRefreshCallback(refreshCallback);
      return null;
    }

    return setTimeout(() => {
      this.runRefreshCallback(refreshCallback);
    }, timeUntilRefresh);
  }

  private runRefreshCallback(refreshCallback: () => Promise<void>): void {
    void refreshCallback().catch((error: unknown) => {
      appLogger.error('Token refresh callback failed:', error);
    });
  }
}

export default AuthTokenManager;
