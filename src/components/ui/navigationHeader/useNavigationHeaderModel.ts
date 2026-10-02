import {isAndroid as tamaguiIsAndroid} from '@tamagui/constants';
import {router, usePathname} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import {useTheme} from 'tamagui';
import {useTamaguiTheme} from '../../../context/TamaguiThemeProvider';
import type {CustomNavigationHeaderProps} from './navigationHeaderTypes';

export function useNavigationHeaderModel({
  onBackPress,
  scrollY,
  enableProgressiveBlur = false,
  headerHeight = 75,
  showBackButtonInNonBlur = false,
  mode = 'static',
}: CustomNavigationHeaderProps) {
  const {isDarkMode} = useTamaguiTheme();
  const theme = useTheme();
  const pathname = usePathname();
  const isAndroid = tamaguiIsAndroid;
  const insets = useSafeAreaInsets();
  const themeBackgroundColor = isDarkMode ? '#0A0B0E' : '#ffffff';
  const themeTextColor = typeof theme.color?.val === 'string' ? theme.color.val : '#000000';
  const themeSubtitleColor = typeof theme.color11?.val === 'string' ? theme.color11.val : '#666666';
  const effectiveHeaderHeight = headerHeight + insets.top;
  const isProgressive = enableProgressiveBlur || mode === 'progressive';
  const isCollapsing = mode === 'collapsing';
  const isDynamic = isProgressive || isCollapsing;

  const headerBackgroundStyle = useAnimatedStyle(() => {
    if (!isDynamic || !scrollY) {
      return {opacity: 0};
    }

    const opacity = interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP);
    return {opacity};
  });

  const smallHeaderStyle = useAnimatedStyle(() => {
    if (!isDynamic || !scrollY) {
      return {opacity: 1, transform: [{translateY: 0}]};
    }

    if (isCollapsing) {
      const opacity = interpolate(scrollY.value, [30, 60], [0, 1], Extrapolation.CLAMP);
      return {opacity, transform: [{translateY: 0}]};
    }

    const opacity = interpolate(scrollY.value, [40, 80], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [40, 80], [20, 0], Extrapolation.CLAMP);

    return {opacity, transform: [{translateY}]};
  });

  const largeHeaderStyle = useAnimatedStyle(() => {
    if (!isCollapsing || !scrollY) {
      return {opacity: 0};
    }

    const opacity = interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 40], [0, -10], Extrapolation.CLAMP);

    return {opacity, transform: [{translateY}]};
  });

  const backButtonStyle = useAnimatedStyle(() => {
    if (!isDynamic || !scrollY) {
      return {opacity: 1};
    }

    if (isCollapsing) {
      const opacity = interpolate(scrollY.value, [0, 20], [1, 0], Extrapolation.CLAMP);
      return {opacity};
    }

    if (!showBackButtonInNonBlur) {
      return {opacity: 1};
    }

    const opacity = interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP);
    return {opacity};
  });

  const rightElementStyle = useAnimatedStyle(() => {
    if (!isCollapsing || !scrollY) {
      return {opacity: 1};
    }

    const opacity = interpolate(scrollY.value, [0, 20], [1, 0], Extrapolation.CLAMP);
    return {opacity};
  });

  const handleBackPress = () => {
    if (onBackPress) {
      try {
        onBackPress();
      } catch {}
      return;
    }

    if (pathname === '/savings-portfolio') {
      pushFallback('/(tabs)');
      return;
    }

    if (pathname === '/profile-settings') {
      pushFallback('/(tabs)/settings');
      return;
    }

    if (pathname === '/(tabs)/settings' || pathname === '/settings') {
      pushFallback('/(tabs)');
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    } catch {
      pushFallback('/(tabs)');
    }
  };

  return {
    backButtonStyle,
    effectiveHeaderHeight,
    handleBackPress,
    headerBackgroundStyle,
    insets,
    isAndroid,
    isCollapsing,
    isDarkMode,
    isDynamic,
    largeHeaderStyle,
    rightElementStyle,
    scrollY,
    smallHeaderStyle,
    themeSubtitleColor,
    themeBackgroundColor,
    themeTextColor,
  };
}

function pushFallback(path: '/(tabs)' | '/(tabs)/settings') {
  try {
    router.push(path);
  } catch {}
}

export type NavigationHeaderModel = ReturnType<typeof useNavigationHeaderModel>;
