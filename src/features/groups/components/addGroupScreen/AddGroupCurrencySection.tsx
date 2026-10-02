import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {styled} from 'tamagui';

interface AddGroupCurrencySectionProps {
  selectedCurrency: string;
  onPressCurrency: () => void;
}

export const AddGroupCurrencySection: React.FC<AddGroupCurrencySectionProps> = ({
  selectedCurrency,
  onPressCurrency,
}) => (
  <HStack
    accessibilityRole="button"
    accessibilityLabel="Change group currency"
    onPress={onPressCurrency}
    pressStyle={{opacity: 0.8, scale: 0.99}}
    minHeight={48}
    alignItems="center"
    justifyContent="space-between"
    gap="$3">
    <HStack alignItems="center" gap="$3" flex={1}>
      <HStack
        width={38}
        height={38}
        borderRadius="$4"
        backgroundColor="$surfacePress"
        justifyContent="center"
        alignItems="center">
        <ThemedIonicon name="cash-outline" size={19} color="$green10" />
      </HStack>
      <VStack gap="$0.5" flex={1}>
        <Text variant="body1" color="$text" weight="semibold">
          Currency
        </Text>
        <Text variant="caption" color="$textSecondary">
          Balances and settlements
        </Text>
      </VStack>
    </HStack>
    <HStack alignItems="center" gap="$2">
      <HStack
        backgroundColor="$surfacePress"
        paddingHorizontal="$2.5"
        paddingVertical="$1"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$borderColor">
        <Text color="$text" weight="bold" fontSize={14}>
          {selectedCurrency}
        </Text>
      </HStack>
      <ThemedIonicon name="chevron-forward" size={16} color="$textTertiary" />
    </HStack>
  </HStack>
);

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
