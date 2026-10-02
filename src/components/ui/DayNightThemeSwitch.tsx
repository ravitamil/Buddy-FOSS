/* eslint-disable development-quality/enforce-tamagui-usage -- Animated primitives require Reanimated components for 60fps native performance */
import React, {useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, {Circle, Path} from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export interface DayNightThemeSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// Geometric Constants
const TRACK_WIDTH = 62;
const TRACK_HEIGHT = 34;
const PADDING = 3;
const THUMB_SIZE = 28;
const TRAVEL_DISTANCE = TRACK_WIDTH - THUMB_SIZE - PADDING * 2; // 28

// Color Palettes representing the nature of Day and Night
const COLORS = {
  // Track (Sky: clear daylight sky blue -> deep midnight navy)
  lightTrackBg: '#6BB8DE',
  darkTrackBg: '#0F172A',
  lightTrackBorder: '#52A6D1',
  darkTrackBorder: '#1E293B',

  // Thumb (Sun: radiant golden amber -> Moon: cool lunar slate)
  lightThumbBg: '#F59E0B',
  darkThumbBg: '#334155',

  // Sky Decorations (Day: soft white clouds -> Night: glowing starlight gold)
  lightSkyDeco: '#FFFFFF',
  darkSkyDeco: '#FDE047',
  extraStarDeco: '#FEF08A',
};

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
};

// Sun SVG Icon
export const SunIcon = ({size = 15, color = '#FFFFFF'}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4.2" fill={color} stroke={color} strokeWidth="1.5" />
    <Path d="M12 2v2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 19.5v2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="m4.93 4.93 1.77 1.77" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="m17.3 17.3 1.77 1.77" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M2 12h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M19.5 12h2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="m6.7 17.3-1.77 1.77" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="m19.07 4.93-1.77 1.77" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Moon + Star SVG Icon
export const MoonStarIcon = ({size = 15, color = '#FFFFFF'}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.5 3.5a6 6 0 0 0 8 8 9 9 0 1 1-8-8Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M19.5 2v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M21.5 4h-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export function DayNightThemeSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  accessibilityLabel = 'Toggle theme',
  testID = 'day-night-theme-switch',
}: DayNightThemeSwitchProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, SPRING_CONFIG);
  }, [checked, progress]);

  const handlePress = () => {
    if (disabled) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if haptics unavailable
    }
    onCheckedChange(!checked);
  };

  // Track Animated Style
  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.lightTrackBg, COLORS.darkTrackBg],
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.lightTrackBorder, COLORS.darkTrackBorder],
    );

    return {
      backgroundColor,
      borderColor,
    };
  });

  // Thumb Animated Style (Translate & Background Color)
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, TRAVEL_DISTANCE]);
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.lightThumbBg, COLORS.darkThumbBg],
    );

    return {
      transform: [{translateX}],
      backgroundColor,
    };
  });

  // Sun Icon Animation
  const sunAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0, 0.45], [1, 0.2], Extrapolation.CLAMP);
    const rotate = `${interpolate(progress.value, [0, 0.45], [0, 90], Extrapolation.CLAMP)}deg`;

    return {
      opacity,
      transform: [{scale}, {rotate}],
    };
  });

  // MoonStar Icon Animation
  const moonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0.55, 1], [0.2, 1], Extrapolation.CLAMP);
    const rotate = `${interpolate(progress.value, [0.55, 1], [-90, 0], Extrapolation.CLAMP)}deg`;

    return {
      opacity,
      transform: [{scale}, {rotate}],
    };
  });

  // Decoration Color Shared Style
  const decoSharedColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.lightSkyDeco, COLORS.darkSkyDeco],
    );

    return {backgroundColor};
  });

  // Morphing Deco 1 (Top Cloud -> Star 1)
  const deco1AnimatedStyle = useAnimatedStyle(() => {
    const left = interpolate(progress.value, [0, 1], [34, 18]);
    const top = interpolate(progress.value, [0, 1], [7, 8.5]);
    const width = interpolate(progress.value, [0, 1], [19, 3.5]);
    const height = interpolate(progress.value, [0, 1], [4.5, 3.5]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.85, 0.45, 0.7]);

    return {
      left,
      top,
      width,
      height,
      borderRadius: height / 2,
      opacity,
    };
  });

  // Morphing Deco 2 (Middle Cloud -> Star 2)
  const deco2AnimatedStyle = useAnimatedStyle(() => {
    const left = interpolate(progress.value, [0, 1], [39, 8]);
    const top = interpolate(progress.value, [0, 1], [14.5, 14]);
    const width = interpolate(progress.value, [0, 1], [14, 3.5]);
    const height = interpolate(progress.value, [0, 1], [4.5, 3.5]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.85, 0.45, 0.7]);

    return {
      left,
      top,
      width,
      height,
      borderRadius: height / 2,
      opacity,
    };
  });

  // Morphing Deco 3 (Bottom Cloud -> Star 3)
  const deco3AnimatedStyle = useAnimatedStyle(() => {
    const left = interpolate(progress.value, [0, 1], [34, 13.5]);
    const top = interpolate(progress.value, [0, 1], [22, 22.5]);
    const width = interpolate(progress.value, [0, 1], [10, 3.5]);
    const height = interpolate(progress.value, [0, 1], [4.5, 3.5]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.85, 0.45, 0.7]);

    return {
      left,
      top,
      width,
      height,
      borderRadius: height / 2,
      opacity,
    };
  });

  // Extra Star 4 (Twinkle in night)
  const star4AnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.45, 1], [0, 0.6], Extrapolation.CLAMP);

    return {opacity};
  });

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{checked, disabled}}
      style={styles.pressable}>
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        {/* Sky Elements: Clouds / Stars */}
        <Animated.View
          style={[styles.decoElement, decoSharedColorStyle, deco1AnimatedStyle]}
          pointerEvents="none"
        />
        <Animated.View
          style={[styles.decoElement, decoSharedColorStyle, deco2AnimatedStyle]}
          pointerEvents="none"
        />
        <Animated.View
          style={[styles.decoElement, decoSharedColorStyle, deco3AnimatedStyle]}
          pointerEvents="none"
        />
        <Animated.View style={[styles.extraStar, star4AnimatedStyle]} pointerEvents="none" />

        {/* Sliding Thumb */}
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
          <Animated.View style={[styles.iconContainer, sunAnimatedStyle]}>
            <SunIcon size={15} />
          </Animated.View>
          <Animated.View style={[styles.iconContainer, moonAnimatedStyle]}>
            <MoonStarIcon size={15} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1.5,
    padding: PADDING,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decoElement: {
    position: 'absolute',
  },
  extraStar: {
    position: 'absolute',
    left: 23,
    top: 7,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.extraStarDeco,
  },
});

export default DayNightThemeSwitch;
