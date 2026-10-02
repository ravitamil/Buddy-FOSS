import {
  getDefaultCategoryIcon,
  getPersistedCategoryIcon,
  toSingleCategoryIcon,
} from './categoryIcon';

describe('category icon helpers', () => {
  it('uses the category name initial and falls back to C', () => {
    expect(getDefaultCategoryIcon('coffee')).toBe('C');
    expect(getDefaultCategoryIcon('')).toBe('C');
  });

  it('keeps one user-perceived character for keyboard-entered icons', () => {
    expect(toSingleCategoryIcon('😀Coffee')).toBe('😀');
    expect(toSingleCategoryIcon('👨‍👩‍👧‍👦Coffee')).toBe('👨‍👩‍👧‍👦');
  });

  it('only restores a category-name icon when an empty icon is saved', () => {
    expect(getPersistedCategoryIcon('', 'groceries')).toBe('G');
    expect(getPersistedCategoryIcon('🍎 Groceries', 'groceries')).toBe('🍎');
  });
});
