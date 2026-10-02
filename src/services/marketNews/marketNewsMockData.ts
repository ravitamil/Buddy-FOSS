import {MARKET_NEWS_CATEGORIES} from './marketNewsHelpers';
import type {MarketNews} from './marketNewsTypes';

const newsSources = [
  'Financial Times',
  'Wall Street Journal',
  'Bloomberg',
  'Reuters',
  'CNBC',
  'MarketWatch',
  'Investing.com',
  'Yahoo Finance',
];

const genericExcerpts = [
  'Markets showed strong performance today as economic indicators exceeded expectations...',
  'The central bank announced policy changes that could affect investment returns...',
  'Technology stocks led market gains as investors showed renewed confidence...',
  'Increased market volatility has investors watching closely for further developments...',
  'Global events continue to impact financial markets across different regions...',
  'New regulatory changes are expected to reshape the investment landscape...',
  'Companies in the region reported earnings that beat analyst expectations...',
  'Economic indicators suggest a positive outlook for the market...',
];

export function generateMockMarketNews(market: string, category?: string): MarketNews[] {
  const categories = category ? [category] : MARKET_NEWS_CATEGORIES;
  const headlines = [
    `${market.toUpperCase()} Markets Rally on Strong Economic Data`,
    `Central Bank Policy Update Affects ${market.toUpperCase()} Investments`,
    `Tech Sector Leads ${market.toUpperCase()} Market Gains`,
    `${market.toUpperCase()} Stocks See Increased Volatility`,
    `Global Events Impact ${market.toUpperCase()} Financial Markets`,
    `New Regulations Affect ${market.toUpperCase()} Investment Landscape`,
    `${market.toUpperCase()} Companies Report Better Than Expected Earnings`,
    `Economic Indicators Point to ${market.toUpperCase()} Market Recovery`,
  ];

  return Array.from({length: 8}, (_, index) => ({
    id: `${market}_news_${index}`,
    title: headlines[index % headlines.length],
    source: newsSources[index % newsSources.length],
    time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
    excerpt: genericExcerpts[index % genericExcerpts.length],
    url: `https://example.com/news/${market}/${index}`,
    market,
    category: categories[index % categories.length],
  }));
}

export function generateMockMarketHeadlines(market: string): MarketNews[] {
  const headlines = [
    `Breaking: ${market.toUpperCase()} Central Bank Announces Policy Decision`,
    `Exclusive: Major ${market.toUpperCase()} Corporation Reports Record Earnings`,
    `${market.toUpperCase()} Markets Open Higher on Positive Economic Data`,
    `Analysis: ${market.toUpperCase()} Investment Trends for the Coming Quarter`,
    `Update: ${market.toUpperCase()} Regulatory Changes Impact Financial Sector`,
    `${market.toUpperCase()} Stocks React to Global Economic Developments`,
    `Insight: ${market.toUpperCase()} Market Outlook According to Leading Analysts`,
    `Report: ${market.toUpperCase()} Economic Growth Exceeds Projections`,
  ];

  return Array.from({length: 6}, (_, index) => ({
    id: `headline_${market}_${index}`,
    title: headlines[index],
    source: newsSources[index],
    time: `${Math.floor(Math.random() * 6) + 1} hours ago`,
    excerpt: `Detailed analysis and market reaction to today's developments in ${market.toUpperCase()} financial markets...`,
    url: `https://example.com/headlines/${market}/${index}`,
    market,
    category: 'Top Headlines',
  }));
}

export function generateMockSearchResults(keyword: string, market: string): MarketNews[] {
  const titles = [
    `Analysis: ${keyword} Impact on ${market.toUpperCase()} Markets`,
    `${keyword} Trends in ${market.toUpperCase()} Financial Sector`,
    `How ${keyword} Affects ${market.toUpperCase()} Investment Strategies`,
    `${market.toUpperCase()} Investors Watch ${keyword} Closely`,
    `Expert Opinion: ${keyword} and ${market.toUpperCase()} Market Outlook`,
    `${keyword} Developments Reshape ${market.toUpperCase()} Financial Landscape`,
  ];

  return Array.from({length: 4}, (_, index) => ({
    id: `search_${market}_${keyword}_${index}`,
    title: titles[index % titles.length],
    source: newsSources[index % newsSources.length],
    time: `${Math.floor(Math.random() * 48) + 1} hours ago`,
    excerpt: `Comprehensive coverage of how ${keyword} developments are influencing ${market.toUpperCase()} financial markets and investment opportunities...`,
    url: `https://example.com/search/${market}/${keyword}/${index}`,
    market,
    category: 'Search Results',
  }));
}
