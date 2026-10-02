import {createAlphaColor} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useCallback, useMemo, useRef} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, YStack} from 'tamagui';

import {CustomNavigationHeader} from '@/components/ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface GroupsScreenHeaderProps {
  groupCount: number;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  scrollY?: SharedValue<number>;
}

export const GroupsScreenHeader: React.FC<GroupsScreenHeaderProps> = ({
  groupCount,
  isSearchOpen,
  onOpenSearch,
  onCloseSearch,
  scrollY,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const insets = useSafeAreaInsets();
  const lastPressRef = useRef(0);

  const themeBg = isDarkMode ? '#0A0B0E' : '#FFFFFF';

  const scrimColors = useMemo(
    () =>
      [
        themeBg,
        createAlphaColor(themeBg, 0.96),
        createAlphaColor(themeBg, 0.8),
        createAlphaColor(themeBg, 0),
      ] as const,
    [themeBg],
  );

  const headerBackgroundStyle = useAnimatedStyle(() => {
    if (!scrollY) return {opacity: 0};
    const opacity = interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP);
    return {opacity};
  });

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current < 300) {
      return;
    }
    lastPressRef.current = now;
    if (isSearchOpen) {
      onCloseSearch();
    } else {
      onOpenSearch();
    }
  }, [isSearchOpen, onCloseSearch, onOpenSearch]);

  const handlePressIn = useCallback(() => {
    if (isSearchOpen) {
      lastPressRef.current = Date.now();
      onCloseSearch();
    }
  }, [isSearchOpen, onCloseSearch]);

  const searchButton =
    groupCount > 0 ? (
      <View
        accessibilityRole="button"
        accessibilityLabel={isSearchOpen ? 'Close search' : 'Search groups'}
        onPress={handlePress}
        onPressIn={handlePressIn}
        pressStyle={{opacity: 0.8, scale: 0.96}}
        width={48}
        height={48}
        borderRadius="$10"
        backgroundColor={isSearchOpen ? '$error' : '$homeAnalyseAction'}
        borderWidth={1}
        borderColor={isSearchOpen ? '$error' : '$primaryPress'}
        shadowColor="$shadowColor"
        shadowOffset={{width: 0, height: 2}}
        shadowOpacity={0.2}
        shadowRadius={4}
        alignItems="center"
        justifyContent="center">
        <Ionicons
          name={isSearchOpen ? 'close' : 'search'}
          size={22}
          color={isSearchOpen ? '$semanticOnColor' : '$buttonPrimaryText'}
        />
      </View>
    ) : null;

  const scrimHeight = Math.max(20, insets.top) + 80 + 36;

  return (
    <YStack position="relative" zIndex={10}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: scrimHeight,
            zIndex: 1,
          },
          headerBackgroundStyle,
        ]}>
        <LinearGradient
          colors={scrimColors}
          locations={[0, 0.55, 0.82, 1]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <YStack zIndex={2} paddingTop="$4">
        <CustomNavigationHeader
          title="Your Groups"
          subtitle="Manage your groups and expenses"
          showBackButton={false}
          alignStaticTitleWithContent
          rightElement={searchButton}
        />
      </YStack>
    </YStack>
  );
};
