import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import type {ReactNode} from 'react';
import React from 'react';
import {Image} from 'expo-image';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView, View} from 'tamagui';
import SplitEditor from '@/features/groups/components/SplitEditor';

import {formatUserDisplayName} from '@/utils/userUtils';
import type {GroupSplitType, GroupWithAvatarMembers} from '../types/addGroupTransaction';

const splitTypes: GroupSplitType[] = ['equal', 'custom', 'percentage', 'shares'];

interface GroupTransactionMemberControlProps {
  group: GroupWithAvatarMembers;
  amount: string;
  paidBy: string;
  splitType: GroupSplitType;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
  currencySymbol: string;
  isDarkMode: boolean;
  userFirstName?: string;
  settingsFormatCurrencyExact: (amount: number) => string;
  getUserDisplayName: () => string;
  setPaidBy: (value: string) => void;
  setSplitType: (value: GroupSplitType) => void;
  setCustomAmounts: (value: Record<string, string>) => void;
  setPercentageAmounts: (value: Record<string, string>) => void;
  setSharesAmounts: (value: Record<string, string>) => void;
}

interface PaidBySectionProps extends Pick<
  GroupTransactionMemberControlProps,
  'group' | 'paidBy' | 'isDarkMode' | 'userFirstName' | 'getUserDisplayName' | 'setPaidBy'
> {
  variant: 'avatar' | 'initials';
  getAvatarColor?: (name: string) => string;
}

interface SplitMethodSectionProps extends GroupTransactionMemberControlProps {
  children?: ReactNode;
}

