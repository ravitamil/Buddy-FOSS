import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

export interface AddEditBudgetCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  rightElement?: React.ReactNode;
}

/** Budget form layout card composed from the canonical glass surface. */
export function AddEditBudgetCard({
  children,
  title,
  subtitle,
  style,
  onPress,
  accentColor = '#10B981',
  icon,
  rightElement,
}: AddEditBudgetCardProps) {
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
            <HStack alignItems="flex-start" justifyContent="space-between" gap="$2">
              <HStack alignItems="flex-start" gap="$2.5" flex={1}>
                {icon ? (
                  <VStack paddingTop="$0.5">
                    <Ionicons name={icon} size={20} color={accentColor} />
                  </VStack>
                ) : null}
                <VStack flex={1} gap="$1">
                  <Text variant="h5" color="$text" weight="bold">
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text variant="body2" color="$textSecondary" lineHeight={18}>
                      {subtitle}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
              {rightElement}
            </HStack>
          ) : null}
          {children}
        </VStack>
      </GlassSurface>
    </VStack>
  );
}
