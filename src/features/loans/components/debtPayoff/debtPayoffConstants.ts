import type {DebtPayoffStrategyOption} from './debtPayoffTypes';

export const STRATEGIES: DebtPayoffStrategyOption[] = [
  {id: 'snowball', name: 'Snowball', description: 'Pay off smallest debts first', icon: 'snow'},
  {
    id: 'avalanche',
    name: 'Avalanche',
    description: 'Pay off highest interest debts first',
    icon: 'flame',
  },
  {id: 'snowflake', name: 'Snowflake', description: 'Balanced approach', icon: 'snow'},
  {id: 'custom', name: 'Custom', description: 'Define your own order', icon: 'reorder-four'},
];
