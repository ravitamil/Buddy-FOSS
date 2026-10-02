import React from 'react';
import {XStack, YStack, styled, useTheme} from 'tamagui';
import {Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {PaymentRecord} from '@/types/loan.types';
import {getSimplifiedInstallmentStatus} from '@/features/loans/calculations';

type InstallmentStatus = 'completed' | 'current' | 'upcoming' | 'overdue';

interface LoanHeatMapProps {
  totalInstallments: number;
  paymentHistory: PaymentRecord[];
  startDate: Date;
  paymentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  onInstallmentPress?: (installmentNumber: number) => void;
}

const HeatMapContainer = styled(XStack, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  paddingHorizontal: 16,
});

const InstallmentBox = styled(YStack, {
  name: 'LoanHeatMapInstallmentBox',
  width: 40,
  height: 40,
  minWidth: 40,
  minHeight: 40,
  padding: 0,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  backgroundColor: '$color3',
  pressStyle: {
    opacity: 0.7,
  },
  variants: {
    status: {
      completed: {
        backgroundColor: '$green9',
        borderColor: '$green10',
      },
      current: {
        backgroundColor: '$blue9',
        borderColor: '$blue10',
        shadowColor: '$blue9',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
      upcoming: {
        backgroundColor: '$color3',
        borderColor: '$borderColor',
      },
      overdue: {
        backgroundColor: '$red9',
        borderColor: '$red10',
      },
    },
  },
} as const);

const InstallmentText = styled(Text, {
  variant: 'caption',
  fontWeight: '600',
  variants: {
    status: {
      completed: {
        color: 'white',
      },
      current: {
        color: 'white',
      },
      upcoming: {
        color: '$color11',
      },
      overdue: {
        color: 'white',
      },
    },
  },
} as const);

const LegendContainer = styled(XStack, {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 16,
  paddingHorizontal: 16,
});

const LegendItem = styled(XStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const LegendBox = styled(YStack, {
  width: 16,
  height: 16,
  borderRadius: 4,
  borderWidth: 1,
  variants: {
    status: {
      completed: {
        backgroundColor: '$green9',
        borderColor: '$green10',
      },
      current: {
        backgroundColor: '$blue9',
        borderColor: '$blue10',
      },
      upcoming: {
        backgroundColor: '$color3',
        borderColor: '$borderColor',
      },
      overdue: {
        backgroundColor: '$red9',
        borderColor: '$red10',
      },
    },
  },
} as const);

const LegendText = styled(Text, {
  variant: 'caption',
  color: '$color11',
});

const SectionTitle = styled(Text, {
  variant: 'h6',
  fontWeight: '600',
  color: '$color',
  marginBottom: 12,
  paddingHorizontal: 16,
});

const StatsContainer = styled(XStack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  marginBottom: 16,
});

const StatItem = styled(YStack, {
  alignItems: 'center',
});

const StatValue = styled(Text, {
  variant: 'h5',
  fontWeight: 'bold',
  color: '$color',
});

const StatLabel = styled(Text, {
  variant: 'caption',
  color: '$color11',
  marginTop: 4,
});

const getInstallmentTextColor = (status: InstallmentStatus) => {
  if (status === 'completed' || status === 'current' || status === 'overdue') {
    return '$white';
  }

  return '$color11';
};

export const LoanHeatMap: React.FC<LoanHeatMapProps> = ({
  totalInstallments,
  paymentHistory,
  startDate,
  paymentFrequency,
  onInstallmentPress,
}) => {
  const theme = useTheme();
  // Calculate statistics based on time-based logic
  let completedCount = 0;
  let upcomingCount = 0;

  for (let i = 1; i <= totalInstallments; i++) {
    const status = getSimplifiedInstallmentStatus(
      i,
      paymentHistory,
      startDate,
      totalInstallments,
      paymentFrequency,
    );

    if (status === 'completed') {
      completedCount++;
    } else if (status === 'current') {
    } else {
      upcomingCount++;
    }
  }

  const overdueCount = 0; // No overdue concept in simplified view
  const currentInstallment = completedCount + 1;

  const renderInstallment = (installmentNumber: number) => {
    const status = getSimplifiedInstallmentStatus(
      installmentNumber,
      paymentHistory,
      startDate,
      totalInstallments,
      paymentFrequency,
    );

    return (
      <InstallmentBox
        key={installmentNumber}
        status={status}
        onPress={() => onInstallmentPress?.(installmentNumber)}
        accessibilityRole="button"
        accessibilityLabel={`Installment ${installmentNumber}`}>
        {status === 'completed' ? (
          <Ionicons
            name="checkmark"
            size={20}
            color={String(theme.buttonPrimaryText?.val ?? theme.color?.val)}
          />
        ) : (
          <InstallmentText status={status} color={getInstallmentTextColor(status)}>
            {installmentNumber}
          </InstallmentText>
        )}
      </InstallmentBox>
    );
  };

  return (
    <YStack>
      <SectionTitle>Payment Schedule</SectionTitle>

      <StatsContainer>
        <StatItem>
          <StatValue color="$green9">{completedCount}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="$blue9">{currentInstallment <= totalInstallments ? 1 : 0}</StatValue>
          <StatLabel>Current</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="$red9">{overdueCount}</StatValue>
          <StatLabel>Overdue</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="$color11">{upcomingCount}</StatValue>
          <StatLabel>Upcoming</StatLabel>
        </StatItem>
      </StatsContainer>

      <HeatMapContainer>
        {Array.from({length: totalInstallments}, (_, i) => renderInstallment(i + 1))}
      </HeatMapContainer>

      <LegendContainer>
        <LegendItem>
          <LegendBox status="completed" />
          <LegendText>Paid</LegendText>
        </LegendItem>

        <LegendItem>
          <LegendBox status="current" />
          <LegendText>Current</LegendText>
        </LegendItem>

        <LegendItem>
          <LegendBox status="overdue" />
          <LegendText>Overdue</LegendText>
        </LegendItem>

        <LegendItem>
          <LegendBox status="upcoming" />
          <LegendText>Upcoming</LegendText>
        </LegendItem>
      </LegendContainer>
    </YStack>
  );
};

export default LoanHeatMap;
