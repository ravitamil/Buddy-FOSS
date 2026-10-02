import {SegmentedControl} from '@ravitamil/buddy-ui';
import React from 'react';

import type {BudgetPeriod} from '@/types';

interface PeriodSelectorProps {
  selectedPeriod: BudgetPeriod;
  isDarkMode: boolean;
  onPeriodChange: (period: BudgetPeriod) => void;
}

const periods: Array<{value: BudgetPeriod; label: string}> = [
  {value: 'weekly', label: 'Weekly'},
  {value: 'monthly', label: 'Monthly'},
  {value: 'yearly', label: 'Yearly'},
];

export function PeriodSelector({selectedPeriod, onPeriodChange}: PeriodSelectorProps) {
  return (
    <SegmentedControl
      options={periods}
      value={selectedPeriod}
      onValueChange={(value) => {
        if (value === 'weekly' || value === 'monthly' || value === 'yearly') {
          onPeriodChange(value);
        }
      }}
      selectedTone="info"
      testID="budget-period-selector"
    />
  );
}
