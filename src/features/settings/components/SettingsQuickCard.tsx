/* eslint-disable development-quality/enforce-tamagui-usage -- Animated icon tile requires Reanimated components for 60fps native performance */
import {GlassSurface, IconTile, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {YStack, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {SunIcon, MoonStarIcon} from '@/components/ui/DayNightThemeSwitch';

interface SettingsQuickCardProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  symbol?: string;
  isDarkMode: boolean;
  onPress: () => void;
  accentColors?: [string, string];
  isThemeCard?: boolean;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
};

const THEME_COLORS = {
  light: '#F59E0B',
  dark: '#2563EB',
};

const styles = StyleSheet.create({
  animatedTile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function AnimatedThemeIconTile({isDarkMode}: {isDarkMode: boolean}) {
  const progress = useSharedValue(isDarkMode ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDarkMode ? 1 : 0, SPRING_CONFIG);
  }, [isDarkMode, progress]);

  const tileAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [THEME_COLORS.light, THEME_COLORS.dark],
    );

    return {backgroundColor};
  });

  const sunAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0, 0.45], [1, 0.2], Extrapolation.CLAMP);
    const rotate = `${interpolate(progress.value, [0, 0.45], [0, 90], Extrapolation.CLAMP)}deg`;

    return {
      opacity,
      transform: [{scale}, {rotate}],
    };
  });

  const moonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0.55, 1], [0.2, 1], Extrapolation.CLAMP);
    const rotate = `${interpolate(progress.value, [0.55, 1], [-90, 0], Extrapolation.CLAMP)}deg`;

    return {
      opacity,
      transform: [{scale}, {rotate}],
    };
  });

  return (
    <Animated.View style={[styles.animatedTile, tileAnimatedStyle]}>
      <Animated.View style={[styles.iconWrapper, sunAnimatedStyle]}>
        <SunIcon size={22} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.iconWrapper, moonAnimatedStyle]}>
        <MoonStarIcon size={22} color="#FFFFFF" />
      </Animated.View>
    </Animated.View>
  );
}

const SettingsQuickCardPressable = styled(YStack, {
  name: 'SettingsQuickCardPressable',
  padding: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
  flex: 1,
  width: '100%',
  height: 120,
  alignSelf: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'center',
  zIndex: 1000,
  pressStyle: {
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
});

export function SettingsQuickCard({
  label,
  icon,
  symbol,
  isDarkMode,
  onPress,
  accentColors,
  isThemeCard,
}: SettingsQuickCardProps) {
  const isTheme = isThemeCard ?? (icon === 'sunny' || icon === 'moon');
  const iconColor = accentColors?.[0] ?? (isDarkMode ? '#2563EB' : '#F59E0B');

  const iconElement = symbol ? (
    <Text fontSize="$5" color="$white" weight="bold">
      {symbol}
    </Text>
  ) : (
    <Ionicons name={icon ?? 'settings'} size={22} color="#FFFFFF" />
  );

  return (
    <SettingsQuickCardPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <GlassSurface
        testID="settings-quick-card-surface"
        height={120}
        padding={16}
        borderRadius={20}
        fill
        style={{width: '100%', flex: 1}}
        contentStyle={{flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
        <VStack flex={1} width="100%" alignItems="center" justifyContent="center" gap="$2.5">
          {isTheme ? (
            <AnimatedThemeIconTile isDarkMode={isDarkMode} />
          ) : (
            <IconTile icon={iconElement} color={iconColor} size={44} />
          )}
          <Text
            variant="body2"
            color="$text"
            opacity={0.9}
            weight="semibold"
            textAlign="center"
            numberOfLines={1}>
            {label}
          </Text>
        </VStack>
      </GlassSurface>
    </SettingsQuickCardPressable>
  );
}
