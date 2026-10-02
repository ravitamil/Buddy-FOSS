import {getCategoryTypeColor, getCategoryTypeIcon} from './categoryTypePresentation';

describe('categoryTypePresentation', () => {
  test.each([
    ['income', '#4CAF50'],
    ['expense', '#FF5722'],
    ['investment', '#2196F3'],
  ] as const)('returns the configured color for %s categories', (type, expected) => {
    expect(getCategoryTypeColor(type)).toBe(expected);
  });

  test.each([
    ['income', 'trending-up'],
    ['expense', 'trending-down'],
    ['investment', 'trending-up'],
  ] as const)('returns the configured icon for %s categories', (type, expected) => {
    expect(getCategoryTypeIcon(type)).toBe(expected);
  });
});
