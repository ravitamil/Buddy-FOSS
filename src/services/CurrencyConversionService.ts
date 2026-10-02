import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from './LoggerService';
// Types for currency conversion
export interface ExchangeRate {
  [currency: string]: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Cache key for AsyncStorage
const CACHE_KEY = '@CurrencyRatesCache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const logger = appLogger.serviceLogger('CurrencyConversionService');

interface ExchangeRateApiResponse {
  result: string;
  conversion_rates?: ExchangeRate;
  'error-type'?: string;
}

interface CachedRatesEntry {
  rates: ExchangeRate;
  timestamp: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isExchangeRate = (value: unknown): value is ExchangeRate =>
  isRecord(value) && Object.values(value).every((rate) => typeof rate === 'number');

const isExchangeRateApiResponse = (value: unknown): value is ExchangeRateApiResponse =>
  isRecord(value) &&
  typeof value.result === 'string' &&
  (!('conversion_rates' in value) || isExchangeRate(value.conversion_rates)) &&
  (!('error-type' in value) || typeof value['error-type'] === 'string');

const isCachedRatesEntry = (value: unknown): value is CachedRatesEntry =>
  isRecord(value) && typeof value.timestamp === 'number' && isExchangeRate(value.rates);

const parseJson = (value: string): unknown => JSON.parse(value) as unknown;

export class CurrencyConversionService {
  private apiKey: string;
  private baseUrl: string;

  // Supported currencies with flags
  public supportedCurrencies: CurrencyInfo[] = [
    {code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸'},
    {code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺'},
    {code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧'},
    {code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵'},
    {code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳'},
    {code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳'},
    {code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦'},
    {code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺'},
    {code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭'},
    {code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬'},
    {code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰'},
    {code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷'},
    {code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷'},
    {code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺'},
    {code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽'},
  ];

  constructor() {
    // In a real implementation, you would get this from environment variables
    const configuredApiKey: unknown = process.env.EXPO_PUBLIC_CURRENCY_API_KEY;
    this.apiKey =
      typeof configuredApiKey === 'string' && configuredApiKey.length > 0
        ? configuredApiKey
        : 'YOUR_API_KEY';
    this.baseUrl = 'https://v6.exchangerate-api.com/v6';
  }

  /**
   * Set API key for currency conversion service
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Fetch exchange rates for a base currency
   */
  async fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRate | null> {
    try {
      // Check cache first
      const cachedData = await this.getCachedRates(baseCurrency);
      if (cachedData) {
        return cachedData;
      }

      // Only use real API if API key is configured
      if (this.apiKey && this.apiKey !== 'YOUR_API_KEY') {
        const response = await fetch(`${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch exchange rates: ${response.status} ${response.statusText}`,
          );
        }

        const data: unknown = await response.json();

        if (!isExchangeRateApiResponse(data)) {
          throw new Error('Invalid exchange rate response');
        }

        if (data.result !== 'success') {
          throw new Error(data['error-type'] || 'Failed to fetch exchange rates');
        }

        const rates = data.conversion_rates;
        if (!rates) {
          throw new Error('Exchange rate response missing rates');
        }
        await this.cacheRates(baseCurrency, rates);
        return rates;
      }

      // For now, we'll return mock data but in a real implementation you would use the API call above
      const mockRates = this.generateMockRates(baseCurrency);
      await this.cacheRates(baseCurrency, mockRates);
      return mockRates;
    } catch (error) {
      logger.error('Error fetching exchange rates:', error);
      return this.generateMockRates(baseCurrency);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.fetchExchangeRates(fromCurrency);
      if (rates && rates[toCurrency]) {
        return parseFloat((amount * rates[toCurrency]).toFixed(2));
      }
      return amount; // Return original amount if conversion fails
    } catch (error) {
      logger.error('Error converting currency:', error);
      return amount; // Return original amount if conversion fails
    }
  }

  /**
   * Format currency with proper symbol and conversion
   */
  async formatCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    showSymbol: boolean = true,
  ): Promise<string> {
    try {
      const convertedAmount = await this.convertCurrency(amount, fromCurrency, toCurrency);
      const currencyInfo = this.supportedCurrencies.find((c) => c.code === toCurrency);

      if (!currencyInfo) {
        return `${toCurrency} ${convertedAmount.toFixed(2)}`;
      }

      if (showSymbol) {
        // Handle different formatting for different currencies
        if (toCurrency === 'JPY') {
          return `${currencyInfo.symbol}${convertedAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        } else {
          return `${currencyInfo.symbol}${convertedAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
      } else {
        return `${convertedAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${toCurrency}`;
      }
    } catch (error) {
      logger.error('Error formatting currency:', error);
      return `${toCurrency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Get currency symbol for a currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    const currency = this.supportedCurrencies.find((c) => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }

  /**
   * Get currency flag for a currency code
   */
  getCurrencyFlag(currencyCode: string): string {
    const currency = this.supportedCurrencies.find((c) => c.code === currencyCode);
    return currency ? currency.flag : '💰';
  }

  // Cache management methods
  private async cacheRates(baseCurrency: string, rates: ExchangeRate): Promise<void> {
    try {
      const cacheEntry = {
        rates,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`${CACHE_KEY}_${baseCurrency}`, JSON.stringify(cacheEntry));
    } catch (error) {
      logger.error('Error caching exchange rates:', error);
    }
  }

  private async getCachedRates(baseCurrency: string): Promise<ExchangeRate | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${baseCurrency}`);
      if (cached) {
        const cacheEntry = parseJson(cached);
        if (!isCachedRatesEntry(cacheEntry)) {
          return null;
        }
        if (Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
          return cacheEntry.rates;
        }
      }
      return null;
    } catch (error) {
      logger.error('Error getting cached rates:', error);
      return null;
    }
  }

  // Mock data helper methods
  private generateMockRates(baseCurrency: string): ExchangeRate {
    // Base rates relative to USD
    const baseRates: ExchangeRate = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      INR: 74.5,
      CNY: 6.45,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      SGD: 1.33,
      HKD: 7.78,
      KRW: 1185.0,
      BRL: 5.25,
      RUB: 73.5,
      MXN: 20.2,
    };

    if (baseCurrency === 'USD') {
      return baseRates;
    }

    // Convert rates to be relative to the base currency
    const baseRate = baseRates[baseCurrency];
    if (!baseRate) {
      return baseRates; // Return USD rates if base currency not found
    }

    const convertedRates: ExchangeRate = {};
    for (const [currency, rate] of Object.entries(baseRates)) {
      convertedRates[currency] = rate / baseRate;
    }

    return convertedRates;
  }
}

// Export singleton instance
export const currencyConversionService = new CurrencyConversionService();
