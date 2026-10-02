import {useBuddyColors} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

export interface AddEditLoanCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

/** Loan form layout composed from the canonical app surface. */
export function AddEditLoanCard({
  children,
  title,
  subtitle,
  style,
  onPress,
  accentColor,
  icon,
}: AddEditLoanCardProps) {
  const colors = useBuddyColors();
  return (
    <VStack
      width="100%"
      style={style}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      onPress={onPress}
      pressStyle={onPress ? {opacity: 0.9, scale: 0.98} : undefined}>
      <GlassSurface>
        <VStack gap="$4">
          {title ? (
            <HStack alignItems="flex-start" gap="$2">
              {icon ? (
                <Ionicons name={icon} size={20} color={accentColor ?? colors.iconBrand} />
              ) : null}
              <VStack flex={1} gap="$1">
                <Text variant="h5" color="$text" weight="bold">
                  {title}
                </Text>
                {subtitle ? (
                  <Text variant="body2" color="$textSecondary">
                    {subtitle}
                  </Text>
                ) : null}
              </VStack>
            </HStack>
          ) : null}
          {children}
        </VStack>
      </GlassSurface>
    </VStack>
  );
}
