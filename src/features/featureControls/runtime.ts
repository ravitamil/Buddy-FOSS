import {bundledFeatureConfig} from './resolver';
import {FeatureControlError, type FeatureAction, type ResolvedFeatureConfig} from './types';

let runtimeFeatureConfig: ResolvedFeatureConfig = bundledFeatureConfig;

export function setRuntimeFeatureConfig(config: ResolvedFeatureConfig): void {
  runtimeFeatureConfig = config;
}

export function isCachedFeatureActionAllowed(action: FeatureAction): Promise<boolean> {
  return Promise.resolve(runtimeFeatureConfig.actions[action].isAllowed);
}

export function assertCachedFeatureActionAllowed(action: FeatureAction): Promise<void> {
  const control = runtimeFeatureConfig.actions[action];

  if (!control.isAllowed) {
    return Promise.reject(
      new FeatureControlError({
        feature: control.feature,
        action: control.action,
        status: control.status,
        message: control.message,
      }),
    );
  }

  return Promise.resolve();
}
