import * as Application from 'expo-application';
import {ENV} from '../../config/environment.config';
import {DeploymentMetrics} from './types';

export function createDeploymentMetrics(): DeploymentMetrics {
  return {
    deploymentId: generateDeploymentId(),
    version: Application.nativeApplicationVersion || '1.0.0',
    buildNumber: Application.nativeBuildVersion || '1',
    deployedAt: new Date(),
    environment: ENV.name,
    rolloutPercentage: 100,
    activeUsers: 0,
    errorRate: 0,
    crashRate: 0,
    performanceScore: 100,
  };
}

function generateDeploymentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `deploy_${timestamp}_${random}`;
}
