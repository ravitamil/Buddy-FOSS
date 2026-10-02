import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AnalyticsGlassCardProps {
  title: string;
  children: React.ReactNode;
  icon?: IoniconName;
  iconColor?: string;
  action?: () => void;
}

export const AnalyticsGlassCard = ({
  title,
  children,
  icon,
  iconColor = '#4ECDC4',
  action,
}: AnalyticsGlassCardProps) => {
  return (
    <GlassSurface borderRadius={16} padding={16} style={{marginBottom: 16}}>
      <VStack gap="$3">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            {icon && <Ionicons name={icon} size={20} color={iconColor} />}
            <Text variant="h5" color="$text" weight="bold">
              {title}
            </Text>
          </HStack>
          {action && (
            <HStack
              accessibilityRole="button"
              accessibilityLabel={`Open ${title}`}
              onPress={action}
              pressStyle={{opacity: 0.7}}
              padding="$2">
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </HStack>
          )}
        </HStack>
        {children}
      </VStack>
    </GlassSurface>
  );
};
