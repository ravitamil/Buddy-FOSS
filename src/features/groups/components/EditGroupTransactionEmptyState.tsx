import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScreenContainer, ScreenWrapper} from '@/components/ui';
import {colorToken} from '@/utils/themeColors';

interface EditGroupTransactionEmptyStateProps {
  icon: string;
  title: string;
  onBack: () => void;
}

export const EditGroupTransactionEmptyState = ({
  icon,
  title,
  onBack,
}: EditGroupTransactionEmptyStateProps) => (
  <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
    <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false}>
      <VStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <Text fontSize={64}>{icon}</Text>
        <Text variant="h3" color="$text" weight="bold" textAlign="center" marginBottom="$4">
          {title}
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
    </ScreenWrapper>
  </ScreenContainer>
);
