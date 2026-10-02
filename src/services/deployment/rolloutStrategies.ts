import {ENV} from '../../config/environment.config';
import {RolloutStrategy} from './types';

const ROLLOUT_STRATEGIES: Record<string, RolloutStrategy> = {
  development: {
    name: 'Development',
    description: 'Immediate full rollout for development',
    phases: [{percentage: 100, duration: 0, criteria: ['development']}],
    rollbackTriggers: [],
  },
  staging: {
    name: 'Staging Canary',
    description: 'Gradual rollout with monitoring',
    phases: [
      {percentage: 10, duration: 2, criteria: ['beta-users']},
      {percentage: 50, duration: 6, criteria: ['error-rate < 1%']},
      {percentage: 100, duration: 12, criteria: ['crash-rate < 0.1%']},
    ],
    rollbackTriggers: [
      {metric: 'error-rate', threshold: 5, action: 'pause'},
      {metric: 'crash-rate', threshold: 1, action: 'rollback'},
    ],
  },
  production: {
    name: 'Production Blue-Green',
    description: 'Safe production rollout with automatic rollback',
    phases: [
      {percentage: 1, duration: 4, criteria: ['internal-users']},
      {percentage: 5, duration: 8, criteria: ['error-rate < 0.5%']},
      {percentage: 25, duration: 12, criteria: ['performance-score > 90']},
      {percentage: 100, duration: 24, criteria: ['all-metrics-green']},
    ],
    rollbackTriggers: [
      {metric: 'error-rate', threshold: 2, action: 'pause'},
      {metric: 'crash-rate', threshold: 0.5, action: 'rollback'},
      {metric: 'performance-score', threshold: 80, action: 'pause'},
    ],
  },
};

export function getRolloutStrategyForEnvironment(): RolloutStrategy {
  return ROLLOUT_STRATEGIES[ENV.name] || ROLLOUT_STRATEGIES.development;
}
