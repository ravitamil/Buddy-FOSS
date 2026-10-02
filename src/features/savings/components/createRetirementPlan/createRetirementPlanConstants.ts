import type {RiskProfileOption} from './createRetirementPlanTypes';

export const RISK_PROFILES: RiskProfileOption[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    description: 'Lower risk, stable returns - suitable for those close to retirement',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    description: 'Balanced risk and returns - suitable for most investors',
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    description: 'Higher risk, higher potential returns - suitable for those far from retirement',
  },
];
