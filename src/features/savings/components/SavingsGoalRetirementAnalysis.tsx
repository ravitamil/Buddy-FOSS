import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import {logger as appLogger} from '@/services/LoggerService';
import type {SavingsGoal} from '@/types';

import {
  buildRetirementAnalysis,
  type RetirementAnalysis,
} from './savingsGoalRetirementAnalysisModel';

const logger = appLogger.contextLogger('SavingsGoalDetailScreen');

export const SavingsGoalRetirementAnalysis = ({
  formatCurrency,
  goal,
}: {
  formatCurrency: (amount: number) => string;
  goal: SavingsGoal;
}) => {
  if (!goal.isRetirementGoal) return null;

  if (!goal.currentAnnualExpenses || !goal.retirementAge || !goal.lifeExpectancy) {
    return null;
  }

  try {
    const {fireMilestones, needs, projection, readiness} = buildRetirementAnalysis(goal);

    return (
      <VStack gap="$4">
        <VStack gap="$3">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text variant="h4" color="#F59E0B" weight="bold">
              FIRE & Retirement Analysis
            </Text>
          </HStack>
          <Text variant="body1" color="$textSecondary">
            Financial Independence, Retire Early metrics and milestones
          </Text>
        </VStack>

        <FireMilestonesCard
          currentSavings={goal.currentAmount}
          fireMilestones={fireMilestones}
          formatCurrency={formatCurrency}
        />
        <SafeWithdrawalCard
          fireMilestones={fireMilestones}
          formatCurrency={formatCurrency}
          projection={projection}
        />
        <SavingsProjectionCard
          formatCurrency={formatCurrency}
          goal={goal}
          needsTotal={needs.totalRetirementSavingsNeeded}
          projection={projection}
        />
        <RetirementNeedsCard formatCurrency={formatCurrency} needs={needs} />
        <ReadinessScoreCard readiness={readiness} />
      </VStack>
    );
  } catch (error) {
    logger.error('Error calculating retirement analysis', error);
    return (
      <GlassSurface washColor="#EF4444">
        <VStack gap="$3" alignItems="center">
          <Ionicons name="warning" size={24} color="#EF4444" />
          <Text variant="body1" color="#EF4444" weight="bold">
            Unable to calculate retirement analysis
          </Text>
          <Text variant="caption" color="$textSecondary" textAlign="center">
            Some retirement data may be missing or invalid.
          </Text>
        </VStack>
      </GlassSurface>
    );
  }
};

