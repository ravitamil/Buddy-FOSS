export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  volume: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  market: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  market: string;
}

export interface MarketData {
  indices: MarketIndex[];
  topGainers: StockData[];
  topLosers: StockData[];
  mostActive: StockData[];
}
