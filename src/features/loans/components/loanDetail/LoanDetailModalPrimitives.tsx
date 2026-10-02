import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import type {ComponentProps, ReactNode} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type FormatCurrency = (amount: number) => string;

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export function useLoanModalColors() {
  const theme = useTheme();
  return {
    blue: tokenColor(theme.blue9?.val, '#3B82F6'),
    green: tokenColor(theme.green9?.val, '#10B981'),
    orange: tokenColor(theme.orange9?.val, '#F59E0B'),
    red: tokenColor(theme.red9?.val, '#EF4444'),
  };
}

export function LoanDetailModalRow({
  icon,
  label,
  value,
}: {
  icon: IoniconName;
  label: string;
  value: string;
}) {
  const colors = useLoanModalColors();
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack alignItems="center" gap="$2">
        <Ionicons name={icon} size={16} color={colors.blue} />
        <Text variant="body2" color="$textSecondary" weight="medium">
          {label}
        </Text>
      </HStack>
      <Text variant="body2" color="$text" weight="semibold">
        {value}
      </Text>
    </HStack>
  );
}

export function LoanModalShell({
  children,
  zIndex,
  opacity,
}: {
  children: ReactNode;
  zIndex: number;
  opacity: number;
}) {
  return (
    <VStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor={`rgba(0, 0, 0, ${opacity})`}
      justifyContent="center"
      alignItems="center"
      zIndex={zIndex}>
      {children}
    </VStack>
  );
}
