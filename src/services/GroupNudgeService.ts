import {supabase} from '../lib/supabase';
import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('GroupNudgeService');

/**
 * Parameters for sending a nudge push notification to a debtor.
 */
export interface NudgeParams {
  groupId: string;
  debtorSupabaseUserId: string;
  amount: number;
  groupName: string;
}

/**
 * Result of a nudge call.
 */
export interface NudgeResult {
  sent: boolean;
  alreadyNudged: boolean;
  reason?: string;
}

/**
 * Parameters needed to generate a shareable invite message.
 */
export interface ShareInviteParams {
  groupId: string;
  inviteToken: string;
  groupName: string;
  creditorName: string;
  amount: number;
  currencySymbol?: string;
}

const APP_STORE_URL = 'https://apps.apple.com/app/buddy/id6000000000'; // Update when published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.buddy.app';

interface NudgeEdgeResponse {
  sent?: boolean;
  reason?: string;
}

interface NudgeInvokeResult {
  data: NudgeEdgeResponse | null;
  error: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNudgeEdgeResponse = (value: unknown): value is NudgeEdgeResponse =>
  isRecord(value) &&
  (!('sent' in value) || typeof value.sent === 'boolean') &&
  (!('reason' in value) || typeof value.reason === 'string');

const isNudgeInvokeResult = (value: unknown): value is NudgeInvokeResult =>
  isRecord(value) &&
  'error' in value &&
  (!('data' in value) || value.data === null || isNudgeEdgeResponse(value.data));

const errorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }
  return '';
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const localNudgeLog = new Map<string, number>();

export class GroupNudgeService {
  /**
   * Checks if a debtor was recently nudged within the last 24 hours.
   */
  static isRecentlyNudged(groupId: string, debtorId: string): boolean {
    const key = `${groupId}:${debtorId}`;
    const lastNudge = localNudgeLog.get(key);
    if (!lastNudge) return false;
    return Date.now() - lastNudge < TWENTY_FOUR_HOURS_MS;
  }

  /**
   * Sends a nudge notification to a debtor via the Supabase Edge Function.
   * Enforces a 24-hour rate limit both locally and server-side.
   */
  static async nudgeMember(params: NudgeParams): Promise<NudgeResult> {
    const throttleKey = `${params.groupId}:${params.debtorSupabaseUserId}`;

    // 1. Optimistic local check
    if (this.isRecentlyNudged(params.groupId, params.debtorSupabaseUserId)) {
      return {sent: false, alreadyNudged: true};
    }

    try {
      const response: unknown = await supabase.functions.invoke<NudgeEdgeResponse>('nudge-member', {
        body: {
          groupId: params.groupId,
          debtorId: params.debtorSupabaseUserId,
          amount: params.amount,
          groupName: params.groupName,
        },
      });

      if (!isNudgeInvokeResult(response)) {
        throw new Error('Invalid nudge response');
      }

      const {error} = response;

      if (error) {
        let message = errorMessage(error);
        if (
          typeof (error as {context?: {json?: () => Promise<{error?: string}>}}).context?.json ===
          'function'
        ) {
          try {
            const body = await (
              error as {context: {json: () => Promise<{error?: string}>}}
            ).context.json();
            if (body?.error) {
              message = body.error;
            }
          } catch {
            // Context already consumed or not JSON
          }
        }
        if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
          localNudgeLog.set(throttleKey, Date.now());
          return {sent: false, alreadyNudged: true};
        }
        logger.warn('Nudge edge function error response:', message || error);
        return {sent: false, alreadyNudged: false, reason: message};
      }

      // Record successful nudge locally
      localNudgeLog.set(throttleKey, Date.now());

      return {sent: true, alreadyNudged: false};
    } catch (err: unknown) {
      logger.warn('Nudge call failed:', err);
      return {sent: false, alreadyNudged: false, reason: errorMessage(err)};
    }
  }

  /**
   * Returns a ready-to-share invite message string for the native share sheet.
   * Includes the deep link, App Store link, and Play Store link.
   */
  static getShareInviteMessage(params: ShareInviteParams): string {
    const {groupId, inviteToken, groupName, creditorName, amount, currencySymbol = '₹'} = params;
    const deepLink = `buddy://invite/group/${groupId}?token=${inviteToken}`;
    const formattedAmount = `${currencySymbol}${amount.toFixed(2)}`;

    return (
      `Hey! ${creditorName} is tracking group expenses on Buddy app 💰\n\n` +
      `You owe ${formattedAmount} in "${groupName}". Join to keep track and settle up easily!\n\n` +
      `📱 Open in Buddy: ${deepLink}\n\n` +
      `⬇️ Download Buddy:\n` +
      `iOS: ${APP_STORE_URL}\n` +
      `Android: ${PLAY_STORE_URL}`
    );
  }
}

export default GroupNudgeService;
