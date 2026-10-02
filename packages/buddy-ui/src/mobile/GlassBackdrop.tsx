import React, {forwardRef} from 'react';
import {BlurView, type BlurViewProps} from 'expo-blur';
import {useTheme} from 'tamagui';

import {inferIsDarkMode} from '../utils/themeMode';
import {useBlurTarget} from './BlurTargetContext';

export type GlassBackdropProps = BlurViewProps;

export const GlassBackdrop = forwardRef<BlurView, GlassBackdropProps>(function GlassBackdrop(
  {blurMethod, blurTarget, tint, ...props},
  ref,
) {
  const theme = useTheme();
  const contextualBlurTarget = useBlurTarget();
  const resolvedBlurTarget = blurTarget ?? contextualBlurTarget ?? undefined;

  return (
    <BlurView
      ref={ref}
      {...props}
      tint={tint ?? (inferIsDarkMode(theme) ? 'dark' : 'light')}
      blurTarget={resolvedBlurTarget}
      blurMethod={blurMethod ?? (resolvedBlurTarget ? 'dimezisBlurViewSdk31Plus' : 'none')}
    />
  );
});
