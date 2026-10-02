import type {MarketNews, MarketNewsCacheEntry, NewsApiArticle} from './marketNewsTypes';

export const MARKET_NEWS_CATEGORIES = [
  'Market Updates',
  'Economic Indicators',
  'Company News',
  'Policy Changes',
  'Global Events',
  'Sector Analysis',
  'Investment Strategies',
];

export const MARKET_NEWS_CACHE_KEY = '@MarketNewsCache';
export const MARKET_NEWS_CACHE_DURATION = 30 * 60 * 1000;

const countryCodes: Record<string, string> = {
  us: 'us',
  uk: 'gb',
  eu: 'eu',
  in: 'in',
  jp: 'jp',
  cn: 'cn',
  ca: 'ca',
  au: 'au',
  br: 'br',
  ru: 'ru',
  za: 'za',
  mx: 'mx',
  kr: 'kr',
  sg: 'sg',
  hk: 'hk',
};

export function getMarketCountryCode(market: string): string {
  return countryCodes[market] || 'us';
}

export function buildMarketNewsCacheKey(market: string, category?: string): string {
  return `${market}_${category || 'all'}`;
}

export function buildHeadlinesCacheKey(market: string): string {
  return `headlines_${market}`;
}

export function createMarketNewsUrl(params: {
  baseUrl: string;
  apiKey: string;
  market: string;
  category?: string;
}): string {
  if (params.category) {
    return `${params.baseUrl}/everything?q=${params.category}&language=en&sortBy=publishedAt&apiKey=${params.apiKey}`;
  }

  const countryCode = getMarketCountryCode(params.market);
  return `${params.baseUrl}/top-headlines?country=${countryCode}&category=business&apiKey=${params.apiKey}`;
}

export function createHeadlinesUrl(params: {
  baseUrl: string;
  apiKey: string;
  market: string;
}): string {
  const countryCode = getMarketCountryCode(params.market);
  return `${params.baseUrl}/top-headlines?country=${countryCode}&category=business&apiKey=${params.apiKey}`;
}

export function createSearchUrl(params: {
  baseUrl: string;
  apiKey: string;
  keyword: string;
}): string {
  return `${params.baseUrl}/everything?q=${params.keyword}&language=en&sortBy=relevancy&apiKey=${params.apiKey}`;
}

export function hasConfiguredNewsApiKey(apiKey: string): boolean {
  return Boolean(apiKey && apiKey !== 'YOUR_API_KEY');
}

export function formatMarketNewsTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  }

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  return `${Math.floor(diffInHours / 24)} days ago`;
}

export function mapNewsApiArticles(params: {
  articles: NewsApiArticle[] | undefined;
  market: string;
  category: string;
  idPrefix: string;
}): MarketNews[] {
  return (params.articles ?? []).map((article, index) => ({
    id: `${params.idPrefix}${index}`,
    title: article.title ?? 'Untitled market update',
    source: article.source?.name ?? 'Unknown source',
    time: formatMarketNewsTime(article.publishedAt ?? new Date().toISOString()),
    excerpt: article.description ?? '',
    url: article.url ?? '',
    market: params.market,
    category: params.category,
  }));
}

export function createMarketNewsCacheEntry(news: MarketNews[]): MarketNewsCacheEntry {
  return {
    news,
    timestamp: Date.now(),
  };
}

export function isFreshCacheEntry(value: unknown): value is MarketNewsCacheEntry {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<MarketNewsCacheEntry>;
  return (
    Array.isArray(candidate.news) &&
    typeof candidate.timestamp === 'number' &&
    Date.now() - candidate.timestamp < MARKET_NEWS_CACHE_DURATION
  );
}
