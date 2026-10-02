/**
 * CurrencyService
 *
 * Fetches live FX rates via a Supabase Edge Function proxy to Frankfurter.
 * Caches results in memory and AsyncStorage with a 6-hour TTL.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger as appLogger} from './LoggerService';
import {supabase} from '../lib/supabase';

const logger = appLogger.contextLogger('CurrencyService');

// ─── Types ───────────────────────────────────────────────────────────────────

interface RateCacheEntry {
  rates: Record<string, number>;
  fetchedAt: number; // ms timestamp
}

interface FxRatesResponse {
  rates: Record<string, number>;
}

interface EdgeFunctionError {
  message?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function parseRates(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) return null;

  const rates: Record<string, number> = {};
  Object.entries(value).forEach(([code, rate]) => {
    if (typeof rate === 'number') {
      rates[code] = rate;
    }
  });

  return Object.keys(rates).length > 0 ? rates : null;
}

function parseRateCacheEntry(value: unknown): RateCacheEntry | null {
  if (!isRecord(value) || typeof value.fetchedAt !== 'number') return null;

  const rates = parseRates(value.rates);
  return rates ? {rates, fetchedAt: value.fetchedAt} : null;
}

function getEdgeFunctionErrorMessage(error: EdgeFunctionError | null): string | null {
  return typeof error?.message === 'string' ? error.message : null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const ASYNC_KEY = 'fx_rate_cache';

// ─── In-memory cache (per session) ───────────────────────────────────────────

const memCache: Record<string, RateCacheEntry> = {};

// ─── Service ─────────────────────────────────────────────────────────────────

export class CurrencyService {
  /**
   * Get the exchange rate from `from` to `to`.
   * Returns 1 if currencies are equal.
   * Throws if the rate cannot be fetched.
   */
  static async getRate(from: string, to: string): Promise<number> {
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    if (f === t) return 1;

    const rates = await CurrencyService._getRates(f);
    const rate = rates[t];
    if (rate == null || rate === 0) {
      throw new Error(`No exchange rate available for ${from} → ${to}`);
    }
    return rate;
  }

  /**
   * Convert an amount from one currency to another.
   */
  static async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await CurrencyService.getRate(from, to);
    return Math.round(amount * rate * 100) / 100;
  }

  /**
   * Force-refresh the rate cache for a given base currency.
   */
  static async refreshRates(base: string): Promise<void> {
    await CurrencyService._fetchAndCache(base.toUpperCase());
  }

  /**
   * Get all exchange rates for a given base currency.
   */
  static async getRates(base: string): Promise<Record<string, number>> {
    return CurrencyService._getRates(base.toUpperCase());
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private static async _getRates(base: string): Promise<Record<string, number>> {
    // 1. Check in-memory cache
    const mem = memCache[base];
    if (mem && Date.now() - mem.fetchedAt < TTL_MS) {
      return mem.rates;
    }

    // 2. Check AsyncStorage cache
    try {
      const raw = await AsyncStorage.getItem(`${ASYNC_KEY}_${base}`);
      if (raw) {
        const cached = parseRateCacheEntry(parseJson(raw));
        if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
          memCache[base] = cached;
          return cached.rates;
        }
      }
    } catch {
      // AsyncStorage failure is non-fatal
    }

    // 3. Fetch from network (Supabase Edge Function)
    return CurrencyService._fetchAndCache(base);
  }

  private static async _fetchAndCache(base: string): Promise<Record<string, number>> {
    logger.info(`CurrencyService: fetching rates for ${base} via Supabase Edge Function`);

    try {
      const response = await supabase.functions.invoke<FxRatesResponse>(
        `get-fx-rates?base=${base}`,
        {
          method: 'GET',
        },
      );
      const data: FxRatesResponse | null = response.data;
      const error = response.error as EdgeFunctionError | null;

      if (error) {
        throw new Error(
          `Edge Function error: ${getEdgeFunctionErrorMessage(error) ?? 'unknown failure'}`,
        );
      }

      const rates = parseRates(data?.rates);
      if (!rates) {
        throw new Error('Invalid response from FX service');
      }

      const entry: RateCacheEntry = {rates, fetchedAt: Date.now()};

      memCache[base] = entry;

      // Persist to AsyncStorage (non-blocking)
      void AsyncStorage.setItem(`${ASYNC_KEY}_${base}`, JSON.stringify(entry)).catch(() => {});

      return rates;
    } catch (err) {
      logger.error(`FX rate fetch failed for ${base}`, err);
      throw err;
    }
  }
}
