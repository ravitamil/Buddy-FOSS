import AsyncStorage from '@react-native-async-storage/async-storage';

import {logger as appLogger} from './LoggerService';
import {
  buildHeadlinesCacheKey,
  buildMarketNewsCacheKey,
  createHeadlinesUrl,
  createMarketNewsCacheEntry,
  createMarketNewsUrl,
  createSearchUrl,
  hasConfiguredNewsApiKey,
  isFreshCacheEntry,
  mapNewsApiArticles,
  MARKET_NEWS_CACHE_KEY,
  MARKET_NEWS_CATEGORIES,
} from './marketNews/marketNewsHelpers';
import {
  generateMockMarketHeadlines,
  generateMockMarketNews,
  generateMockSearchResults,
} from './marketNews/marketNewsMockData';
import type {MarketNews, NewsApiResponse} from './marketNews/marketNewsTypes';

export type {MarketNews};

const logger = appLogger.contextLogger('MarketNewsService');

export class MarketNewsService {
  private apiKey: string;
  private baseUrl: string;
  public newsCategories = MARKET_NEWS_CATEGORIES;

  constructor() {
    const envApiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;
    this.apiKey =
      typeof envApiKey === 'string' && envApiKey.length > 0 ? envApiKey : 'YOUR_API_KEY';
    this.baseUrl = 'https://newsapi.org/v2';
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async fetchMarketNews(market: string = 'us', category?: string): Promise<MarketNews[]> {
    try {
      const cacheKey = buildMarketNewsCacheKey(market, category);
      const cachedData = await this.getCachedNews(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      if (hasConfiguredNewsApiKey(this.apiKey)) {
        const data = await this.fetchNewsApi(
          createMarketNewsUrl({
            baseUrl: this.baseUrl,
            apiKey: this.apiKey,
            market,
            category,
          }),
          'Failed to fetch market news',
        );
        const news = mapNewsApiArticles({
          articles: data.articles,
          market,
          category: category ?? 'General',
          idPrefix: `${market}_`,
        });

        await this.cacheNews(cacheKey, news);
        return news;
      }

      const news = generateMockMarketNews(market, category);
      await this.cacheNews(cacheKey, news);
      return news;
    } catch (error) {
      logger.error('Error fetching market news:', error);
      return generateMockMarketNews(market, category);
    }
  }

  async fetchTopHeadlines(market: string = 'us'): Promise<MarketNews[]> {
    try {
      const cacheKey = buildHeadlinesCacheKey(market);
      const cachedData = await this.getCachedNews(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      if (hasConfiguredNewsApiKey(this.apiKey)) {
        const data = await this.fetchNewsApi(
          createHeadlinesUrl({baseUrl: this.baseUrl, apiKey: this.apiKey, market}),
          'Failed to fetch top headlines',
        );
        const news = mapNewsApiArticles({
          articles: data.articles,
          market,
          category: 'Top Headlines',
          idPrefix: `headline_${market}_`,
        });

        await this.cacheNews(cacheKey, news);
        return news;
      }

      const news = generateMockMarketHeadlines(market);
      await this.cacheNews(cacheKey, news);
      return news;
    } catch (error) {
      logger.error('Error fetching top headlines:', error);
      return generateMockMarketHeadlines(market);
    }
  }

  async searchNews(keyword: string, market: string = 'us'): Promise<MarketNews[]> {
    try {
      if (hasConfiguredNewsApiKey(this.apiKey)) {
        const data = await this.fetchNewsApi(
          createSearchUrl({baseUrl: this.baseUrl, apiKey: this.apiKey, keyword}),
          'Failed to search news',
        );

        return mapNewsApiArticles({
          articles: data.articles,
          market,
          category: 'Search Results',
          idPrefix: `search_${market}_`,
        });
      }

      return generateMockSearchResults(keyword, market);
    } catch (error) {
      logger.error('Error searching news:', error);
      return [];
    }
  }

  private async fetchNewsApi(url: string, errorPrefix: string): Promise<NewsApiResponse> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${errorPrefix}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NewsApiResponse;
    if (data.status !== 'ok') {
      throw new Error(data.message ?? errorPrefix);
    }

    return data;
  }

  private async cacheNews(key: string, news: MarketNews[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${MARKET_NEWS_CACHE_KEY}_${key}`,
        JSON.stringify(createMarketNewsCacheEntry(news)),
      );
    } catch (error) {
      logger.error('Error caching news:', error);
    }
  }

  private async getCachedNews(key: string): Promise<MarketNews[] | null> {
    try {
      const cached = await AsyncStorage.getItem(`${MARKET_NEWS_CACHE_KEY}_${key}`);
      if (!cached) {
        return null;
      }

      const cacheEntry = JSON.parse(cached) as unknown;
      return isFreshCacheEntry(cacheEntry) ? cacheEntry.news : null;
    } catch (error) {
      logger.error('Error getting cached news:', error);
      return null;
    }
  }
}

export const marketNewsService = new MarketNewsService();
