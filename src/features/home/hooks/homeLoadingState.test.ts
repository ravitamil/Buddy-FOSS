import {isHomeContentLoading} from './homeLoadingState';

describe('isHomeContentLoading', () => {
  it.each([
    {
      areSettingsInitialized: false,
      isBudgetsLoading: false,
      isTransactionsLoading: false,
      expected: true,
      scenario: 'the currency preference is still hydrating',
    },
    {
      areSettingsInitialized: true,
      isBudgetsLoading: true,
      isTransactionsLoading: false,
      expected: true,
      scenario: 'budget data is loading',
    },
    {
      areSettingsInitialized: true,
      isBudgetsLoading: false,
      isTransactionsLoading: true,
      expected: true,
      scenario: 'transaction data is loading',
    },
    {
      areSettingsInitialized: true,
      isBudgetsLoading: false,
      isTransactionsLoading: false,
      expected: false,
      scenario: 'the formatted content is ready',
    },
  ])('keeps the Home skeleton visible when $scenario', ({expected, ...state}) => {
    expect(isHomeContentLoading(state)).toBe(expected);
  });
});
