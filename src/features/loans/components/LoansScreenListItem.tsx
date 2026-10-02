import {
  Badge,
  Button,
  GlassSurface,
  HStack,
  IconTile,
  Text,
  VStack,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {memo, useMemo, type ComponentProps, type FC} from 'react';
import {View, XStack, useTheme} from 'tamagui';

import type {EnhancedLoan} from '@/context/LoanContext.query';
import {
  calculateCompletedTenure,
  calculateLoanMetrics,
  getSimplifiedInstallmentStatus,
} from '@/features/loans/calculations';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface LoansScreenListItemProps {
  loan: EnhancedLoan;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
  handleViewLoan: (loanId: string) => void;
  handleQuickLoanAction: (loanId: string, action: 'pay' | 'view') => void;
}

export const LoansScreenListItem: FC<LoansScreenListItemProps> = memo(
  ({loan, formatCurrency, handleViewLoan, handleQuickLoanAction}) => {
    const theme = useTheme();
    const loanMetrics = useMemo(() => calculateLoanMetrics(loan), [loan]);
    const nextEMIDate = new Date(loan.nextEmiDate);
    const isValidDate = !isNaN(nextEMIDate.getTime());
    const daysUntilEMI = isValidDate
      ? Math.ceil((nextEMIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const currentInstallmentNumber = useMemo(
      () => Math.max(1, calculateCompletedTenure(loan.startDate) + 1),
      [loan.startDate],
    );
    const currentInstallmentStatus = useMemo(
      () =>
        getSimplifiedInstallmentStatus(
          currentInstallmentNumber,
          loan.paymentHistory || [],
          loan.startDate,
          loan.tenure,
          loan.paymentFrequency || 'MONTHLY',
        ),
      [
        currentInstallmentNumber,
        loan.paymentHistory,
        loan.startDate,
        loan.tenure,
        loan.paymentFrequency,
      ],
    );

    const isEMIDueSoon = isValidDate && daysUntilEMI >= 0 && daysUntilEMI <= 3;
    const showCurrentEMI = currentInstallmentStatus === 'current';

    const resolvedColor = useMemo(() => {
      if (
        !loan.color ||
        loan.color === '#000000' ||
        loan.color.toLowerCase() === '#1f2937' ||
        loan.color.toLowerCase() === '#111827'
      ) {
        return resolveThemeColor(theme, 'primary', '#f59e0b');
      }
      return loan.color;
    }, [loan.color, theme]);

    const statusTone =
      loan.status === 'ACTIVE' ? 'success' : loan.status === 'CLOSED' ? 'neutral' : 'error';

    return (
      <View
        key={loan.id}
        accessibilityRole="button"
        accessibilityLabel={`View ${loan.name} loan`}
        onPress={() => handleViewLoan(loan.id)}
        pressStyle={{opacity: 0.9}}>
        <GlassSurface padding={18} borderRadius={20} style={{marginBottom: 12}}>
          <VStack gap="$3.5">
            {/* Header */}
            <HStack alignItems="center" justifyContent="space-between" gap="$3">
              <HStack alignItems="center" gap="$3" flex={1}>
                <IconTile
                  icon={(loan.icon as IoniconName) || 'card-outline'}
                  color={resolvedColor}
                  tone="soft"
                  size={44}
                  iconSize={22}
                  shape="rounded"
                />
                <VStack flex={1} gap="$0.5">
                  <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                    {loan.name}
                  </Text>
                  <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                    {loan.lenderName || 'Personal Loan'}
                  </Text>
                </VStack>
              </HStack>

              <HStack alignItems="center" gap="$2">
                <Badge label={loan.status} tone={statusTone} />
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
                />
              </HStack>
            </HStack>

            {/* EMI & Action row */}
            <HStack
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="$3.5"
              paddingVertical="$3"
              borderRadius={14}
              backgroundColor="$surfaceHover"
              borderWidth={1}
              borderColor="$borderColor">
              <VStack flex={1} gap="$1">
                <Text
                  variant="caption"
                  color="$textSecondary"
                  weight="semibold"
                  style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                  Monthly EMI
                </Text>
                <Text variant="h4" color="$text" weight="bold">
                  {formatCurrency(loan.emiAmount || 0)}
                </Text>
                <XStack alignItems="center" gap="$1" marginTop={2}>
                  {showCurrentEMI || isEMIDueSoon ? (
                    <>
                      <Ionicons
                        name="time"
                        size={13}
                        color={resolveThemeColor(theme, 'warning', '#f59e0b')}
                      />
                      <Text variant="caption" color="$warning" weight="semibold">
                        {isEMIDueSoon ? `Due in ${daysUntilEMI} days` : 'Current installment'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
                      />
                      <Text variant="caption" color="$textSecondary">
                        {isValidDate
                          ? `Next: ${nextEMIDate.toLocaleDateString()}`
                          : `${loanMetrics.remainingTenure} EMIs left`}
                      </Text>
                    </>
                  )}
                </XStack>
              </VStack>

              {loanMetrics.remainingAmount > 0 && loan.status === 'ACTIVE' && (
                <Button
                  variant="primary"
                  size="small"
                  onPress={() => handleQuickLoanAction(loan.id, 'pay')}
                  accessibilityLabel={`Pay EMI for ${loan.name}`}
                  leftIcon={<Ionicons name="card-outline" size={16} color="white" />}>
                  Pay EMI
                </Button>
              )}
            </HStack>

            {/* Progress section */}
            <VStack gap="$2">
              <HStack alignItems="center" justifyContent="space-between">
                <Text variant="caption" color="$textSecondary" weight="medium">
                  {formatCurrency(loanMetrics.paidAmount)} paid of{' '}
                  {formatCurrency(loanMetrics.totalAmount)}
                </Text>
                <Text variant="caption" color="$text" weight="bold">
                  {loanMetrics.progressPercentage.toFixed(0)}%
                </Text>
              </HStack>

              <View height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
                <View
                  width={`${Math.min(loanMetrics.progressPercentage, 100)}%`}
                  height="100%"
                  backgroundColor={resolvedColor}
                  borderRadius={4}
                />
              </View>

              <HStack alignItems="center" justifyContent="space-between">
                <Text variant="caption" color="$textSecondary">
                  {loanMetrics.completedTenure} of {loan.tenure} months
                </Text>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  {formatCurrency(loanMetrics.remainingAmount)} remaining
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </GlassSurface>
      </View>
    );
  },
);
