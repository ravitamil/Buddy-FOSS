export {FeatureRouteGuard} from './FeatureRouteGuard';
export {FeatureStatusProvider, useFeatureStatusContext} from './FeatureStatusProvider';
export {FeatureUnavailable} from './FeatureUnavailable';
export {
  featureControlMatrix,
  featureDefinitions,
  actionDefinitions,
  routeDefinitions,
} from './matrix';
export {bundledFeatureConfig, getRouteControlForPath, resolveFeatureControls} from './resolver';
export {assertCachedFeatureActionAllowed, isCachedFeatureActionAllowed} from './runtime';
export {useFeatureAction, useFeatureActionGuard, useFeatureStatus} from './hooks';
export type {
  FeatureAction,
  FeatureActionDefinition,
  FeatureControlRow,
  FeatureKey,
  FeatureRouteDefinition,
  FeatureStatus,
  ResolvedFeatureAction,
  ResolvedFeatureConfig,
  ResolvedFeatureControl,
} from './types';
export {FeatureControlError} from './types';
