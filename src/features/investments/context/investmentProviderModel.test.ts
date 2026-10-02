import type {Investment, InvestmentCategory} from '@/types';
import {
  appendItem,
  createInvestment,
  createInvestmentCategory,
  getErrorMessage,
  removeItemById,
  replaceItemById,
  updateExistingCategory,
  updateExistingInvestment,
} from './investmentProviderModel';

const category: InvestmentCategory = {
  id: 'stocks',
  name: 'Stocks',
  icon: 'chart-line',
  color: '#123456',
  riskLevel: 'high',
};

const investment: Investment = {
  id: 'investment-1',
  name: 'Index Fund',
  category,
  type: 'mutual_funds',
  amount: 1000,
  purchaseAmount: 1000,
  purchaseDate: new Date('2026-01-01T00:00:00.000Z'),
  quantity: 10,
  currentPrice: 120,
  purchasePrice: 100,
  isActive: true,
  currency: 'USD',
  categoryId: category.id,
  lastUpdated: new Date('2026-01-02T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('investmentProviderModel', () => {
  it('normalizes supported errors and ignores unsupported values', () => {
    expect(getErrorMessage(new Error('failed'))).toBe('failed');
    expect(getErrorMessage('offline')).toBe('offline');
    expect(getErrorMessage({message: 'ignored'})).toBeNull();
  });

  it('creates an active investment with generated metadata', () => {
    const now = new Date('2026-02-01T00:00:00.000Z');
    const {id: _id, lastUpdated: _lastUpdated, createdAt: _createdAt, ...data} = investment;

    expect(createInvestment(data, 'generated-id', now)).toEqual({
      ...data,
      id: 'generated-id',
      lastUpdated: now,
      createdAt: now,
      isActive: true,
    });
  });

  it('updates an existing investment and refreshes its timestamp', () => {
    const now = new Date('2026-02-02T00:00:00.000Z');

    expect(updateExistingInvestment([investment], investment.id, {name: 'Updated'}, now)).toEqual({
      ...investment,
      name: 'Updated',
      lastUpdated: now,
    });
  });

  it('rejects updates for a missing investment', () => {
    expect(() => updateExistingInvestment([], 'missing', {name: 'Updated'}, new Date())).toThrow(
      'Investment not found',
    );
  });

  it('creates and updates non-system categories', () => {
    const {id: _id, ...categoryData} = category;
    const created = createInvestmentCategory(categoryData, 'category-2');

    expect(created).toEqual({...categoryData, id: 'category-2', isSystem: false});
    expect(updateExistingCategory([created], created.id, {name: 'Updated'})).toEqual({
      ...created,
      name: 'Updated',
    });
  });

  it('rejects updates for a missing category', () => {
    expect(() => updateExistingCategory([], 'missing', {name: 'Updated'})).toThrow(
      'Category not found',
    );
  });

  it('applies immutable cache list updates', () => {
    const second = {...investment, id: 'investment-2'};
    const updated = {...investment, name: 'Updated'};

    expect(appendItem([investment], second)).toEqual([investment, second]);
    expect(replaceItemById([investment, second], updated)).toEqual([updated, second]);
    expect(removeItemById([investment, second], investment.id)).toEqual([second]);
  });
});
