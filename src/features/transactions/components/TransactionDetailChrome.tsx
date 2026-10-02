import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {View} from 'tamagui';

import {GlassSurface, type GlassSurfaceProps} from '@ravitamil/buddy-ui';

interface TransactionDetailGlassCardProps {
  children: React.ReactNode;
  style?: GlassSurfaceProps['style'];
  padding?: number;
}

interface TransactionDetailActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  isDarkMode: boolean;
  backgroundColor?: string;
  onPress: () => void;
}

interface TransactionOverviewHeaderProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  amount: React.ReactNode;
  amountColor: string;
  dateLabel: string;
}

export function TransactionDetailGlassCard({
  children,
  style,
  padding = 16,
}: TransactionDetailGlassCardProps) {
  return (
    <GlassSurface padding={padding} borderRadius={16} style={[{marginBottom: 12}, style]}>
      {children}
    </GlassSurface>
  );
}

export function TransactionDetailActionButton({
  icon,
  label,
  color,
  isDarkMode,
  backgroundColor,
  onPress,
}: TransactionDetailActionButtonProps) {
  return (
    <View
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{opacity: 0.8}}
      padding={16}
      borderRadius={12}
      backgroundColor={backgroundColor ?? (isDarkMode ? `${color}33` : `${color}1A`)}
      borderWidth={1}
      borderColor={color}>
      <HStack alignItems="center" justifyContent="center" gap="$2">
        <Ionicons name={icon} size={20} color={color} />
        <Text color={color} variant="body1" weight="semibold">
          {label}
        </Text>
      </HStack>
    </View>
  );
}

export function TransactionOverviewHeader({
  iconName,
  iconColor,
  title,
  subtitle,
  amount,
  amountColor,
  dateLabel,
}: TransactionOverviewHeaderProps) {
  const safeColor = iconColor && iconColor.startsWith('#') ? iconColor : '#4CAF50';
  const gradientEnd = safeColor.length === 7 ? `${safeColor}CC` : safeColor;

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <HStack alignItems="center" gap="$3" flex={1}>
        <LinearGradient
          colors={[safeColor, gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: iconColor,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
          }}>
          <Ionicons name={iconName} size={28} color="white" />
        </LinearGradient>

        <VStack flex={1}>
          <Text variant="h4" color="$text" weight="bold">
            {title}
          </Text>
          {subtitle}
        </VStack>
      </HStack>

      <VStack alignItems="flex-end">
        <Text variant="h3" color={amountColor} weight="bold">
          {amount}
        </Text>
        <Text variant="caption" color="$textSecondary">
          {dateLabel}
        </Text>
      </VStack>
    </HStack>
  );
}
