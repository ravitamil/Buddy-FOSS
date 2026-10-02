import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Platform, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {usePathname} from 'expo-router';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';
import {Text} from '@ravitamil/buddy-ui';
import {XStack, YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useFeatureStatus} from '@/features/featureControls';
import type {FeatureKey, ResolvedFeatureControl} from '@/features/featureControls';
import {getFontFamilyForWeight} from '@/utils/fonts';

const TrackChangesIcon = ({size = 26, color}: {size?: number; color: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z" />
  </Svg>
);

const GroupWorkIcon = ({size = 26, color}: {size?: number; color: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </Svg>
);

interface TabItem {
  name: string;
  label: string;
  route: string;
  feature: FeatureKey;
  renderIcon: (props: {color: string; size: number; isFocused: boolean}) => React.ReactNode;
}

interface TabRoute {
  key: string;
  name: string;
}

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: unknown;
  navigation: {
    emit: (event: {type: 'tabPress'; target: string; canPreventDefault: true}) => {
      defaultPrevented?: boolean;
    };
    navigate: (routeName: string) => void;
  };
}

const TAB_ITEMS: TabItem[] = [
  {
    name: 'index',
    label: 'HOME',
    route: '/',
    feature: 'home',
    renderIcon: ({color, size, isFocused}) => (
      <Ionicons name={isFocused ? 'planet' : 'planet-outline'} size={size} color={color} />
    ),
  },
  {
    name: 'trackers/index',
    label: 'TRACKERS',
    route: '/trackers',
    feature: 'trackers',
    renderIcon: ({color, size}) => <TrackChangesIcon size={size} color={color} />,
  },
  {
    name: 'groups/index',
    label: 'GROUPS',
    route: '/groups',
    feature: 'groups',
    renderIcon: ({color, size}) => <GroupWorkIcon size={size} color={color} />,
  },
  {
    name: 'settings/index',
    label: 'SETTINGS',
    route: '/settings',
    feature: 'settings',
    renderIcon: ({color, size, isFocused}) => (
      <Ionicons name={isFocused ? 'settings' : 'settings-outline'} size={size} color={color} />
    ),
  },
];

interface TabButtonProps {
  item: TabItem;
  isFocused: boolean;
  isDarkMode: boolean;
  onPress: (item: TabItem, isFocused: boolean) => void;
}

const TabButton = memo(({item, isFocused, isDarkMode, onPress}: TabButtonProps) => {
  const scale = useSharedValue(isFocused ? 1 : 0.92);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1, {damping: 14, stiffness: 240});
      pillOpacity.value = withTiming(1, {duration: 160});
    } else {
      scale.value = withTiming(0.92, {duration: 120});
      pillOpacity.value = withTiming(0, {duration: 120});
    }
  }, [isFocused, pillOpacity, scale]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{scale: scale.value}],
  }));

  // Razor-Sharp High-Contrast Color System (Swapped to Brand Coin Gold)
  const activeColor = isDarkMode ? '#F6C31A' : '#D97706';
  const inactiveColor = isDarkMode ? '#FFFFFF' : '#64748B';
  const pillBgColor = isDarkMode ? 'rgba(246, 195, 26, 0.22)' : 'rgba(217, 119, 6, 0.14)';

  const handlePress = useCallback(() => {
    onPress(item, isFocused);
  }, [isFocused, item, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{selected: isFocused}}
      style={styles.tabButton}>
      <YStack alignItems="center" justifyContent="center">
        {/* Active Oval Pill Capsule behind icon */}
        <YStack
          width={64}
          height={40}
          borderRadius={20}
          alignItems="center"
          justifyContent="center"
          position="relative"
          marginBottom={2}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 20,
                backgroundColor: pillBgColor,
              },
              animatedPillStyle,
            ]}
          />

          {item.renderIcon({
            color: isFocused ? activeColor : inactiveColor,
            size: 26,
            isFocused,
          })}
        </YStack>

        {/* Razor-Sharp Typography Label */}
        <Text
          fontSize={10.5}
          color={isFocused ? activeColor : inactiveColor}
          weight={isFocused ? 'bold' : 'semibold'}
          fontFamily={getFontFamilyForWeight(isFocused ? 'bold' : 'semibold')}
          marginTop={2}
          letterSpacing={0.3}>
          {item.label}
        </Text>
      </YStack>
    </Pressable>
  );
});

const TAB_NAVIGATION_LOCK_DURATION_MS = 220;

