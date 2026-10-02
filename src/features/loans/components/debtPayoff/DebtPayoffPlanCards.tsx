import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {PieChart} from 'react-native-gifted-charts';
import {View} from 'tamagui';

import type {DebtPayoffPlan} from '@/types/debt.types';
import type {LoanData} from '@/types/loan.types';
import type {DebtPayoffChartDatum} from '../../hooks/useDebtPayoffScreen';
import type {FormatCurrency} from './debtPayoffTypes';
import {SectionTitle, SummaryRow} from './DebtPayoffPrimitives';

export function DebtSummaryCard({
  activeLoans,
  debtPayoffPlan,
  formatCurrency,
}: {
  activeLoans: LoanData[];
  debtPayoffPlan: DebtPayoffPlan | null;
  formatCurrency: FormatCurrency;
}) {
  if (!debtPayoffPlan) return null;

  const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalInterest = activeLoans.reduce((sum, loan) => sum + (loan.totalInterest || 0), 0);

  return (
    <GlassSurface>
      <VStack gap="$4">
        <SectionTitle icon="card" title="Debt Summary" color="#8B5CF6" />
        <VStack gap="$3">
          <SummaryRow label="Total Debt" value={formatCurrency(totalDebt)} />
          <SummaryRow label="Total Interest" value={formatCurrency(totalInterest)} />
          <SummaryRow
            label="Payoff Time"
            value={`${debtPayoffPlan.yearsToPayoff.toFixed(1)} years`}
          />
          <SummaryRow
            label="Interest Savings"
            value={formatCurrency(debtPayoffPlan.totalInterestSavings)}
            valueColor="$green10"
          />
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

export function DebtDistributionChart({
  chartData,
  isDarkMode,
}: {
  chartData: DebtPayoffChartDatum[];
  isDarkMode: boolean;
}) {
  if (chartData.length === 0) return null;

  return (
    <GlassSurface>
      <VStack gap="$3">
        <SectionTitle icon="pie-chart" title="Debt Distribution" color="#10B981" />
        <PieChart
          data={chartData}
          radius={90}
          showText
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          textSize={10}
          strokeWidth={2}
          strokeColor={isDarkMode ? '#1A1A1A' : '#FFFFFF'}
          showValuesAsLabels={false}
          showTextBackground={false}
          labelsPosition="outward"
          backgroundColor="transparent"
        />
      </VStack>
    </GlassSurface>
  );
}

export function DebtPayoffOrderCard({
  activeLoans,
  debtPayoffPlan,
  formatCurrency,
  isDarkMode,
}: {
  activeLoans: LoanData[];
  debtPayoffPlan: DebtPayoffPlan | null;
  formatCurrency: FormatCurrency;
  isDarkMode: boolean;
}) {
  if (!debtPayoffPlan?.loans.length) return null;

  return (
    <GlassSurface>
      <VStack gap="$4">
        <SectionTitle icon="list" title="Payoff Order" color="#F59E0B" />
        <VStack gap="$3">
          {debtPayoffPlan.loans.map((loan, index) => (
            <HStack
              key={loan.id}
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$2"
              borderBottomWidth={index < debtPayoffPlan.loans.length - 1 ? 1 : 0}
              borderBottomColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
              <HStack alignItems="center" gap="$3">
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isDarkMode
                      ? 'rgba(78, 205, 196, 0.2)'
                      : 'rgba(78, 205, 196, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text variant="caption" color="#4ECDC4" weight="bold">
                    {loan.payoffOrder}
                  </Text>
                </View>
                <VStack gap="$1">
                  <Text variant="body1" color="$text">
                    {loan.name}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    {`Progress: ${getLoanProgress(activeLoans, loan.id).toFixed(0)}%`}
                  </Text>
                </VStack>
              </HStack>
              <Text variant="body1" color="$text" weight="semibold">
                {formatCurrency(loan.balance)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

function getLoanProgress(activeLoans: LoanData[], loanId: string): number {
  const current = activeLoans.find((loan) => loan.id === loanId);
  const total = current?.totalAmount ?? 0;
  const outstanding = current?.outstandingBalance ?? 0;
  return total > 0 ? Math.max(0, Math.min(100, ((total - outstanding) / total) * 100)) : 0;
}
