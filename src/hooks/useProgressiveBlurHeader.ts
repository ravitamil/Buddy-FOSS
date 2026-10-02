/**
 * useProgressiveBlurHeader Hook
 *
 * Encapsulates all scroll-tracking and animation logic needed for the
 * progressive blur navigation header pattern. Screens simply call this hook
 * and spread `headerProps` onto their CustomNavigationHeader.
 *
 * Usage:
 * ```tsx
 * const { onScroll, largeTitleStyle, headerProps } = useProgressiveBlurHeader();
 *
 * <CustomNavigationHeader title="Budget" largeTitle="Budget" {...headerProps} />
 * <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 *   <Animated.View style={largeTitleStyle}>
 *     {/* large title text *\/}
 *   </Animated.View>
 * </Animated.ScrollView>
 * ```
 */

import {useCallback, useMemo} from 'react';
import {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';

export interface ProgressiveBlurHeaderOptions {
  /** Height of the fixed blur header area. Default: 100 */
  headerHeight?: number;
  /** Scroll distance over which the large title fades out. Default: 60 */
  largeTitleFadeDistance?: number;
  /** Whether to show a back button in the non-blur (initial) state. Default: true */
  showBackButtonInNonBlur?: boolean;
}

export function useScrollDirection(scrollY?: SharedValue<number>) {
  const isScrollingDown = useSharedValue(false);
  const lastScrollY = useSharedValue(0);

  const resetScrollDirection = useCallback(() => {
    isScrollingDown.value = false;
  }, [isScrollingDown]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;
      if (currentY <= 10) {
        isScrollingDown.value = false;
      } else if (diff > 5) {
        isScrollingDown.value = true;
      } else if (diff < -5) {
        isScrollingDown.value = false;
      }
      lastScrollY.value = currentY;
      if (scrollY) {
        scrollY.value = currentY;
      }
    },
  });

  return {isScrollingDown, onScroll, resetScrollDirection};
}

export function useProgressiveBlurHeader(options?: ProgressiveBlurHeaderOptions) {
  const {
    headerHeight = 75,
    largeTitleFadeDistance = 60,
    showBackButtonInNonBlur = true,
  } = options ?? {};

  const scrollY = useSharedValue(0);
  const {isScrollingDown, onScroll} = useScrollDirection(scrollY);

  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, largeTitleFadeDistance], [1, 0], 'clamp');
    return {opacity};
  });

  // Props ready to spread on CustomNavigationHeader
  const headerProps = useMemo(
    () => ({
      scrollY,
      enableProgressiveBlur: true as const,
      headerHeight,
      showBackButtonInNonBlur,
    }),
    [scrollY, headerHeight, showBackButtonInNonBlur],
  );

  return {
    scrollY,
    isScrollingDown,
    onScroll,
    largeTitleStyle,
    headerProps,
  };
}
