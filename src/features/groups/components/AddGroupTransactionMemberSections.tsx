import {useBuddyColors} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ProfilePicture} from '@/components/ui';
import {formatUserDisplayName} from '@/utils/userUtils';
import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';
import {GroupTransactionMemberSectionsLayout} from './GroupTransactionMemberSectionsLayout';

interface MemberSectionsProps {
  screen: UseAddGroupTransactionScreenResult;
}

export const AddGroupTransactionMemberSections = ({screen}: MemberSectionsProps) => {
  if (!screen.group) {
    return null;
  }

  return (
    <>
      <GroupTransactionMemberSectionsLayout
        screen={screen}
        paidByVariant="avatar"
        getAvatarColor={screen.getAvatarColor}
        showSplitSection={screen.transactionType === 'expense'}
      />
      {screen.transactionType === 'payment' ? <PaymentRecipientSection screen={screen} /> : null}
    </>
  );
};

const PaymentRecipientSection = ({screen}: MemberSectionsProps) => {
  const colors = useBuddyColors();
  return (
    <VStack gap="$2">
      <Text variant="caption" color="$textSecondary" weight="semibold" marginLeft={4}>
        PAYING TO
      </Text>
      <GlassSurface padding={4}>
        {screen.group?.members
          .filter((member) => member.id !== screen.paidBy)
          .map((member, index) => {
            const debtToMember = screen
              .getMemberDebts()
              .find((debt) => debt.creditorId === member.id);
            const debtAmount = debtToMember ? debtToMember.amount : 0;
            const isSelected = screen.receivedBy.includes(member.id);
            const hasDirectDebt = debtAmount > 0;

            return (
              <HStack
                key={`recipient-${member.id}-${index}`}
                accessibilityRole="checkbox"
                accessibilityState={{checked: isSelected}}
                onPress={() => screen.handleRecipientSelection(member.id)}
                pressStyle={{opacity: 0.8}}
                alignItems="center"
                padding="$3"
                marginVertical="$1"
                marginHorizontal="$2"
                borderRadius="$4"
                backgroundColor={
                  isSelected
                    ? screen.isDarkMode
                      ? 'rgba(76, 175, 80, 0.12)'
                      : 'rgba(76, 175, 80, 0.08)'
                    : 'transparent'
                }
                borderWidth={1.5}
                borderColor={isSelected ? colors.primary : 'transparent'}>
                <HStack marginRight={14}>
                  <ProfilePicture
                    size={44}
                    imageUri={member.avatarUrl || member.avatar}
                    initialsText={member.name.substring(0, 2).toUpperCase()}
                    editable={false}
                    fallbackVariant="initials"
                    fallbackColors={
                      isSelected
                        ? [colors.primary, colors.primaryHover]
                        : [
                            screen.getAvatarColor(member.name),
                            `${screen.getAvatarColor(member.name)}CC`,
                          ]
                    }
                    userId={member.id}
                  />
                </HStack>

                <VStack flex={1}>
                  <Text
                    weight="bold"
                    color={isSelected ? (screen.isDarkMode ? '$brand4' : '$brand8') : '$text'}
                    fontSize={15}>
                    {formatUserDisplayName(
                      member.name,
                      screen.userFirstName,
                      undefined,
                      screen.getUserDisplayName,
                    )}
                  </Text>
                  {hasDirectDebt ? (
                    <Text fontSize={12} color="$error" weight="semibold">
                      You owe {screen.settingsFormatCurrencyExact(debtAmount)}
                    </Text>
                  ) : (
                    <Text fontSize={12} color="$textSecondary">
                      No direct debt
                    </Text>
                  )}
                </VStack>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={26} color={colors.iconBrand} />
                ) : (
                  <HStack
                    width={24}
                    height={24}
                    borderRadius="$6"
                    borderWidth={1.5}
                    borderColor={screen.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                )}
              </HStack>
            );
          })}
      </GlassSurface>
    </VStack>
  );
};
