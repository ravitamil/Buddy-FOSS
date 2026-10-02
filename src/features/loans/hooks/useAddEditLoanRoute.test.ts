import {toLoanDraft} from './loanRouteMappers';
import type {LoanFormData} from '@/types/loan.types';

describe('toLoanDraft', () => {
  it('preserves the form start date and uses the first EMI date as the billing fallback', () => {
    const form: LoanFormData = {
      name: 'Home loan',
      startDate: '2026-01-15T00:00:00.000Z',
      firstEmiDate: '2026-02-15T00:00:00.000Z',
      reminderDaysBefore: 3,
    };

    const draft = toLoanDraft(form);

    expect(draft.startDate.toISOString()).toBe('2026-01-15T00:00:00.000Z');
    expect(draft.nextEmiDate.toISOString()).toBe('2026-02-15T00:00:00.000Z');
  });

  it('maps structured charges into the persisted loan fields', () => {
    const form: LoanFormData = {
      charges: {
        processingFee: 1250,
        prepaymentCharges: {percentage: 2},
        lateFee: {percentage: 1.5},
      },
      reminderDaysBefore: 5,
    };

    const draft = toLoanDraft(form);

    expect(draft.processingCharges).toBe(1250);
    expect(draft.otherCharges).toBe(3.5);
    expect(draft.reminderDaysBefore).toBe(5);
  });
});
