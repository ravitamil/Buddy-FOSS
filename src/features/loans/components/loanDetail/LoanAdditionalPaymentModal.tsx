import {Button, HStack, Input, Text, VStack} from '@ravitamil/buddy-ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {AdditionalPaymentState} from '../../hooks/useLoanDetailScreen';
import {LoanGlassCard} from '../LoanGlassCard';
import {LoanModalShell} from './LoanDetailModalPrimitives';

interface LoanAdditionalPaymentModalProps {
  state: AdditionalPaymentState;
  onAmountChange: (amount: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function LoanAdditionalPaymentModal({
  state,
  onAmountChange,
  onCancel,
  onSubmit,
}: LoanAdditionalPaymentModalProps) {
  const {isDarkMode} = useTamaguiTheme();
  if (!state.visible) return null;

  return (
    <LoanModalShell zIndex={2100} opacity={0.65}>
      <LoanGlassCard style={{width: '88%', maxWidth: 400}} contentStyle={{padding: 20}}>
        <VStack gap="$4">
          <VStack gap="$1">
            <Text variant="h4" color="$text" weight="bold">
              Additional Payment
            </Text>
            <Text variant="body2" color="$textSecondary">
              Enter the extra amount you paid.
            </Text>
          </VStack>
          <Input
            value={state.amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder="Amount"
            variant="outline"
            error={state.error ?? undefined}
          />
          {state.error && (
            <Text variant="caption" color="$red10">
              {state.error}
            </Text>
          )}
          <HStack gap="$3">
            <Button flex={1} variant="outline" onPress={onCancel}>
              Cancel
            </Button>
            <Button
              flex={1}
              backgroundColor={isDarkMode ? '$green8' : '$green9'}
              onPress={onSubmit}>
              <Text color="white" weight="semibold">
                Save
              </Text>
            </Button>
          </HStack>
        </VStack>
      </LoanGlassCard>
    </LoanModalShell>
  );
}
