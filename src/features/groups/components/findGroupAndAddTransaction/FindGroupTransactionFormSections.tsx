import {HStack, Input, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import SplitEditor from '@/features/groups/components/SplitEditor';
import {FormField} from '@ravitamil/buddy-ui/FormField';

import type {GroupMember} from '@/types';
import {getFontFamilyForWeight} from '@/utils/fonts';
import {colorToken} from '@/utils/themeColors';
import type {UseFindGroupAndAddTransactionScreenResult} from '../../hooks/useFindGroupAndAddTransactionScreen';
import type {IoniconName} from '../../types/addGroupTransaction';
import {FindGroupGlassCard} from './FindGroupGlassCard';
import {FindGroupSettlementSection} from './FindGroupSettlementSection';
import {activeFindGroupOptionToken} from './findGroupTransactionTheme';
import {splitTypeOptions, transactionTypeOptions} from './findGroupTransactionOptions';

interface FindGroupScreenProps {
  screen: UseFindGroupAndAddTransactionScreenResult;
}

export const FindGroupTransactionFormSections = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$4">
    <AmountSection screen={screen} />
    <TransactionTypeSection screen={screen} />
    <FormField
      label="Description *"
      value={screen.description}
      onChangeText={screen.setDescription}
      placeholder={
        screen.transactionType === 'expense' ? 'What did you spend on?' : 'Payment description'
      }
      autoCapitalize="sentences"
      autoCorrect={false}
      autoComplete="off"
      returnKeyType="next"
    />
    <PaidBySection screen={screen} />
    {screen.transactionType === 'expense' ? <SplitMethodSection screen={screen} /> : null}
    {screen.transactionType === 'payment' ? <FindGroupSettlementSection screen={screen} /> : null}
    {screen.transactionType === 'expense' &&
    (screen.splitType === 'custom' ||
      screen.splitType === 'percentage' ||
      screen.splitType === 'shares') ? (
      <FindGroupGlassCard padding={8}>
        <SplitEditor
          members={(screen.selectedGroup?.members ?? []) as unknown as GroupMember[]}
          splitType={screen.splitType}
          customAmounts={screen.customAmounts}
          setCustomAmounts={screen.setCustomAmounts}
          percentageAmounts={screen.percentageAmounts}
          setPercentageAmounts={screen.setPercentageAmounts}
          sharesAmounts={screen.sharesAmounts}
          setSharesAmounts={screen.setSharesAmounts}
        />
      </FindGroupGlassCard>
    ) : null}
  </VStack>
);

const AmountSection = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$2">
    <Text variant="body1" color="$text" weight="semibold">
      Amount *
    </Text>
    <FindGroupGlassCard padding={12}>
      <HStack alignItems="center" gap="$2">
        <Text variant="h4" color="$text" weight="bold">
          {screen.currencySymbol}
        </Text>
        <Input
          accessibilityLabel="Transaction amount"
          flex={1}
          fontSize={20}
          color="$text"
          padding={12}
          fontWeight="600"
          fontFamily={getFontFamilyForWeight('500')}
          backgroundColor="transparent"
          borderWidth={0}
          placeholder="0.00"
          placeholderTextColor="$colorTransparent"
          value={screen.amount}
          onChangeText={screen.handleAmountChange}
          keyboardType="decimal-pad"
          autoFocus
          returnKeyType="next"
          autoCorrect={false}
          autoComplete="off"
        />
      </HStack>
    </FindGroupGlassCard>
  </VStack>
);

const TransactionTypeSection = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$2">
    <Text variant="body1" color="$text" weight="semibold">
      Transaction Type
    </Text>
    <HStack gap="$2">
      {transactionTypeOptions.map((option) => {
        const isActive = screen.transactionType === option.type;
        const token = activeFindGroupOptionToken(option.color, screen.isDarkMode);
        return (
          <SelectionButton
            key={option.type}
            active={isActive}
            label={option.label}
            icon={option.icon}
            color={token}
            onPress={() => screen.setTransactionType(option.type)}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityHint={option.accessibilityHint}
          />
        );
      })}
    </HStack>
    <Text variant="caption" color="$textSecondary" textAlign="center">
      {screen.transactionType === 'expense'
        ? 'Split a shared expense among group members'
        : 'Record a payment to settle up with someone'}
    </Text>
  </VStack>
);

const PaidBySection = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$2">
    <Text variant="body1" color="$text" weight="semibold">
      Paid By
    </Text>
    <FindGroupGlassCard padding={8}>
      <HStack flexWrap="wrap" gap="$1">
        {screen.selectedGroup?.members.map((member, index) => {
          const isActive = screen.paidBy === member.id;
          return (
            <View
              key={`paid-by-${member.id}-${index}`}
              onPress={() => screen.setPaidBy(member.id)}
              pressStyle={{opacity: 0.8}}
              paddingHorizontal={12}
              paddingVertical={8}
              borderRadius={8}
              backgroundColor={
                isActive
                  ? activeFindGroupOptionToken('blue', screen.isDarkMode)
                  : screen.isDarkMode
                    ? colorToken('gray2')
                    : colorToken('gray1')
              }
              borderWidth={1}
              borderColor={isActive ? colorToken('blue6') : 'transparent'}
              marginRight={4}
              marginBottom={4}
              accessibilityRole="radio"
              accessibilityState={{selected: isActive}}
              accessibilityLabel={`Paid by ${member.name}`}
              accessibilityHint={isActive ? 'Selected' : 'Select payer'}>
              <Text variant="body2" color={isActive ? '$white' : '$text'} weight="medium">
                {member.name}
              </Text>
            </View>
          );
        })}
      </HStack>
    </FindGroupGlassCard>
  </VStack>
);

const SplitMethodSection = ({screen}: FindGroupScreenProps) => (
  <VStack gap="$2">
    <Text variant="body1" color="$text" weight="semibold">
      Split Method
    </Text>
    <HStack gap="$2">
      {splitTypeOptions.map((option) => {
        const isActive = screen.splitType === option.type;
        const token = activeFindGroupOptionToken(option.color, screen.isDarkMode);
        return (
          <SelectionButton
            key={option.type}
            active={isActive}
            label={option.label}
            icon={option.icon}
            color={token}
            onPress={() => screen.setSplitType(option.type)}
            accessibilityLabel={`Split method ${option.type}`}
            accessibilityHint={isActive ? 'Selected' : 'Select split method'}
          />
        );
      })}
    </HStack>
  </VStack>
);

const SelectionButton = ({
  active,
  label,
  icon,
  color,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  active: boolean;
  label: string;
  icon: IoniconName;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}) => (
  <HStack
    onPress={onPress}
    pressStyle={{opacity: 0.8}}
    flex={1}
    padding={12}
    borderRadius={12}
    backgroundColor={active ? color : colorToken('gray1')}
    borderWidth={1}
    borderColor={active ? color : 'transparent'}
    alignItems="center"
    justifyContent="center"
    accessibilityRole="button"
    accessibilityState={{selected: active}}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}>
    <Ionicons
      name={icon}
      size={18}
      color={active ? colorToken('white') : color}
      style={{marginRight: 6}}
    />
    <Text variant="body2" color={active ? '$white' : '$text'} weight="medium">
      {label}
    </Text>
  </HStack>
);
