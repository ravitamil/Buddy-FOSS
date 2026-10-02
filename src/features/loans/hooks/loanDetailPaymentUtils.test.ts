import {createEmptyAdditionalPayment, parseAdditionalPaymentAmount} from './loanDetailPaymentUtils';

describe('loanDetailPaymentUtils', () => {
  it.each(['', '0', '-10', 'not-a-number'])(
    'rejects invalid additional payment amount %s',
    (value) => {
      expect(parseAdditionalPaymentAmount(value)).toEqual({
        amount: null,
        error: 'Please enter a valid amount',
      });
    },
  );

  it('parses a positive additional payment amount', () => {
    expect(parseAdditionalPaymentAmount('1250.50')).toEqual({
      amount: 1250.5,
      error: null,
    });
  });

  it('creates a clean additional payment state', () => {
    expect(createEmptyAdditionalPayment()).toEqual({
      visible: false,
      amount: '',
      error: null,
    });
  });
});
