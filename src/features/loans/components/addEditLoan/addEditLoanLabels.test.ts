import {
  getInterestTypeLabel,
  getLenderTypeLabel,
  getPayoffStrategyLabel,
} from './addEditLoanLabels';

describe('addEditLoan label helpers', () => {
  it('formats payoff strategy labels', () => {
    expect(getPayoffStrategyLabel('snowball')).toBe('Snowball (smallest balance first)');
    expect(getPayoffStrategyLabel('avalanche')).toBe('Avalanche (highest interest first)');
    expect(getPayoffStrategyLabel(undefined)).toBe('Select strategy');
  });

  it('formats lender and interest type labels', () => {
    expect(getLenderTypeLabel('nbfc')).toBe('NBFC');
    expect(getLenderTypeLabel('unknown')).toBe('Select lender type');
    expect(getInterestTypeLabel('FLOATING')).toBe('Floating Rate');
    expect(getInterestTypeLabel(undefined)).toBe('Select interest type');
  });
});