export const GroupTransactionPaidBySection = ({
  group,
  paidBy,
  isDarkMode,
  userFirstName,
  getUserDisplayName,
  setPaidBy,
  variant,
  getAvatarColor,
}: PaidBySectionProps) => (
  <VStack gap="$2" marginTop={8}>
    <Text variant="caption" color="$textSecondary" weight="semibold" marginLeft={4}>
      PAID BY
    </Text>
    <GlassSurface padding={12}>
      <ScrollView
        removeClippedSubviews={false}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 16, paddingRight: 20}}>
        {group.members.map((member, index) => {
          const isSelected = paidBy === member.id;
          const avatarColor = getAvatarColor?.(member.name) ?? '#6B7280';
          const memberName = formatUserDisplayName(
            member.name,
            userFirstName,
            undefined,
            getUserDisplayName,
          );

          if (variant === 'initials') {
            return (
              <VStack
                key={member.id}
                accessibilityRole="radio"
                accessibilityState={{selected: isSelected}}
                accessibilityLabel={`Paid by ${memberName}`}
                onPress={() => setPaidBy(member.id)}
                pressStyle={{opacity: 0.8}}
                alignItems="center"
                opacity={isSelected ? 1 : 0.6}>
                <View
                  width={50}
                  height={50}
                  borderRadius={25}
                  backgroundColor={isSelected ? '$primary' : isDarkMode ? '#333' : '#EEE'}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderColor={isSelected ? '$primary' : 'transparent'}
                  marginBottom={4}>
                  <Text
                    weight="bold"
                    fontSize={18}
                    color={isSelected ? '$buttonPrimaryText' : '$textSecondary'}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </Text>
                  {isSelected ? (
                    <SelectedCheckmark size={18} iconSize={12} isDarkMode={isDarkMode} />
                  ) : null}
                </View>
                <Text
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '$text' : '$textSecondary'}>
                  {memberName}
                </Text>
              </VStack>
            );
          }

          return (
            <VStack
              key={`paid-by-${member.id}-${index}`}
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={`Paid by ${memberName}`}
              onPress={() => setPaidBy(member.id)}
              pressStyle={{opacity: 0.8}}
              alignItems="center"
              paddingHorizontal={4}>
              <View
                width={56}
                height={56}
                borderRadius={28}
                backgroundColor={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                alignItems="center"
                justifyContent="center"
                borderWidth={2}
                borderColor={isSelected ? '$primary' : 'transparent'}
                marginBottom={6}
                position="relative">
                <View
                  width={44}
                  height={44}
                  borderRadius={22}
                  backgroundColor={isSelected ? '$primary' : avatarColor}
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden">
                  {member.avatarUrl || member.avatar ? (
                    <Image
                      source={{uri: member.avatarUrl || member.avatar}}
                      style={{width: '100%', height: '100%'}}
                      contentFit="cover"
                    />
                  ) : (
                    <Text
                      weight="bold"
                      fontSize={16}
                      color={isSelected ? '$buttonPrimaryText' : 'white'}>
                      {member.name.substring(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
                {isSelected ? (
                  <SelectedCheckmark size={22} iconSize={14} isDarkMode={isDarkMode} />
                ) : null}
              </View>
              <Text
                fontSize={11}
                weight={isSelected ? 'bold' : 'medium'}
                color={isSelected ? '$text' : '$textSecondary'}
                numberOfLines={1}
                style={{maxWidth: 65}}>
                {memberName}
              </Text>
            </VStack>
          );
        })}
      </ScrollView>
    </GlassSurface>
  </VStack>
);

export const GroupTransactionSplitMethodSection = ({
  group,
  amount,
  splitType,
  customAmounts,
  percentageAmounts,
  sharesAmounts,
  currencySymbol,
  isDarkMode,
  settingsFormatCurrencyExact,
  setSplitType,
  setCustomAmounts,
  setPercentageAmounts,
  setSharesAmounts,
  children,
}: SplitMethodSectionProps) => (
  <VStack gap="$2">
    <Text variant="caption" color="$textSecondary" weight="semibold" marginLeft={4}>
      SPLIT METHOD
    </Text>
    <GlassSurface padding={4}>
      <HStack>
        {splitTypes.map((type) => {
          const isActive = splitType === type;
          return (
            <View
              key={type}
              accessibilityRole="button"
              accessibilityState={{selected: isActive}}
              accessibilityLabel={`Use ${type} split method`}
              onPress={() => setSplitType(type)}
              pressStyle={{opacity: 0.8}}
              flex={1}
              paddingVertical={12}
              alignItems="center"
              borderRadius={10}
              backgroundColor={isActive ? (isDarkMode ? '#444' : '#FFF') : 'transparent'}
              margin={2}>
              <Text
                fontSize={12}
                weight={isActive ? 'bold' : 'semibold'}
                color={isActive ? '$text' : '$textSecondary'}
                opacity={isActive ? 1 : 0.7}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          );
        })}
      </HStack>

      {splitType === 'equal' ? (
        <VStack alignItems="center" padding={16} gap="$2">
          <Text color="$text" fontSize={16} weight="bold">
            Split Equally
          </Text>
          <Text color="$textSecondary">
            {settingsFormatCurrencyExact(Number.parseFloat(amount || '0') / group.members.length)} /
            person
          </Text>
        </VStack>
      ) : null}

      {children}
    </GlassSurface>

    {splitType === 'custom' || splitType === 'percentage' || splitType === 'shares' ? (
      <GlassSurface padding={8}>
        <SplitEditor
          members={group.members}
          splitType={splitType}
          customAmounts={customAmounts}
          setCustomAmounts={setCustomAmounts}
          percentageAmounts={percentageAmounts}
          setPercentageAmounts={setPercentageAmounts}
          sharesAmounts={sharesAmounts}
          setSharesAmounts={setSharesAmounts}
          totalAmount={amount}
          currencySymbol={currencySymbol}
        />
      </GlassSurface>
    ) : null}
  </VStack>
);

const SelectedCheckmark = ({
  size,
  iconSize,
  isDarkMode,
}: {
  size: number;
  iconSize: number;
  isDarkMode: boolean;
}) => (
  <View
    position="absolute"
    bottom={-2}
    right={-2}
    backgroundColor="$primary"
    borderRadius={size / 2}
    width={size}
    height={size}
    alignItems="center"
    justifyContent="center"
    borderWidth={size > 20 ? 2.5 : 1.5}
    borderColor={isDarkMode ? '#1A1A1A' : 'white'}>
    <Ionicons name="checkmark" size={iconSize} color="$buttonPrimaryText" />
  </View>
);
