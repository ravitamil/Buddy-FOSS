import {useMemo} from 'react';
import {FeatureControlError, type FeatureAction, type FeatureKey} from './types';
import {useFeatureStatusContext} from './FeatureStatusProvider';

export function useFeatureStatus(feature: FeatureKey) {
  const {config} = useFeatureStatusContext();
  return config.features[feature];
}

export function useFeatureAction(action: FeatureAction) {
  const {config} = useFeatureStatusContext();
  return config.actions[action];
}

export function useFeatureActionGuard(action: FeatureAction) {
  const control = useFeatureAction(action);

  return useMemo(
    () => ({
      ...control,
      assertAllowed: () => {
        if (!control.isAllowed) {
          throw new FeatureControlError({
            feature: control.feature,
            action: control.action,
            status: control.status,
            message: control.message,
          });
        }
      },
    }),
    [control],
  );
}
