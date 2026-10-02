import type {EnhancedGroup} from '../types';
import {
  filterGroups,
  getGroupCardColor,
  getOverallGroupStats,
  getTotalExpenseAmount,
} from './groupScreenModels';

const group = {
  id: 'group-a',
  name: 'Weekend Trip',
  description: 'Beach expenses',
  transactions: [
    {type: 'expense', amount: -25},
    {type: 'income', amount: 10},
  ],
} as EnhancedGroup;

describe('groupScreenModels', () => {
  it('filters groups by normalized name or description', () => {
    expect(filterGroups([group], ' BEACH ')).toEqual([group]);
    expect(filterGroups([group], 'missing')).toEqual([]);
    expect(filterGroups([group], '')).toEqual([group]);
  });

  it('totals only expense transactions using absolute values', () => {
    expect(getTotalExpenseAmount(group)).toBe(25);
  });

  it('builds aggregate owe and owed totals from group balances', () => {
    expect(
      getOverallGroupStats([group, {...group, id: 'group-b'}], (item) =>
        item.id === 'group-a' ? -12 : 18,
      ),
    ).toEqual({youOwe: 12, owedToYou: 18});
  });

  it('selects a deterministic card color', () => {
    expect(getGroupCardColor('group-a')).toBe(getGroupCardColor('group-a'));
  });
});
