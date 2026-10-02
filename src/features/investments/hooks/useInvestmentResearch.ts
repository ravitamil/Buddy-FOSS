import {useCallback, useEffect, useMemo, useState} from 'react';

import API_KEYS from '@/config/apiKeys';
import {currencyConversionService} from '@/services/CurrencyConversionService';
import {logger as appLogger} from '@/services/LoggerService';
import type {InvestmentCategory} from '@/types';
import {globalMarkets, researchSortOptions} from './investmentResearchData';
import {createFallbackResearchData, fetchInvestmentResearchData} from './investmentResearchLoader';
import type {
  MarketIndex,
  MarketNews,
  ResearchSortBy,
  ResearchSortOrder,
  StockData,
} from './investmentResearchTypes';

export type {
  GlobalMarket,
  MarketIndex,
  MarketNews,
  ResearchSortBy,
  ResearchSortOrder,
  StockData,
} from './investmentResearchTypes';
export {globalMarkets, researchSortOptions} from './investmentResearchData';

export const useInvestmentResearch = () => {
  const investmentCategories = useMemo<InvestmentCategory[]>(() => [], []);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InvestmentCategory | null>(null);
  const [selectedMarket, setSelectedMarket] = useState(globalMarkets[0]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ResearchSortBy>('symbol');
  const [sortOrder, setSortOrder] = useState<ResearchSortOrder>('asc');
  const [filteredInvestments, setFilteredInvestments] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);

  const applyResearchData = useCallback(
    (data: Awaited<ReturnType<typeof fetchInvestmentResearchData>>) => {
      setMarketIndices(data.marketIndices);
      setNews(data.news);
      setFilteredInvestments(data.investments);
      setAvailableSectors(data.availableSectors);
      setAvailableIndustries(data.availableIndustries);
    },
    [],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchInvestmentResearchData({
        marketId: selectedMarket.id,
        searchQuery,
      });
      applyResearchData(data);
    } catch (err) {
      appLogger.error('Error fetching investment research data', err);
      setError('Failed to fetch market data. Please try again later.');
      applyResearchData(createFallbackResearchData(selectedMarket.id));
    } finally {
      setLoading(false);
    }
  }, [applyResearchData, searchQuery, selectedMarket.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const cycleSortBy = useCallback(() => {
    const currentIndex = researchSortOptions.indexOf(sortBy);
    setSortBy(researchSortOptions[(currentIndex + 1) % researchSortOptions.length]);
  }, [sortBy]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  }, []);

  return {
    apiKeysConfigured: API_KEYS.isFinancialApiKeyConfigured(),
    currencyConversionService,
    investmentCategories,
    searchQuery,
    setSearchQuery,
    refreshing,
    selectedCategory,
    setSelectedCategory,
    selectedMarket,
    setSelectedMarket,
    selectedSector,
    setSelectedSector,
    selectedIndustry,
    setSelectedIndustry,
    sortBy,
    cycleSortBy,
    sortOrder,
    toggleSortOrder,
    filteredInvestments,
    marketIndices,
    news,
    loading,
    error,
    availableSectors,
    availableIndustries,
    handleRefresh,
  };
};
