import type {MarketIndex, StockData} from './types';

export const getMockCompanyName = (symbol: string): string => {
  const companyNames: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    TSLA: 'Tesla Inc.',
    RELIANCE: 'Reliance Industries Ltd',
    TCS: 'Tata Consultancy Services Ltd',
    INFY: 'Infosys Ltd',
    SAP: 'SAP SE',
    '7203.T': 'Toyota Motor Corp',
    'NESN.SW': 'Nestle SA',
    'HSBA.L': 'HSBC Holdings PLC',
    BABA: 'Alibaba Group Holding Ltd',
    TCEHY: 'Tencent Holdings Ltd',
    '005930.KS': 'Samsung Electronics Co. Ltd',
    'VOD.L': 'Vodafone Group PLC',
    'SAN.MC': 'Banco Santander SA',
    'VOW3.DE': 'Volkswagen AG',
    'UNA.AS': 'Unilever PLC',
    'RIO.AX': 'Rio Tinto Ltd',
  };
  return companyNames[symbol] || `${symbol} Corporation`;
};

export const getRandomPrice = (min: number, max: number): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const getRandomChange = (min: number, max: number): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const getRandomChangePercent = (min: number, max: number): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const getRandomMarketCap = (): number =>
  Math.floor(Math.random() * 1000000000000) + 10000000000;

export const getRandomPeRatio = (min: number, max: number): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const getRandomVolume = (): number => Math.floor(Math.random() * 100000000) + 1000000;

export const getRandomDividendYield = (min: number, max: number): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const getMockIndicesForMarket = (market: string): MarketIndex[] => {
  const marketIndices: Record<string, MarketIndex[]> = {
    us: [
      buildIndex('SPX', 'S&P 500', 'us', 4000, 5000, -50, 50, -2, 2),
      buildIndex('DJI', 'Dow Jones', 'us', 30000, 40000, -300, 300, -1, 1),
      buildIndex('IXIC', 'NASDAQ', 'us', 12000, 16000, -100, 100, -1.5, 1.5),
    ],
    in: [
      buildIndex('NSEI', 'Nifty 50', 'in', 18000, 22000, -100, 100, -0.5, 0.5),
      buildIndex('BSESN', 'Sensex', 'in', 60000, 75000, -300, 300, -0.5, 0.5),
    ],
    jp: [buildIndex('N225', 'Nikkei 225', 'jp', 30000, 35000, -200, 200, -1, 1)],
    eu: [
      buildIndex('GDAXI', 'DAX', 'eu', 15000, 18000, -100, 100, -0.6, 0.6),
      buildIndex('FTSE', 'FTSE 100', 'eu', 7000, 8000, -50, 50, -0.7, 0.7),
    ],
    uk: [buildIndex('FTSE', 'FTSE 100', 'uk', 7000, 8000, -50, 50, -0.7, 0.7)],
    cn: [buildIndex('000001.SS', 'Shanghai Composite', 'cn', 3000, 3500, -50, 50, -1.5, 1.5)],
    ca: [buildIndex('GSPTSE', 'S&P/TSX', 'ca', 20000, 25000, -100, 100, -0.8, 0.8)],
    au: [buildIndex('AXJO', 'ASX 200', 'au', 7000, 8000, -50, 50, -0.7, 0.7)],
    br: [buildIndex('IBOVESPA', 'Bovespa', 'br', 100000, 150000, -1000, 1000, -1, 1)],
  };
  return marketIndices[market] || marketIndices.us;
};

export const getMockSearchResults = (keyword: string, market: string): StockData[] => {
  const allStocks = [
    {symbol: 'AAPL', name: 'Apple Inc.', market: 'us'},
    {symbol: 'MSFT', name: 'Microsoft Corporation', market: 'us'},
    {symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'us'},
    {symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'us'},
    {symbol: 'RELIANCE', name: 'Reliance Industries Ltd', market: 'in'},
    {symbol: 'TCS', name: 'Tata Consultancy Services Ltd', market: 'in'},
    {symbol: 'INFY', name: 'Infosys Ltd', market: 'in'},
    {symbol: 'SAP', name: 'SAP SE', market: 'eu'},
    {symbol: '7203.T', name: 'Toyota Motor Corp', market: 'jp'},
  ];

  return allStocks
    .filter(
      (stock) =>
        stock.market === market &&
        (stock.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
          stock.name.toLowerCase().includes(keyword.toLowerCase())),
    )
    .map((stock) => buildStock(stock.symbol, stock.name, stock.market, 50, 500, -10, 10, -3, 3));
};

export const getMockTopGainers = (market: string): StockData[] => [
  buildStock(
    `${market}_GAIN1`,
    `Top Gainer 1 ${market.toUpperCase()}`,
    market,
    100,
    300,
    5,
    15,
    2,
    8,
  ),
  buildStock(
    `${market}_GAIN2`,
    `Top Gainer 2 ${market.toUpperCase()}`,
    market,
    50,
    200,
    3,
    12,
    1.5,
    6,
  ),
];

export const getMockTopLosers = (market: string): StockData[] => [
  buildStock(
    `${market}_LOSE1`,
    `Top Loser 1 ${market.toUpperCase()}`,
    market,
    100,
    300,
    -15,
    -5,
    -8,
    -2,
  ),
  buildStock(
    `${market}_LOSE2`,
    `Top Loser 2 ${market.toUpperCase()}`,
    market,
    50,
    200,
    -12,
    -3,
    -6,
    -1.5,
  ),
];

export const getMockMostActive = (market: string): StockData[] => [
  {
    ...buildStock(
      `${market}_ACT1`,
      `Most Active 1 ${market.toUpperCase()}`,
      market,
      75,
      250,
      -5,
      5,
      -2,
      2,
    ),
    volume: getRandomVolume() * 2,
  },
  {
    ...buildStock(
      `${market}_ACT2`,
      `Most Active 2 ${market.toUpperCase()}`,
      market,
      60,
      180,
      -3,
      3,
      -1.5,
      1.5,
    ),
    volume: getRandomVolume() * 1.5,
  },
];

const buildIndex = (
  symbol: string,
  name: string,
  market: string,
  priceMin: number,
  priceMax: number,
  changeMin: number,
  changeMax: number,
  changePercentMin: number,
  changePercentMax: number,
): MarketIndex => ({
  symbol,
  name,
  value: getRandomPrice(priceMin, priceMax),
  change: getRandomChange(changeMin, changeMax),
  changePercent: getRandomChangePercent(changePercentMin, changePercentMax),
  market,
});

const buildStock = (
  symbol: string,
  name: string,
  market: string,
  priceMin: number,
  priceMax: number,
  changeMin: number,
  changeMax: number,
  changePercentMin: number,
  changePercentMax: number,
): StockData => ({
  symbol,
  name,
  price: getRandomPrice(priceMin, priceMax),
  change: getRandomChange(changeMin, changeMax),
  changePercent: getRandomChangePercent(changePercentMin, changePercentMax),
  marketCap: getRandomMarketCap(),
  peRatio: getRandomPeRatio(10, 40),
  volume: getRandomVolume(),
  dividendYield: getRandomDividendYield(0, 5),
  market,
});
