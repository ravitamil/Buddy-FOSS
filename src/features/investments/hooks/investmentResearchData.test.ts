import {
  createFallbackIndices,
  createFallbackNews,
  createFallbackStocks,
  getUniqueStockValues,
} from './investmentResearchData';

describe('investmentResearchData', () => {
  it('creates market-scoped fallback data', () => {
    expect(createFallbackStocks('in')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({symbol: 'AAPL', market: 'in'}),
        expect.objectContaining({symbol: 'MSFT', market: 'in'}),
      ]),
    );
    expect(createFallbackIndices('in')[0]).toMatchObject({symbol: 'SPX', market: 'in'});
    expect(createFallbackNews('in')[0]).toMatchObject({title: 'Market Update', market: 'in'});
  });

  it('deduplicates stock metadata values', () => {
    expect(
      getUniqueStockValues(
        [
          {...createFallbackStocks('us')[0], sector: 'Technology'},
          {...createFallbackStocks('us')[1], sector: 'Technology'},
        ],
        'sector',
      ),
    ).toEqual(['Technology']);
  });
});
