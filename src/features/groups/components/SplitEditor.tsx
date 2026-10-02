import {VStack, HStack, Input, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack, styled} from 'tamagui';

import {GroupMember} from '@/types';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {formatUserDisplayName} from '@/utils/userUtils';

type Props = {
  members: GroupMember[];
  splitType: 'custom' | 'percentage' | 'shares';
  customAmounts: Record<string, string>;
  setCustomAmounts: (next: Record<string, string>) => void;
  percentageAmounts: Record<string, string>;
  setPercentageAmounts: (next: Record<string, string>) => void;
  sharesAmounts: Record<string, string>;
  setSharesAmounts: (next: Record<string, string>) => void;
  totalAmount?: string;
  currencySymbol?: string;
};

const StepButton = styled(YStack, {
  name: 'SplitEditorStepButton',
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  padding: 0,
  borderRadius: 16,
  backgroundColor: '$background',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
  pressStyle: {
    opacity: 0.75,
    scale: 0.96,
  },
});

const ProgressTrack = styled(VStack, {
  height: 6,
  backgroundColor: '$color4',
  borderRadius: 3,
  marginTop: 4,
  overflow: 'hidden',
});

const ProgressFill = styled(VStack, {
  height: 6,
  borderRadius: 3,
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const getProgressFillColor = (totalPercentage: number) => {
  if (totalPercentage > 100) {
    return '$error';
  }

  if (totalPercentage === 100) {
    return '$success';
  }

  return '$warning';
};

export default function SplitEditor({
  members,
  splitType,
  customAmounts,
  setCustomAmounts,
  percentageAmounts,
  setPercentageAmounts,
  sharesAmounts,
  setSharesAmounts,
  totalAmount = '0',
  currencySymbol = '$',
}: Props) {
  // Calculations
  const totalCustom = Object.values(customAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0,
  );
  const totalPercentage = Object.values(percentageAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0,
  );
  const totalShares = Object.values(sharesAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0,
  );
  const parsedTotalAmount = parseFloat(totalAmount) || 0;
  const remainingCustom = parsedTotalAmount - totalCustom;

  return (
    <VStack gap="$4">
      <VStack>
        <Text variant="body1" color="$text" weight="semibold">
          {splitType === 'custom'
            ? 'Enter Exact Amounts'
            : splitType === 'percentage'
              ? 'Enter Percentages'
              : 'Enter Shares'}
        </Text>
        <Text variant="caption" color="$textSecondary">
          {splitType === 'custom'
            ? `Assign the exact amount for each person.`
            : splitType === 'percentage'
              ? `Assign a percentage of the total for each person.`
              : `Divide the total by shares (e.g. 1 part vs 2 parts).`}
        </Text>
      </VStack>

      <VStack gap="$3">
        {members.map((member) => {
          const valueStr =
            splitType === 'custom'
              ? customAmounts[member.id] || ''
              : splitType === 'percentage'
                ? percentageAmounts[member.id] || ''
                : sharesAmounts[member.id] || '0';

          const onMinus = () => {
            const current = parseFloat(valueStr) || 0;
            const next = Math.max(0, current - 1);
            if (splitType === 'percentage')
              setPercentageAmounts({...percentageAmounts, [member.id]: String(next)});
            else if (splitType === 'shares')
              setSharesAmounts({...sharesAmounts, [member.id]: String(next)});
          };

          const onPlus = () => {
            const current = parseFloat(valueStr) || 0;
            const next = current + 1;
            if (splitType === 'percentage')
              setPercentageAmounts({...percentageAmounts, [member.id]: String(next)});
            else if (splitType === 'shares')
              setSharesAmounts({...sharesAmounts, [member.id]: String(next)});
          };

          return (
            <VStack key={member.id} gap="$2" paddingVertical={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <Text variant="body1" color="$text" weight="medium" flex={1}>
                  {formatUserDisplayName(member.name, undefined, undefined, () => 'User')}
                </Text>

                <HStack alignItems="center" gap="$3">
                  {/* Prefix for Custom */}
                  {splitType === 'custom' && (
                    <Text color="$textSecondary" weight="medium" fontSize={16}>
                      {currencySymbol}
                    </Text>
                  )}

                  {splitType !== 'custom' && (
                    <StepButton
                      accessibilityRole="button"
                      accessibilityLabel="Decrease split value"
                      onPress={onMinus}>
                      <ThemedIonicon name="remove" size={16} color="$color" />
                    </StepButton>
                  )}

                  <Input
                    accessibilityLabel={`Split value for ${formatUserDisplayName(
                      member.name,
                      undefined,
                      undefined,
                      () => 'User',
                    )}`}
                    size="small"
                    variant="filled"
                    minWidth={80}
                    textAlign="center"
                    fontSize={18}
                    fontWeight="700"
                    borderBottomColor={
                      splitType === 'custom' && !valueStr ? '$error' : '$borderColor'
                    }
                    placeholder={splitType === 'custom' ? '0.00' : '0'}
                    placeholderTextColor="$color11"
                    value={valueStr}
                    onChangeText={(text) => {
                      // Allow only valid decimal inputs
                      if (/^\d*\.?\d{0,2}$/.test(text)) {
                        if (splitType === 'custom')
                          setCustomAmounts({...customAmounts, [member.id]: text});
                        else if (splitType === 'percentage')
                          setPercentageAmounts({...percentageAmounts, [member.id]: text});
                        else setSharesAmounts({...sharesAmounts, [member.id]: text});
                      }
                    }}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />

                  {splitType !== 'custom' && (
                    <StepButton
                      accessibilityRole="button"
                      accessibilityLabel="Increase split value"
                      onPress={onPlus}>
                      <ThemedIonicon name="add" size={16} color="$color" />
                    </StepButton>
                  )}

                  {/* Suffix for Percentage */}
                  {splitType === 'percentage' && (
                    <Text color="$textSecondary" weight="medium" fontSize={16}>
                      %
                    </Text>
                  )}
                </HStack>
              </HStack>
            </VStack>
          );
        })}
      </VStack>

      {/* FOOTER SUMMARY / VALIDATION */}
      <VStack padding={12} backgroundColor="$color2" borderRadius={12} gap="$1">
        {splitType === 'custom' && (
          <>
            <HStack justifyContent="space-between">
              <Text color="$textSecondary">Total Assigned:</Text>
              <Text color="$text" weight="bold">
                {currencySymbol}
                {totalCustom.toFixed(2)}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color={remainingCustom === 0 ? '$success' : '$error'} weight="medium">
                {remainingCustom === 0
                  ? 'Fully Allocated'
                  : remainingCustom > 0
                    ? 'Remaining:'
                    : 'Over Allocated:'}
              </Text>
              {remainingCustom === 0 ? (
                <ThemedIonicon name="checkmark-circle" size={16} color="$success" />
              ) : (
                <Text color="$error" weight="bold">
                  {currencySymbol}
                  {Math.abs(remainingCustom).toFixed(2)}
                </Text>
              )}
            </HStack>
          </>
        )}

        {splitType === 'percentage' && (
          <>
            <HStack justifyContent="space-between">
              <Text color="$textSecondary">Total Percentage:</Text>
              <Text
                color={Math.abs(totalPercentage - 100) < 0.1 ? '$success' : '$error'}
                weight="bold">
                {totalPercentage.toFixed(1)}% / 100%
              </Text>
            </HStack>
            <ProgressTrack>
              <ProgressFill
                width={`${Math.min(100, totalPercentage > 0 ? totalPercentage : 0)}%`}
                backgroundColor={getProgressFillColor(totalPercentage)}
              />
            </ProgressTrack>
            {Math.abs(totalPercentage - 100) > 0.1 && (
              <Text variant="caption" color="$error" marginTop={4}>
                {totalPercentage < 100
                  ? `Allocate ${100 - totalPercentage}% more`
                  : `Reduce by ${totalPercentage - 100}%`}
              </Text>
            )}
          </>
        )}

        {splitType === 'shares' && (
          <HStack justifyContent="space-between">
            <Text color="$textSecondary">Total Shares:</Text>
            <Text color="$text" weight="bold">
              {totalShares}
            </Text>
          </HStack>
        )}
      </VStack>
    </VStack>
  );
}
