import {
  getTransactionAmountColor,
  getTransactionTypeLabel,
  isEmojiCategoryIcon,
} from './transactionDetailPresentation';

describe('transactionDetailPresentation', () => {
  it('distinguishes emoji category icons from icon names', () => {
    expect(isEmojiCategoryIcon('🍜')).toBe(true);
    expect(isEmojiCategoryIcon('fast-food-outline')).toBe(false);
    expect(isEmojiCategoryIcon('')).toBe(false);
  });

  it('builds transaction type presentation values', () => {
    expect(getTransactionTypeLabel('expense')).toBe('Expense');
    expect(getTransactionTypeLabel('income')).toBe('Income');
    expect(getTransactionAmountColor(100)).toBe('$green5');
    expect(getTransactionAmountColor(0)).toBe('$red5');
    expect(getTransactionAmountColor(-25)).toBe('$red5');
  });
});
