import {IconAction, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {ScreenContainer} from '@/components/ui';

interface GroupDetailMissingStateProps {
  onBack: () => void;
}

export const GroupDetailMissingState: React.FC<GroupDetailMissingStateProps> = ({onBack}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
    <VStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
      <Text fontSize={64}>?</Text>
      <Text variant="h3" color="$text" weight="bold" textAlign="center">
        Group not found
      </Text>
      <IconAction icon="arrow-back" label="Go Back" onPress={onBack} tone="neutral" size="medium" />
    </VStack>
  </ScreenContainer>
);
