import {DeploymentHealth} from './types';

export function createDeploymentHealth(
  errorRate: number,
  crashRate: number,
  performanceScore: number,
): DeploymentHealth {
  const issues = getDeploymentHealthIssues(errorRate, crashRate, performanceScore);

  return {
    status: getDeploymentHealthStatus(errorRate, crashRate, performanceScore),
    metrics: {
      errorRate,
      crashRate,
      performanceScore,
    },
    issues,
  };
}

export function createFailedDeploymentHealth(): DeploymentHealth {
  return {
    status: 'critical',
    metrics: {},
    issues: ['Failed to check deployment health'],
  };
}

export function calculateErrorRate(): number {
  return Math.random() * 2;
}

export function calculateCrashRate(): number {
  return Math.random() * 0.5;
}

export function calculatePerformanceScore(): number {
  return 85 + Math.random() * 15;
}

function getDeploymentHealthIssues(
  errorRate: number,
  crashRate: number,
  performanceScore: number,
): string[] {
  const issues: string[] = [];

  if (errorRate > 5) {
    issues.push(`High error rate: ${errorRate}%`);
  }
  if (crashRate > 1) {
    issues.push(`High crash rate: ${crashRate}%`);
  }
  if (performanceScore < 80) {
    issues.push(`Low performance score: ${performanceScore}`);
  }

  return issues;
}

function getDeploymentHealthStatus(
  errorRate: number,
  crashRate: number,
  performanceScore: number,
): DeploymentHealth['status'] {
  if (errorRate > 10 || crashRate > 2 || performanceScore < 60) {
    return 'critical';
  }
  if (errorRate > 2 || crashRate > 0.5 || performanceScore < 80) {
    return 'warning';
  }
  return 'healthy';
}
