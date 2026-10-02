export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  excerpt: string;
  url: string;
  market: string;
  category: string;
}

export interface NewsApiArticle {
  title?: string;
  source?: {
    name?: string;
  };
  publishedAt?: string;
  description?: string | null;
  url?: string;
}

export interface NewsApiResponse {
  status?: string;
  message?: string;
  articles?: NewsApiArticle[];
}

export interface MarketNewsCacheEntry {
  news: MarketNews[];
  timestamp: number;
}
