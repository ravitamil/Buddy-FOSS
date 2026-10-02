import {EmptyState, GlassSurface} from '@ravitamil/buddy-ui';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';

export interface GroupEmptyStateProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  secondaryCtaLabel?: string;
  onSecondaryCtaPress?: () => void;
}

export const GroupEmptyState: React.FC<GroupEmptyStateProps> = ({
  iconName,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
}) => {
  return (
    <GlassSurface padding="$4" borderRadius="$4">
      <EmptyState
        icon={iconName}
        iconColor="#4ECDC4"
        iconAccessibilityLabel={ctaLabel || title}
        onIconPress={onCtaPress}
        title={title}
        description={subtitle}
      />
    </GlassSurface>
  );
};
