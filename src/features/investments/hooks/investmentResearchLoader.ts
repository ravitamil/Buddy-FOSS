import {financialDataService} from '@/services/FinancialDataService';
import {marketNewsService} from '@/services/MarketNewsService';
import type {MarketIndex, MarketNews, StockData} from './investmentResearchTypes';
import {
  createFallbackIndices,
  createFallbackNews,
  createFallbackStocks,
  getUniqueStockValues,
} from './investmentResearchData';

export interface InvestmentResearchDataResult {
  marketIndices: MarketIndex[];
  news: MarketNews[];
  investments: StockData[];
  availableSectors: string[];
  availableIndustries: string[];
}

export const fetchInvestmentResearchData = async ({
  marketId,
  searchQuery,
}: {
  marketId: string;
  searchQuery: string;
}): Promise<InvestmentResearchDataResult> => {
  const [indicesData, newsData, investmentData] = await Promise.all([
    financialDataService.fetchMarketIndices(marketId),
    marketNewsService.fetchMarketNews(marketId),
    financialDataService.searchStocks(searchQuery, marketId),
  ]);

  const mappedInvestmentData = investmentData.map((stock) => mapStock(stock, marketId));
  const investments =
    mappedInvestmentData.length > 0 ? mappedInvestmentData : createFallbackStocks(marketId);

  return createResearchDataResult({
    marketIndices: indicesData,
    news: newsData,
    investments,
  });
};

export const createFallbackResearchData = (marketId: string): InvestmentResearchDataResult => {
  return createResearchDataResult({
    marketIndices: createFallbackIndices(marketId),
    news: createFallbackNews(marketId),
    investments: createFallbackStocks(marketId),
  });
};

const createResearchDataResult = ({
  marketIndices,
  news,
  investments,
}: {
  marketIndices: MarketIndex[];
  news: MarketNews[];
  investments: StockData[];
}): InvestmentResearchDataResult => ({
  marketIndices,
  news,
  investments,
  availableSectors: getUniqueStockValues(investments, 'sector'),
  availableIndustries: getUniqueStockValues(investments, 'industry'),
});

const mapStock = (
  stock: Awaited<ReturnType<typeof financialDataService.searchStocks>>[number],
  marketId: string,
): StockData => ({
  symbol: stock.symbol,
  name: stock.name,
  type: 'stocks',
  market: stock.market || marketId,
  currentPrice: stock.price,
  change: stock.change,
  changePercent: stock.changePercent,
  marketCap: stock.marketCap,
  peRatio: stock.peRatio,
  dividendYield: stock.dividendYield,
  volume: stock.volume,
  description: `Company information for ${stock.name}`,
  sector: 'Technology',
  industry: 'Software',
  founded: new Date().getFullYear() - 10,
  employees: 10000,
  headquarters: 'Unknown',
  website: `https://www.${stock.symbol.toLowerCase()}.com`,
});
