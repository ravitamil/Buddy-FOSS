import {financialDataService} from '../services/FinancialDataService';
import {currencyConversionService} from '../services/CurrencyConversionService';
import {marketNewsService} from '../services/MarketNewsService';
import API_KEYS from '../config/apiKeys';

export const testApiKeys = async () => {
  appLogger.debug('🧪 Testing API Key Configuration...');

  // Test Financial Data Service
  if (API_KEYS.isFinancialApiKeyConfigured()) {
    try {
      appLogger.debug('📈 Testing Financial Data Service...');
      const testData = await financialDataService.fetchMarketIndices('us');
      appLogger.debug('✅ Financial Data Service: Working');
      appLogger.debug('📊 Sample Data:', testData.slice(0, 2)); // Show first 2 items
    } catch (error) {
      appLogger.debug('❌ Financial Data Service: Error', error);
    }
  } else {
    appLogger.debug('⚠️ Financial Data Service: Not configured');
  }

  // Test Currency Conversion Service
  if (API_KEYS.isCurrencyApiKeyConfigured()) {
    try {
      appLogger.debug('💱 Testing Currency Conversion Service...');
      const testRates = await currencyConversionService.fetchExchangeRates('USD');
      appLogger.debug('✅ Currency Conversion Service: Working');
      appLogger.debug('💵 Sample Rates:', Object.keys(testRates || {}).slice(0, 5)); // Show first 5 currencies
    } catch (error) {
      appLogger.debug('❌ Currency Conversion Service: Error', error);
    }
  } else {
    appLogger.debug('⚠️ Currency Conversion Service: Not configured');
  }

  // Test Market News Service
  if (API_KEYS.isNewsApiKeyConfigured()) {
    try {
      appLogger.debug('📰 Testing Market News Service...');
      const testNews = await marketNewsService.fetchMarketNews('us');
      appLogger.debug('✅ Market News Service: Working');
      appLogger.debug('📄 Sample News:', testNews.slice(0, 2)); // Show first 2 items
    } catch (error) {
      appLogger.debug('❌ Market News Service: Error', error);
    }
  } else {
    appLogger.debug('⚠️ Market News Service: Not configured');
  }

  appLogger.debug('🏁 API Key Testing Complete');
};
