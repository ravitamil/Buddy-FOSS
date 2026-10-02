import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

interface HomeScrollTopButtonProps {
  onPress: () => void;
}

export const HomeScrollTopButton = ({onPress}: HomeScrollTopButtonProps) => (
  <VStack alignItems="center" marginTop="$3" marginBottom="$4">
    <HStack
      accessibilityRole="button"
      accessibilityLabel="Back to top"
      onPress={onPress}
      pressStyle={{opacity: 0.8}}
      width={56}
      height={56}
      borderRadius="$10"
      backgroundColor="$homeAnalyseAction"
      justifyContent="center"
      alignItems="center"
      shadowColor="$shadowColor"
      shadowOffset={{width: 0, height: 2}}
      shadowOpacity={0.25}
      shadowRadius={4}
      elevation={8}>
      <Ionicons name="arrow-up" size={24} color="$buttonPrimaryText" />
    </HStack>
    <Text variant="caption" color="$textSecondary" marginTop="$2">
      Back to top
    </Text>
  </VStack>
);
