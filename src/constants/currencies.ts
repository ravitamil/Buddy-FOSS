import getSymbolFromCurrency from 'currency-symbol-map';

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const currencyDisplayNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], {type: 'currency'})
    : undefined;

// Product-supported ISO currency codes. Symbols come from currency-symbol-map;
// display names come from Intl.DisplayNames when available.
export const SUPPORTED_CURRENCY_CODES = [
  'AED',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'BBD',
  'BDT',
  'BHD',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BWP',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CZK',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GHS',
  'GIP',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KMF',
  'KRW',
  'KWD',
  'KYD',
  'LSL',
  'LYD',
  'MAD',
  'MGA',
  'MUR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SOS',
  'SRD',
  'SZL',
  'THB',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TZS',
  'UGX',
  'USD',
  'UYU',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XOF',
  'ZAR',
  'ZMW',
] as const;

export const FX_SUPPORTED_CURRENCIES = [
  'AUD',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCY_CODES)[number];

export const getCurrencySymbol = (currencyCode: string): string => {
  const normalizedCode = currencyCode.toUpperCase();
  return getSymbolFromCurrency(normalizedCode) || normalizedCode;
};

export const getCurrencyName = (currencyCode: string): string => {
  const normalizedCode = currencyCode.toUpperCase();
  return currencyDisplayNames?.of(normalizedCode) ?? `${normalizedCode} Currency`;
};

export const createCurrencyOption = (currencyCode: string): CurrencyOption => {
  const code = currencyCode.toUpperCase();
  return {
    code,
    name: getCurrencyName(code),
    symbol: getCurrencySymbol(code),
  };
};

export const generateCurrencyList = (): CurrencyOption[] =>
  SUPPORTED_CURRENCY_CODES.map(createCurrencyOption).sort((a, b) => a.name.localeCompare(b.name));

export const isSupportedCurrency = (currencyCode: string): boolean =>
  SUPPORTED_CURRENCY_CODES.includes(currencyCode.toUpperCase() as SupportedCurrencyCode);

export const isFxSupportedCurrency = (currencyCode: string): boolean =>
  FX_SUPPORTED_CURRENCIES.includes(
    currencyCode.toUpperCase() as (typeof FX_SUPPORTED_CURRENCIES)[number],
  );

// Language options
export const LANGUAGES = [
  {code: 'en', name: 'English', flag: 'US'},
  {code: 'es', name: 'Spanish', flag: 'ES'},
  {code: 'fr', name: 'French', flag: 'FR'},
  {code: 'de', name: 'German', flag: 'DE'},
  {code: 'it', name: 'Italian', flag: 'IT'},
  {code: 'pt', name: 'Portuguese', flag: 'PT'},
  {code: 'ru', name: 'Russian', flag: 'RU'},
  {code: 'ja', name: 'Japanese', flag: 'JP'},
  {code: 'ko', name: 'Korean', flag: 'KR'},
  {code: 'zh', name: 'Chinese', flag: 'CN'},
];
