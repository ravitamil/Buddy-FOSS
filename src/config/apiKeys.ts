// API Keys Configuration
// In a production environment, these should be set as environment variables

const expoPublicEnv = process.env as Record<string, string | undefined>;

const getApiKey = (envKey: string, placeholder: string): string => {
  const value = expoPublicEnv[envKey];
  return value && value !== placeholder ? value : placeholder;
};

const hasConfiguredApiKey = (envKey: string, placeholder: string): boolean => {
  const value = expoPublicEnv[envKey];
  return !!value && value !== placeholder;
};

export const API_KEYS = {
  // Financial Data API (Alpha Vantage)
  FINANCIAL_API_KEY: getApiKey('EXPO_PUBLIC_FINANCIAL_API_KEY', 'YOUR_FINANCIAL_API_KEY'),

  // Currency Conversion API (ExchangeRate-API)
  CURRENCY_API_KEY: getApiKey('EXPO_PUBLIC_CURRENCY_API_KEY', 'YOUR_CURRENCY_API_KEY'),

  // Market News API (NewsAPI)
  NEWS_API_KEY: getApiKey('EXPO_PUBLIC_NEWS_API_KEY', 'YOUR_NEWS_API_KEY'),

  // Check if API keys are properly configured
  isFinancialApiKeyConfigured: (): boolean => {
    return hasConfiguredApiKey('EXPO_PUBLIC_FINANCIAL_API_KEY', 'YOUR_FINANCIAL_API_KEY');
  },

  isCurrencyApiKeyConfigured: (): boolean => {
    return hasConfiguredApiKey('EXPO_PUBLIC_CURRENCY_API_KEY', 'YOUR_CURRENCY_API_KEY');
  },

  isNewsApiKeyConfigured: (): boolean => {
    return hasConfiguredApiKey('EXPO_PUBLIC_NEWS_API_KEY', 'YOUR_NEWS_API_KEY');
  },
};

export default API_KEYS;