export function CustomTabBar({state, navigation}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const {isDarkMode} = useTamaguiTheme();
  const tabNavigationLockRef = useRef(false);
  const tabNavigationLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const homeStatus = useFeatureStatus('home');
  const trackersStatus = useFeatureStatus('trackers');
  const groupsStatus = useFeatureStatus('groups');
  const settingsStatus = useFeatureStatus('settings');

  const statusByFeature: Partial<Record<FeatureKey, ResolvedFeatureControl>> = {
    home: homeStatus,
    trackers: trackersStatus,
    groups: groupsStatus,
    settings: settingsStatus,
  };

  const visibleTabItems = TAB_ITEMS.filter((item) => statusByFeature[item.feature]?.isVisible);

  const hiddenRoutesPatterns = [
    /^\/transactions(\/.*)?$/,
    /^\/groups\/[^\/]+\/transactions(\/.*)?$/,
  ];

  const shouldHideTabBar = hiddenRoutesPatterns.some((pattern) => pattern.test(pathname));

  const releaseTabNavigationLock = useCallback(() => {
    tabNavigationLockRef.current = false;
    if (tabNavigationLockTimerRef.current) {
      clearTimeout(tabNavigationLockTimerRef.current);
      tabNavigationLockTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    releaseTabNavigationLock();
  }, [releaseTabNavigationLock, state.index]);

  useEffect(
    () => () => {
      if (tabNavigationLockTimerRef.current) clearTimeout(tabNavigationLockTimerRef.current);
    },
    [],
  );

  const handleTabPress = useCallback(
    (item: TabItem, isFocused: boolean) => {
      const route = state.routes.find((candidate) => candidate.name === item.name);
      if (!route) return;

      if (tabNavigationLockRef.current) {
        return;
      }

      tabNavigationLockRef.current = true;
      tabNavigationLockTimerRef.current = setTimeout(
        releaseTabNavigationLock,
        TAB_NAVIGATION_LOCK_DURATION_MS,
      );

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }

      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not available
      }
    },
    [navigation, releaseTabNavigationLock, state.routes],
  );

  if (shouldHideTabBar) {
    return null;
  }

  // Exact Luminous Frosted Glass Transparency Layer
  const tintOverlay = isDarkMode ? 'rgba(22, 27, 34, 0.74)' : 'rgba(255, 255, 255, 0.75)';
  const capsuleBorder = isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      backgroundColor="transparent"
      pointerEvents="box-none">
      {/* Background Soft Gradient Scrim */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          isDarkMode ? 'rgba(16, 12, 8, 0.65)' : 'rgba(251, 252, 250, 0.72)',
          isDarkMode ? '#100C08' : '#fbfcfa',
        ]}
        locations={[0, 0.45, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: -24,
          bottom: 0,
        }}
        pointerEvents="none"
      />

      {/* Floating Island Curved Rectangle matching HomeScreen cards width */}
      <YStack
        paddingBottom={Math.max(insets.bottom, 12)}
        paddingHorizontal="$4"
        backgroundColor="transparent">
        <YStack
          borderRadius={22}
          width="100%"
          height={90}
          shadowColor={isDarkMode ? '#000000' : '#0F172A'}
          shadowOffset={{width: 0, height: 8}}
          shadowOpacity={isDarkMode ? 0.55 : 0.08}
          shadowRadius={20}
          elevation={18}
          backgroundColor="transparent">
          {/* Inner Clipped Glass Container */}
          <YStack
            borderRadius={22}
            overflow="hidden"
            borderWidth={1.5}
            borderColor={capsuleBorder}
            height={90}
            position="relative">
            {/* Native Hardware Blur Layer */}
            <BlurView
              intensity={Platform.OS === 'android' ? 70 : 90}
              tint={isDarkMode ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            {/* Translucent Tint Wash Layer */}
            <YStack
              style={StyleSheet.absoluteFill}
              backgroundColor={tintOverlay}
              pointerEvents="none"
            />

            {/* Tab Buttons Row */}
            <XStack
              flex={1}
              paddingVertical="$3"
              paddingHorizontal="$3"
              alignItems="center"
              justifyContent="space-around">
              {visibleTabItems.map((item) => {
                const activeRoute = state.routes[state.index];
                const isFocused = activeRoute?.name === item.name;
                return (
                  <TabButton
                    key={item.name}
                    item={item}
                    isFocused={isFocused}
                    isDarkMode={isDarkMode}
                    onPress={handleTabPress}
                  />
                );
              })}
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
