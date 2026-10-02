import {performanceMonitoring} from './PerformanceMonitoringService';

export type StartupPhase =
  | 'js_start'
  | 'first_shell'
  | 'query_restored'
  | 'auth_resolved'
  | 'profile_ready'
  | 'app_interactive';

const baseline = typeof performance !== 'undefined' ? performance.now() : Date.now();
const recordedPhases = new Set<StartupPhase>();

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const markStartupPhase = (phase: StartupPhase): void => {
  if (recordedPhases.has(phase)) return;
  recordedPhases.add(phase);

  const duration = Math.max(0, now() - baseline);
  performanceMonitoring.recordMetric('startupPhase', duration, 'ms', {phase});

  if (phase === 'app_interactive') {
    performanceMonitoring.recordMetric('timeToInteractive', duration, 'ms', {
      phase: 'interactive',
    });
  }
};

markStartupPhase('js_start');
