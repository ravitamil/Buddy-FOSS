import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {LoanModalShell, useLoanModalColors} from './LoanDetailModalPrimitives';

interface LoanDeleteConfirmationModalProps {
  visible: boolean;
  loanName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LoanDeleteConfirmationModal({
  visible,
  loanName,
  onCancel,
  onConfirm,
}: LoanDeleteConfirmationModalProps) {
  const colors = useLoanModalColors();
  if (!visible) return null;

  return (
    <LoanModalShell zIndex={1000} opacity={0.5}>
      <GlassSurface padding="$6" style={{width: '85%', maxWidth: 400}}>
        <VStack gap="$4" alignItems="center">
          <VStack
            width={60}
            height={60}
            borderRadius={30}
            backgroundColor="$red4"
            alignItems="center"
            justifyContent="center">
            <Ionicons name="warning" size={30} color={colors.red} />
          </VStack>
          <VStack gap="$2" alignItems="center">
            <Text variant="h4" color="$text" weight="bold" textAlign="center">
              Delete Loan
            </Text>
            <Text variant="body1" color="$textSecondary" textAlign="center">
              Are you sure you want to delete "{loanName}"? This action cannot be undone.
            </Text>
          </VStack>
          <HStack gap="$3" width="100%">
            <Button flex={1} variant="outline" onPress={onCancel}>
              Cancel
            </Button>
            <Button flex={1} backgroundColor={colors.red} onPress={onConfirm}>
              <Text variant="body2" color="white" weight="medium">
                Delete
              </Text>
            </Button>
          </HStack>
        </VStack>
      </GlassSurface>
    </LoanModalShell>
  );
}
