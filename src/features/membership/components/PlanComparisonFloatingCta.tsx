import {HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

interface PlanComparisonFloatingCtaProps {
  bottomInset: number;
  isDarkMode: boolean;
  isPro: boolean;
  onPress: () => void;
}

export function PlanComparisonFloatingCta({
  bottomInset,
  isDarkMode,
  isPro,
  onPress,
}: PlanComparisonFloatingCtaProps) {
  return (
    <HStack
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{opacity: 0.8}}
      position="absolute"
      bottom={Math.max(bottomInset, 20) + 10}
      left="$6"
      right="$6"
      backgroundColor={isDarkMode ? '$blue10' : '$blue11'}
      paddingVertical="$4"
      borderRadius="$10"
      alignItems="center"
      justifyContent="center"
      gap="$2.5"
      shadowColor="$shadowColor"
      shadowOffset={{width: 0, height: 4}}
      shadowOpacity={0.25}
      shadowRadius={10}
      elevation={8}
      zIndex={1000}>
      <Ionicons name={isPro ? 'settings-outline' : 'diamond'} size={20} color="white" />
      <Text color="white" variant="body1" weight="bold">
        {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
      </Text>
    </HStack>
  );
}
