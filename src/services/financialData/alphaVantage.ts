type AlphaVantageQuote = {
  '01. symbol': string;
  '05. price': string;
  '06. volume': string;
  '09. change': string;
  '10. change percent': string;
};

type AlphaVantageSearchMatch = {
  '1. symbol': string;
  '2. name': string;
  '3. price': string;
};

type MarketIndexSymbol = {
  symbol: string;
  name: string;
};

export const marketSymbolPrefixes: Record<string, string> = {
  us: '',
  in: 'BSE:',
  jp: '',
  cn: 'SHA:',
  uk: 'LON:',
  ca: 'TSE:',
  au: 'ASX:',
  br: '',
  ru: '',
  za: '',
  mx: '',
  kr: '',
  sg: '',
  hk: 'HKG:',
};

export const marketIndexSymbols: Record<string, MarketIndexSymbol[]> = {
  us: [
    {symbol: 'SPX', name: 'S&P 500'},
    {symbol: 'DJI', name: 'Dow Jones'},
    {symbol: 'IXIC', name: 'NASDAQ'},
  ],
  in: [
    {symbol: 'NSEI', name: 'Nifty 50'},
    {symbol: 'BSESN', name: 'Sensex'},
  ],
  jp: [{symbol: 'N225', name: 'Nikkei 225'}],
  cn: [{symbol: '000001.SS', name: 'Shanghai Composite'}],
  eu: [
    {symbol: 'GDAXI', name: 'DAX'},
    {symbol: 'FTSE', name: 'FTSE 100'},
  ],
  uk: [{symbol: 'FTSE', name: 'FTSE 100'}],
  ca: [{symbol: 'GSPTSE', name: 'S&P/TSX'}],
  au: [{symbol: 'AXJO', name: 'ASX 200'}],
  br: [{symbol: 'IBOVESPA', name: 'Bovespa'}],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toApiString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'symbol') return value.description ?? '';
  if (value == null) return '';
  return Object.prototype.toString.call(value);
};

export const getAlphaVantageApiError = (data: unknown): string | null => {
  if (!isRecord(data)) {
    return null;
  }

  const error = data['Error Message'];
  return error == null ? null : toApiString(error);
};

export const getAlphaVantageGlobalQuote = (data: unknown): AlphaVantageQuote | null => {
  if (!isRecord(data) || !isRecord(data['Global Quote'])) {
    return null;
  }

  const quote = data['Global Quote'];
  return {
    '01. symbol': toApiString(quote['01. symbol']),
    '05. price': toApiString(quote['05. price']),
    '06. volume': toApiString(quote['06. volume']),
    '09. change': toApiString(quote['09. change']),
    '10. change percent': toApiString(quote['10. change percent']),
  };
};

export const getAlphaVantageSearchMatches = (data: unknown): AlphaVantageSearchMatch[] | null => {
  if (!isRecord(data) || !Array.isArray(data.bestMatches)) {
    return null;
  }

  return data.bestMatches.filter(isRecord).map((match) => ({
    '1. symbol': toApiString(match['1. symbol']),
    '2. name': toApiString(match['2. name']),
    '3. price': toApiString(match['3. price']),
  }));
};

export const symbolMatchesMarket = (symbol: string, market: string): boolean => {
  switch (market) {
    case 'us':
      return !symbol.includes('.') || symbol.endsWith('.US');
    case 'in':
      return symbol.includes('BSE:') || symbol.includes('.BO') || symbol.includes('.NS');
    case 'jp':
      return symbol.includes('.T') || symbol.includes('TYO:');
    case 'cn':
      return (
        symbol.includes('SHA:') ||
        symbol.includes('SHZ:') ||
        symbol.includes('.SS') ||
        symbol.includes('.SZ')
      );
    case 'uk':
      return symbol.includes('LON:') || symbol.includes('.L');
    case 'ca':
      return symbol.includes('TSE:') || symbol.includes('.TO') || symbol.includes('.TRT');
    case 'au':
      return symbol.includes('ASX:') || symbol.includes('.AX');
    default:
      return true;
  }
};
