import dayjs from 'dayjs';

import type {PaymentFrequency} from './types';

export const addPaymentPeriod = (
  date: dayjs.Dayjs,
  periodNumber: number,
  frequency: PaymentFrequency,
): dayjs.Dayjs => {
  switch (frequency) {
    case 'WEEKLY':
      return date.add(periodNumber * 7, 'day');
    case 'QUARTERLY':
      return date.add(periodNumber * 3, 'month');
    case 'YEARLY':
      return date.add(periodNumber, 'year');
    case 'MONTHLY':
    default:
      return date.add(periodNumber, 'month');
  }
};
