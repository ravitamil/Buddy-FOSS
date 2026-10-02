import {HStack, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

interface HomeSectionHeaderProps {
  title: string;
  linkIconColor?: string;
  isDarkMode?: boolean;
  onViewAll: () => void;
}

export const HomeSectionHeader = ({title, onViewAll}: HomeSectionHeaderProps) => {
  const primaryColor = useBuddyColors().iconBrand;
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text color="$text" weight="bold" variant="h5">
        {title}
      </Text>
      <HStack
        accessibilityRole="button"
        onPress={onViewAll}
        pressStyle={{opacity: 0.8}}
        alignItems="center"
        gap="$1">
        <Text color={primaryColor} variant="body1" weight="semibold">
          View All
        </Text>
        <Ionicons name="chevron-forward" size={16} color={primaryColor} />
      </HStack>
    </HStack>
  );
};
