import {EmptyState, GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';

type EmptyStateIcon = 'group' | 'transaction';

interface HomeEmptyStateCardProps {
  type: EmptyStateIcon;
  title: string;
  description: string;
  onPress: () => void;
}

export const HomeEmptyStateCard = ({
  type,
  title,
  description,
  onPress,
}: HomeEmptyStateCardProps) => (
  <GlassSurface padding="$4" borderRadius="$4">
    <EmptyState
      icon={type === 'group' ? 'people' : 'receipt-outline'}
      iconColor="#4ECDC4"
      iconAccessibilityLabel={type === 'group' ? 'Create group' : 'Add transaction'}
      onIconPress={onPress}
      title={title}
      description={description}
    />
  </GlassSurface>
);
