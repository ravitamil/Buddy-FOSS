import {
  getAlphaVantageApiError,
  getAlphaVantageGlobalQuote,
  getAlphaVantageSearchMatches,
  marketIndexSymbols,
  marketSymbolPrefixes,
  symbolMatchesMarket,
} from './financialData/alphaVantage';
import {FinancialDataCache} from './financialData/financialDataCache';
import {
  getMockCompanyName,
  getMockIndicesForMarket,
  getMockMostActive,
  getMockSearchResults,
  getMockTopGainers,
  getMockTopLosers,
  getRandomChange,
  getRandomChangePercent,
  getRandomDividendYield,
  getRandomMarketCap,
  getRandomPeRatio,
  getRandomPrice,
  getRandomVolume,
} from './financialData/financialDataMocks';
import type {MarketData, MarketIndex, StockData} from './financialData/types';

export type {MarketData, MarketIndex, StockData} from './financialData/types';

export class FinancialDataService {
  private apiKey: string;
  private readonly baseUrl: string;
  private readonly cache: FinancialDataCache;

  constructor() {
    const env = process.env as Record<string, string | undefined>;
    this.apiKey = env.EXPO_PUBLIC_FINANCIAL_API_KEY || 'YOUR_API_KEY';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.cache = new FinancialDataCache();
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async fetchStockData(symbol: string, market: string = 'us'): Promise<StockData | null> {
    try {
      const cachedData = await this.cache.get<StockData>(`stock_${symbol}_${market}`);
      if (cachedData) {
        return cachedData;
      }

      if (this.hasConfiguredApiKey()) {
        const stockData = await this.fetchAlphaVantageStock(symbol, market);
        await this.cache.set(`stock_${symbol}_${market}`, stockData);
        return stockData;
      }

      return this.buildMockStock(symbol, market);
    } catch (error) {
      appLogger.error('Error fetching stock data:', error);
      return null;
    }
  }

  async fetchMarketIndices(market: string = 'us'): Promise<MarketIndex[]> {
    try {
      const cachedData = await this.cache.get<MarketIndex[]>(`indices_${market}`);
      if (cachedData) {
        return cachedData;
      }

      if (this.hasConfiguredApiKey()) {
        const indices = await this.fetchAlphaVantageIndices(market);
        await this.cache.set(`indices_${market}`, indices);
        return indices;
      }

      const indices = getMockIndicesForMarket(market);
      await this.cache.set(`indices_${market}`, indices);
      return indices;
    } catch (error) {
      appLogger.error('Error fetching market indices:', error);
      return getMockIndicesForMarket(market);
    }
  }

  async searchStocks(keyword: string, market: string = 'us'): Promise<StockData[]> {
    try {
      if (!this.hasConfiguredApiKey()) {
        return getMockSearchResults(keyword, market);
      }

      try {
        return await this.searchAlphaVantageStocks(keyword, market);
      } catch (apiError) {
        appLogger.warn('Error with Alpha Vantage SYMBOL_SEARCH API:', apiError);
        return getMockSearchResults(keyword, market);
      }
    } catch (error) {
      appLogger.error('Error searching stocks:', error);
      return getMockSearchResults(keyword, market);
    }
  }

  async getMarketMovers(market: string = 'us'): Promise<MarketData> {
    try {
      const cachedData = await this.cache.get<MarketData>(`movers_${market}`);
      if (cachedData) {
        return cachedData;
      }

      const marketData: MarketData = {
        indices: await this.fetchMarketIndices(market),
        topGainers: getMockTopGainers(market),
        topLosers: getMockTopLosers(market),
        mostActive: getMockMostActive(market),
      };

      await this.cache.set(`movers_${market}`, marketData);
      return marketData;
    } catch (error) {
      appLogger.error('Error fetching market movers:', error);
      return {
        indices: getMockIndicesForMarket(market),
        topGainers: getMockTopGainers(market),
        topLosers: getMockTopLosers(market),
        mostActive: getMockMostActive(market),
      };
    }
  }

  private hasConfiguredApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'YOUR_API_KEY');
  }

  private async fetchAlphaVantageStock(symbol: string, market: string): Promise<StockData> {
    const prefix = marketSymbolPrefixes[market] || '';
    const fullSymbol = `${prefix}${symbol}`;
    const data = await this.fetchAlphaVantage({
      function: 'GLOBAL_QUOTE',
      symbol: fullSymbol,
    });
    const quote = getAlphaVantageGlobalQuote(data);

    if (!quote) {
      throw new Error('No data available for this symbol');
    }

    return {
      symbol: quote['01. symbol'],
      name: getMockCompanyName(quote['01. symbol']),
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'], 10),
      market,
      marketCap: getRandomMarketCap(),
      peRatio: getRandomPeRatio(10, 40),
    };
  }

  private async fetchAlphaVantageIndices(market: string): Promise<MarketIndex[]> {
    const indexSymbols = marketIndexSymbols[market] || marketIndexSymbols.us;
    const indices: MarketIndex[] = [];

    for (const index of indexSymbols) {
      try {
        const data = await this.fetchAlphaVantage({
          function: 'GLOBAL_QUOTE',
          symbol: index.symbol,
        });
        const quote = getAlphaVantageGlobalQuote(data);

        if (!quote) {
          appLogger.warn(`No data available for index ${index.symbol}`);
          continue;
        }

        indices.push({
          symbol: quote['01. symbol'],
          name: index.name,
          value: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          market,
        });
      } catch (indexError) {
        appLogger.warn(`Error processing index ${index.symbol}:`, indexError);
      }
    }

    return indices;
  }

  private async searchAlphaVantageStocks(keyword: string, market: string): Promise<StockData[]> {
    const data = await this.fetchAlphaVantage({
      function: 'SYMBOL_SEARCH',
      keywords: keyword,
    });
    const matches = getAlphaVantageSearchMatches(data);

    if (!matches) {
      return getMockSearchResults(keyword, market);
    }

    const stocks = matches
      .filter((match) => symbolMatchesMarket(match['1. symbol'], market))
      .map(
        (match): StockData => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          price: parseFloat(match['3. price'] || '0'),
          change: getRandomChange(-5, 5),
          changePercent: getRandomChangePercent(-3, 3),
          marketCap: getRandomMarketCap(),
          peRatio: getRandomPeRatio(10, 40),
          volume: getRandomVolume(),
          dividendYield: getRandomDividendYield(0, 5),
          market,
        }),
      );

    return stocks.length > 0 ? stocks : getMockSearchResults(keyword, market);
  }

  private async fetchAlphaVantage(params: Record<string, string>): Promise<unknown> {
    const url = new URL(this.baseUrl);
    Object.entries({...params, apikey: this.apiKey}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const data: unknown = await response.json();
    const apiError = getAlphaVantageApiError(data);

    if (apiError) {
      throw new Error(apiError);
    }

    return data;
  }

  private buildMockStock(symbol: string, market: string): StockData {
    return {
      symbol,
      name: getMockCompanyName(symbol),
      price: getRandomPrice(100, 500),
      change: getRandomChange(-5, 5),
      changePercent: getRandomChangePercent(-3, 3),
      marketCap: getRandomMarketCap(),
      peRatio: getRandomPeRatio(10, 40),
      volume: getRandomVolume(),
      dividendYield: getRandomDividendYield(0, 5),
      market,
    };
  }
}

export const financialDataService = new FinancialDataService();
