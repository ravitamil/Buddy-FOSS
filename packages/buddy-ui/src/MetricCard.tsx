import React from 'react';
import {Progress, XStack, YStack, styled} from 'tamagui';

import {Card} from './Card';
import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export type MetricCardTone = 'neutral' | 'positive' | 'negative' | 'info';
export type MetricCardDensity = 'compact' | 'regular';

export interface MetricCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: MetricCardTone;
  trend?: string;
  trendColor?: string;
  progress?: number;
  progressLabel?: string;
  density?: MetricCardDensity;
  onPress?: () => void;
}

const toneColors: Record<MetricCardTone, string> = {
  neutral: '$primary',
  positive: '$success',
  negative: '$error',
  info: '$info',
};

export function MetricCard({
  title,
  value,
  icon,
  tone = 'neutral',
  trend,
  trendColor,
  progress,
  progressLabel,
  density = 'compact',
  onPress,
}: MetricCardProps) {
  const color = toneColors[tone];
  const resolvedTrendColor = trendColor ?? color;

  return (
    <MetricFrame
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      height={density === 'compact' ? 120 : undefined}
      minHeight={density === 'regular' ? 144 : undefined}
      padding={density === 'compact' ? '$3' : '$4'}>
      <AccentBar backgroundColor={color} />
      <BackdropIcon name={icon} size={80} color={color} />
      <YStack gap="$2" zIndex={2} position="relative">
        <Text color="$text" variant="body1" weight="semibold" numberOfLines={2}>
          {title}
        </Text>
        <Text color="$text" weight="bold" variant="h4" numberOfLines={1}>
          {value}
        </Text>
        {trend ? (
          <XStack alignItems="center" gap="$1">
            <Text color={resolvedTrendColor} variant="label" weight="medium" fontSize="$1">
              {trend}
            </Text>
          </XStack>
        ) : null}
        {progress !== undefined ? (
          <YStack gap="$1">
            {progressLabel ? (
              <Text color="$textSecondary" variant="caption">
                {progressLabel}
              </Text>
            ) : null}
            <Progress value={Math.max(0, Math.min(progress, 100))} height={4}>
              <Progress.Indicator backgroundColor={color} />
            </Progress>
          </YStack>
        ) : null}
      </YStack>
    </MetricFrame>
  );
}

const MetricFrame = styled(Card, {
  name: 'BuddyMetricCard',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative',
});

const AccentBar = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 3,
});

const BackdropIcon = styled(
  Ionicons,
  {position: 'absolute', top: 20, right: 8, opacity: 0.08, zIndex: 0} as const,
  {accept: {color: 'color'} as const},
);
