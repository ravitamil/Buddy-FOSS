export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: 'all' | 'beta' | 'internal';
  minimumAppVersion: string;
  description: string;
  expiresAt?: Date;
}

export interface DeploymentMetrics {
  deploymentId: string;
  version: string;
  buildNumber: string;
  deployedAt: Date;
  environment: string;
  rolloutPercentage: number;
  activeUsers: number;
  errorRate: number;
  crashRate: number;
  performanceScore: number;
}

export interface RolloutStrategy {
  name: string;
  description: string;
  phases: Array<{
    percentage: number;
    duration: number;
    criteria: string[];
  }>;
  rollbackTriggers: Array<{
    metric: string;
    threshold: number;
    action: 'pause' | 'rollback';
  }>;
}

export interface DeploymentHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  issues: string[];
}

export interface DeploymentStatus {
  isInitialized: boolean;
  environment: string;
  featureFlagsCount: number;
  deploymentId?: string;
  version?: string;
}
