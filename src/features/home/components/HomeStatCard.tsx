import React, {useEffect, useRef} from 'react';
import {Animated, Platform, TouchableOpacity} from 'react-native';
import * as Haptics from 'expo-haptics';
import {XStack, YStack} from 'tamagui';

import {GlassSurface, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Text} from '@ravitamil/buddy-ui';

import type {HomeStatTrend, HomeStatType} from '../types';

interface HomeStatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  percentage: string;
  percentageColor?: string;
  percentageIcon?: keyof typeof Ionicons.glyphMap;
  trend?: HomeStatTrend;
  type: HomeStatType;
  onPress: () => void;
  onDoublePress?: () => void;
}

/**
 * This keeps the pre-consolidation Home financial-tile visual contract: the neutral glass frame,
 * colour-specific glow, centered background icon, and compact monthly-trend treatment.
 */
export function HomeStatCard({
  title,
  value,
  icon,
  percentage,
  percentageColor,
  percentageIcon,
  trend,
  type,
  onPress,
  onDoublePress,
}: HomeStatCardProps) {
  const colors = useBuddyColors();
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const iconColor = colors[type === 'investment' ? 'savings' : type];

  const successColor = colors.success;
  const errorColor = colors.error;
  const neutralColor = colors.textSecondary;

  const resolvedColor =
    trend === 'positive'
      ? successColor
      : trend === 'negative'
        ? errorColor
        : trend === 'neutral'
          ? neutralColor
          : (percentageColor ?? neutralColor);

  const resolvedIcon: keyof typeof Ionicons.glyphMap =
    percentageIcon ??
    (percentage.startsWith('+')
      ? 'arrow-up'
      : percentage.startsWith('-')
        ? 'arrow-down'
        : 'remove');

  const lastPressTimeRef = useRef<number>(0);
  const singlePressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (singlePressTimerRef.current) {
        clearTimeout(singlePressTimerRef.current);
      }
    };
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.98,
      useNativeDriver: false,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = () => {
    if (!onDoublePress) {
      onPress();
      return;
    }

    const now = Date.now();
    const timeDelta = now - lastPressTimeRef.current;
    lastPressTimeRef.current = now;

    if (timeDelta < 280) {
      if (singlePressTimerRef.current) {
        clearTimeout(singlePressTimerRef.current);
        singlePressTimerRef.current = null;
      }
      try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch {}
      onDoublePress();
    } else {
      singlePressTimerRef.current = setTimeout(() => {
        singlePressTimerRef.current = null;
        onPress();
      }, 280);
    }
  };

  return (
    <Animated.View style={[homeStatCardContainerStyle, {transform: [{scale: scaleAnimation}]}]}>
      <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${value}, ${percentage} this month`}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={homeStatCardContainerStyle}>
        <GlassSurface
          testID="home-stat-card-gradient"
          washColor={iconColor}
          backgroundAdornment={
            <Ionicons name={icon} size={64} color={iconColor} style={backdropIconStyle} />
          }
          height={120}
          padding={12}
          borderRadius={16}
          style={homeStatCardContainerStyle}>
          <YStack gap="$2" zIndex={2} position="relative">
            <YStack gap="$0.5">
              <Text
                color="$text"
                variant="body1"
                weight="semibold"
                numberOfLines={2}
                textAlignVertical="top"
                lineHeight={18}
                minHeight={36}>
                {title}
              </Text>

              <Text color="$text" weight="bold" variant="h4" numberOfLines={1}>
                {value}
              </Text>

              <YStack gap="$0.5">
                <XStack alignItems="center" gap="$1">
                  <Ionicons
                    name={resolvedIcon}
                    size={12}
                    color={resolvedColor}
                    style={{opacity: 0.9}}
                  />
                  <Text color={resolvedColor} variant="label" weight="medium" fontSize="$1">
                    {percentage}
                  </Text>
                </XStack>
                <Text
                  color="$textSecondary"
                  variant="caption"
                  weight="medium"
                  fontSize="$1"
                  marginLeft="$3">
                  this month
                </Text>
              </YStack>
            </YStack>
          </YStack>
        </GlassSurface>
      </TouchableOpacity>
    </Animated.View>
  );
}

const homeStatCardContainerStyle = {
  flex: 1,
  minWidth: 0,
};

const backdropIconStyle = {opacity: 0.17};
