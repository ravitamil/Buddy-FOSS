import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScreenContainer} from '@/components/ui';
import {colorToken} from '@/utils/themeColors';

interface AddGroupTransactionEmptyStateProps {
  onBack: () => void;
}

export const AddGroupTransactionEmptyState = ({onBack}: AddGroupTransactionEmptyStateProps) => (
  <ScreenContainer dotSize={2} dotSpacing={18}>
    <VStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
      <Text fontSize={64}>?</Text>
      <Text variant="h3" color="$text" weight="bold" textAlign="center" marginBottom="$4">
        Group not found
      </Text>
      <HStack
        accessibilityRole="button"
        onPress={onBack}
        pressStyle={{opacity: 0.8}}
        backgroundColor={colorToken('green5')}
        paddingHorizontal="$6"
        paddingVertical="$3"
        borderRadius="$3"
        alignItems="center"
        gap="$2">
        <Ionicons name="arrow-back" size={20} color={colorToken('white')} />
        <Text color="$white" weight="semibold">
          Go Back
        </Text>
      </HStack>
    </VStack>
  </ScreenContainer>
);
