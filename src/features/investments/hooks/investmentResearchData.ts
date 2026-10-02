import type {
  GlobalMarket,
  MarketIndex,
  MarketNews,
  ResearchSortBy,
  StockData,
} from './investmentResearchTypes';

export const researchSortOptions: ResearchSortBy[] = [
  'symbol',
  'name',
  'price',
  'change',
  'volume',
  'marketCap',
];

export const globalMarkets: GlobalMarket[] = [
  {
    id: 'us',
    name: 'United States',
    flag: 'US',
    currency: 'USD',
    indices: [
      {name: 'S&P 500', symbol: 'SPX'},
      {name: 'Dow Jones', symbol: 'DJI'},
      {name: 'NASDAQ', symbol: 'IXIC'},
    ],
  },
  {
    id: 'eu',
    name: 'Europe',
    flag: 'EU',
    currency: 'EUR',
    indices: [
      {name: 'Euro Stoxx 50', symbol: 'SX5E'},
      {name: 'FTSE 100', symbol: 'UKX'},
      {name: 'DAX', symbol: 'GDAXI'},
      {name: 'CAC 40', symbol: 'FCHI'},
    ],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: 'UK',
    currency: 'GBP',
    indices: [{name: 'FTSE 100', symbol: 'UKX'}],
  },
  {
    id: 'in',
    name: 'India',
    flag: 'IN',
    currency: 'INR',
    indices: [
      {name: 'Nifty 50', symbol: 'NIFTY'},
      {name: 'Sensex', symbol: 'SENSEX'},
      {name: 'Bank Nifty', symbol: 'BANKNIFTY'},
      {name: 'Nifty 500', symbol: 'NIFTY500'},
    ],
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: 'JP',
    currency: 'JPY',
    indices: [
      {name: 'Nikkei 225', symbol: 'N225'},
      {name: 'Topix', symbol: 'TPX'},
    ],
  },
  {
    id: 'cn',
    name: 'China',
    flag: 'CN',
    currency: 'CNY',
    indices: [
      {name: 'Shanghai Composite', symbol: '000001.SS'},
      {name: 'Shenzhen Component', symbol: '399001.SZ'},
      {name: 'Hang Seng', symbol: 'HSI'},
    ],
  },
  {
    id: 'ca',
    name: 'Canada',
    flag: 'CA',
    currency: 'CAD',
    indices: [{name: 'TSX Composite', symbol: 'TSX'}],
  },
  {
    id: 'au',
    name: 'Australia',
    flag: 'AU',
    currency: 'AUD',
    indices: [{name: 'ASX 200', symbol: 'AS51'}],
  },
  {
    id: 'br',
    name: 'Brazil',
    flag: 'BR',
    currency: 'BRL',
    indices: [{name: 'Bovespa', symbol: 'BVSP'}],
  },
  {
    id: 'ru',
    name: 'Russia',
    flag: 'RU',
    currency: 'RUB',
    indices: [{name: 'MOEX', symbol: 'IMOEX'}],
  },
  {
    id: 'za',
    name: 'South Africa',
    flag: 'ZA',
    currency: 'ZAR',
    indices: [{name: 'FTSE/JSE Top 40', symbol: 'JTOPI'}],
  },
  {
    id: 'mx',
    name: 'Mexico',
    flag: 'MX',
    currency: 'MXN',
    indices: [{name: 'IPC Mexico', symbol: 'MXX'}],
  },
  {
    id: 'kr',
    name: 'South Korea',
    flag: 'KR',
    currency: 'KRW',
    indices: [{name: 'KOSPI', symbol: 'KS11'}],
  },
  {
    id: 'sg',
    name: 'Singapore',
    flag: 'SG',
    currency: 'SGD',
    indices: [{name: 'STI', symbol: 'STI'}],
  },
  {
    id: 'hk',
    name: 'Hong Kong',
    flag: 'HK',
    currency: 'HKD',
    indices: [{name: 'Hang Seng', symbol: 'HSI'}],
  },
];

export const createFallbackStocks = (marketId: string): StockData[] => [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stocks',
    market: marketId,
    currentPrice: 175.25,
    change: 2.35,
    changePercent: 1.36,
    marketCap: 2800000000000,
    peRatio: 28.5,
    dividendYield: 0.55,
    volume: 45000000,
    description:
      'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    founded: 1976,
    employees: 164000,
    headquarters: 'Cupertino, California',
    website: 'https://www.apple.com',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stocks',
    market: marketId,
    currentPrice: 330.15,
    change: -1.25,
    changePercent: -0.38,
    marketCap: 2500000000000,
    peRatio: 35.2,
    dividendYield: 0.75,
    volume: 22000000,
    description:
      'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    sector: 'Technology',
    industry: 'SoftwareInfrastructure',
    founded: 1975,
    employees: 221000,
    headquarters: 'Redmond, Washington',
    website: 'https://www.microsoft.com',
  },
];

export const createFallbackIndices = (marketId: string): MarketIndex[] => [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    market: marketId,
    value: 4567.25,
    change: 23.45,
    changePercent: 0.52,
  },
];

export const createFallbackNews = (marketId: string): MarketNews[] => [
  {
    id: '1',
    title: 'Market Update',
    source: 'Financial Times',
    time: '2 hours ago',
    excerpt: 'Markets showed strong performance today...',
    url: '#',
    market: marketId,
    category: 'Market Updates',
  },
];

export const getUniqueStockValues = (stocks: StockData[], key: 'sector' | 'industry'): string[] => [
  ...new Set(stocks.map((investment) => investment[key]).filter(Boolean)),
];