const MetricRow = ({
  label,
  value,
  valueColor = '$text',
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) => (
  <HStack justifyContent="space-between">
    <Text variant="body1" color="$textSecondary">
      {label}
    </Text>
    <Text variant="body1" color={valueColor} weight="bold">
      {value}
    </Text>
  </HStack>
);

const MilestoneRow = ({
  current,
  formatCurrency,
  label,
  percent,
  tag,
  target,
}: {
  label: string;
  target: number;
  current: number;
  percent: number;
  formatCurrency: (amount: number) => string;
  tag?: string;
}) => (
  <VStack gap="$1.5">
    <HStack justifyContent="space-between" alignItems="center">
      <HStack alignItems="center" gap="$1.5">
        <Text variant="body1" color="$text" weight="medium">
          {label}
        </Text>
        {tag && (
          <XStack
            backgroundColor="$orange4"
            paddingHorizontal="$1.5"
            paddingVertical="$0.5"
            borderRadius="$1">
            <Text variant="caption" color="#F59E0B" fontSize={10} weight="bold">
              {tag}
            </Text>
          </XStack>
        )}
      </HStack>
      <Text variant="body1" color="$text" weight="bold">
        {formatCurrency(target)}
      </Text>
    </HStack>
    <XStack
      height={6}
      width="100%"
      borderRadius={3}
      overflow="hidden"
      backgroundColor="$surfacePress">
      <YStack
        height="100%"
        width={`${Math.min(Math.max(percent, 0), 100)}%`}
        borderRadius={3}
        backgroundColor={percent >= 100 ? '$green9' : '$orange9'}
      />
    </XStack>
    <HStack justifyContent="space-between">
      <Text variant="caption" color="$textSecondary">
        {formatCurrency(current)}
      </Text>
      <Text variant="caption" color={percent >= 100 ? '$green10' : '$orange10'} weight="bold">
        {percent.toFixed(0)}%
      </Text>
    </HStack>
  </VStack>
);

const FireMilestonesCard = ({
  currentSavings,
  fireMilestones,
  formatCurrency,
}: {
  fireMilestones: RetirementAnalysis['fireMilestones'];
  formatCurrency: (amount: number) => string;
  currentSavings: number;
}) => (
  <GlassSurface>
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="flame" size={20} color="#F59E0B" />
        <Text variant="h5" color="#F59E0B" weight="bold">
          FIRE Milestones
        </Text>
      </HStack>

      <VStack gap="$3">
        <MilestoneRow
          label="Lean FIRE"
          tag="20x"
          target={fireMilestones.leanFire}
          current={currentSavings}
          percent={fireMilestones.progressToLeanFire}
          formatCurrency={formatCurrency}
        />
        <MilestoneRow
          label="Standard FIRE"
          tag="25x (4% Rule)"
          target={fireMilestones.standardFire}
          current={currentSavings}
          percent={fireMilestones.progressToStandardFire}
          formatCurrency={formatCurrency}
        />
        <MilestoneRow
          label="Fat FIRE"
          tag="30x"
          target={fireMilestones.fatFire}
          current={currentSavings}
          percent={fireMilestones.progressToFatFire}
          formatCurrency={formatCurrency}
        />

        <HStack
          padding="$2.5"
          borderRadius="$3"
          backgroundColor={fireMilestones.isCoastFireAchieved ? '$green3' : '$orange3'}
          borderWidth={1}
          borderColor={fireMilestones.isCoastFireAchieved ? '$green6' : '$orange6'}
          justifyContent="space-between"
          alignItems="center">
          <VStack gap="$0.5" flex={1}>
            <HStack alignItems="center" gap="$1.5">
              <Ionicons
                name={fireMilestones.isCoastFireAchieved ? 'checkmark-circle' : 'hourglass'}
                size={16}
                color={fireMilestones.isCoastFireAchieved ? '#10B981' : '#F59E0B'}
              />
              <Text
                variant="caption"
                color={fireMilestones.isCoastFireAchieved ? '$green10' : '#F59E0B'}
                weight="bold">
                Coast FIRE Target: {formatCurrency(fireMilestones.coastFire)}
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              {fireMilestones.isCoastFireAchieved
                ? 'Achieved! Existing investments will compound to FIRE on their own.'
                : 'Target balance needed today to compound to FIRE without adding more.'}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  </GlassSurface>
);

const SafeWithdrawalCard = ({
  fireMilestones,
  formatCurrency,
  projection,
}: {
  fireMilestones: RetirementAnalysis['fireMilestones'];
  projection: RetirementAnalysis['projection'];
  formatCurrency: (amount: number) => string;
}) => (
  <GlassSurface>
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
        <Text variant="h5" color="#3B82F6" weight="bold">
          4% Safe Withdrawal Power
        </Text>
      </HStack>
      <VStack gap="$2">
        <MetricRow
          label="Passive Income Today (Annual)"
          value={formatCurrency(fireMilestones.safeAnnualWithdrawal)}
        />
        <MetricRow
          label="Passive Income Today (Monthly)"
          value={`${formatCurrency(fireMilestones.safeMonthlyWithdrawal)}/mo`}
          valueColor="$blue10"
        />
        <MetricRow
          label="Projected Monthly at FIRE"
          value={`${formatCurrency(projection.projectedAnnualIncome / 12)}/mo`}
          valueColor="$green10"
        />
      </VStack>
    </VStack>
  </GlassSurface>
);

const RetirementNeedsCard = ({
  formatCurrency,
  needs,
}: {
  formatCurrency: (amount: number) => string;
  needs: RetirementAnalysis['needs'];
}) => (
  <GlassSurface>
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="list" size={20} color="#8B5CF6" />
        <Text variant="h5" color="#8B5CF6" weight="bold">
          Retirement Needs
        </Text>
      </HStack>
      <VStack gap="$2">
        <MetricRow
          label="Annual Income Needed"
          value={formatCurrency(needs.annualRetirementIncomeNeeded)}
        />
        <MetricRow
          label="Total Savings Needed"
          value={formatCurrency(needs.totalRetirementSavingsNeeded)}
        />
        <MetricRow label="Years in Retirement" value={needs.yearsInRetirement} />
        <MetricRow label="Healthcare Costs" value={formatCurrency(needs.healthcareCostsEstimate)} />
      </VStack>
    </VStack>
  </GlassSurface>
);

const SavingsProjectionCard = ({
  formatCurrency,
  goal,
  needsTotal,
  projection,
}: {
  formatCurrency: (amount: number) => string;
  goal: SavingsGoal;
  needsTotal: number;
  projection: RetirementAnalysis['projection'];
}) => (
  <GlassSurface>
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="trending-up" size={20} color="#10B981" />
        <Text variant="h5" color="#10B981" weight="bold">
          Savings Projection
        </Text>
      </HStack>
      <VStack gap="$2">
        <MetricRow label="Current Savings" value={formatCurrency(goal.currentAmount)} />
        <MetricRow
          label="Projected at Retirement"
          value={formatCurrency(projection.projectedSavingsAtRetirement)}
          valueColor={projection.projectedSavingsAtRetirement >= needsTotal ? '#4CAF50' : '#FF5722'}
        />
        <MetricRow
          label="Projected Annual Income"
          value={formatCurrency(projection.projectedAnnualIncome)}
        />
        <MetricRow
          label="Shortfall"
          value={formatCurrency(projection.shortfall)}
          valueColor={projection.shortfall > 0 ? '#FF5722' : '#4CAF50'}
        />
        {projection.monthlyContributionNeeded > 0 && (
          <MetricRow
            label="Recommended Monthly Savings"
            value={formatCurrency(projection.monthlyContributionNeeded)}
            valueColor="#FF9800"
          />
        )}
      </VStack>
    </VStack>
  </GlassSurface>
);

const ReadinessScoreCard = ({readiness}: {readiness: RetirementAnalysis['readiness']}) => (
  <GlassSurface>
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="speedometer" size={20} color="#F59E0B" />
        <Text variant="h5" color="#F59E0B" weight="bold">
          Retirement Readiness
        </Text>
      </HStack>

      <VStack gap="$3">
        <VStack alignItems="center" gap="$2">
          <Text variant="body1" color="$textSecondary">
            Readiness Score
          </Text>
          <Text
            variant="h2"
            color={
              readiness.readinessScore >= 70
                ? '#4CAF50'
                : readiness.readinessScore >= 50
                  ? '#FF9800'
                  : '#FF5722'
            }
            weight="bold">
            {readiness.readinessScore.toFixed(0)}%
          </Text>
        </VStack>

        <VStack gap="$2">
          <Text variant="body1" color="$textSecondary">
            Recommendation:
          </Text>
          <Text variant="body1" color="$text">
            {readiness.recommendations[0]}
          </Text>
        </VStack>

        {readiness.isOnTrack ? (
          <HStack justifyContent="center" alignItems="center" gap="$2">
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text variant="body1" color="#4CAF50" weight="bold">
              You're on track for retirement!
            </Text>
          </HStack>
        ) : (
          <HStack justifyContent="center" alignItems="center" gap="$2">
            <Ionicons name="alert-circle" size={20} color="#FF5722" />
            <Text variant="body1" color="#FF5722" weight="bold">
              Consider adjusting your savings plan.
            </Text>
          </HStack>
        )}
      </VStack>
    </VStack>
  </GlassSurface>
);
