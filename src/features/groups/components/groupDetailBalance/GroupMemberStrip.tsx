import {useBuddyColors, createAlphaColor} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView} from 'tamagui';

import type {GroupDetailBalanceProps} from '../GroupDetailBalanceSection';

const MEMBER_PALETTES = [
  {
    bgDark: ['rgba(96, 165, 250, 0.25)', 'rgba(59, 130, 246, 0.1)'] as const,
    bgLight: ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)'] as const,
    textDark: '#93C5FD',
    textLight: '#2563EB',
  },
  {
    bgDark: ['rgba(167, 139, 250, 0.25)', 'rgba(139, 92, 246, 0.1)'] as const,
    bgLight: ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)'] as const,
    textDark: '#C4B5FD',
    textLight: '#7C3AED',
  },
  {
    bgDark: ['rgba(251, 146, 60, 0.25)', 'rgba(249, 115, 22, 0.1)'] as const,
    bgLight: ['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)'] as const,
    textDark: '#FDBA74',
    textLight: '#C2410C',
  },
  {
    bgDark: ['rgba(244, 114, 182, 0.25)', 'rgba(236, 72, 153, 0.1)'] as const,
    bgLight: ['rgba(236, 72, 153, 0.15)', 'rgba(236, 72, 153, 0.05)'] as const,
    textDark: '#F472B6',
    textLight: '#BE185D',
  },
  {
    bgDark: ['rgba(52, 211, 153, 0.25)', 'rgba(16, 185, 129, 0.1)'] as const,
    bgLight: ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)'] as const,
    textDark: '#6EE7B7',
    textLight: '#059669',
  },
  {
    bgDark: ['rgba(251, 191, 36, 0.25)', 'rgba(245, 158, 11, 0.1)'] as const,
    bgLight: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)'] as const,
    textDark: '#FCD34D',
    textLight: '#B45309',
  },
] as const;

const getMemberPalette = (name: string, isDarkMode: boolean) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % MEMBER_PALETTES.length;
  }
  const entry = MEMBER_PALETTES[hash];
  const gradient = isDarkMode ? entry.bgDark : entry.bgLight;
  return {
    gradient,
    textColor: isDarkMode ? entry.textDark : entry.textLight,
  };
};

export const GroupMemberStrip = ({
  group,
  memberItems,
  isDarkMode,
  onAddMember,
  onOpenMembersSheet,
  getInitials,
}: GroupDetailBalanceProps) => {
  const colors = useBuddyColors();
  const brandColor = colors.iconBrand;
  if (memberItems.length === 0) return null;
  const overflowCount = Math.max(0, group.members.length - 6);

  return (
    <ScrollView
      removeClippedSubviews={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 4, paddingVertical: 4}}>
      <HStack gap="$3" alignItems="center">
        {memberItems
          .slice(0, 6)
          .map(({member, avatarUri, isCurrentUser, statusColor, hasStatus}, index) => {
            const palette = getMemberPalette(member.name, isDarkMode);
            return (
              <VStack
                key={`member-strip-${member.id}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Member ${member.name}`}
                onPress={onOpenMembersSheet}
                pressStyle={{opacity: 0.8, scale: 0.96}}
                alignItems="center"
                gap="$2">
                <VStack
                  width={56}
                  height={56}
                  borderRadius="$10"
                  padding={2}
                  borderWidth={hasStatus ? 1.5 : isCurrentUser ? 1.5 : 0}
                  borderColor={
                    hasStatus ? statusColor : isCurrentUser ? brandColor : 'transparent'
                  }>
                  <VStack
                    flex={1}
                    borderRadius={26}
                    overflow="hidden"
                    backgroundColor={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    justifyContent="center"
                    alignItems="center">
                    {avatarUri ? (
                      <Image
                        source={{uri: avatarUri}}
                        style={{width: '100%', height: '100%'}}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <LinearGradient
                        colors={
                          isCurrentUser
                            ? [
                                createAlphaColor(colors.iconBrand, 0.35),
                                isDarkMode
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(16, 185, 129, 0.08)',
                              ]
                            : palette.gradient
                        }
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          variant="body1"
                          weight="bold"
                          color={isCurrentUser ? brandColor : palette.textColor}>
                          {getInitials(member.name)}
                        </Text>
                      </LinearGradient>
                    )}
                  </VStack>
                </VStack>
                <Text
                  variant="caption"
                  color={isCurrentUser ? '$color' : '$textSecondary'}
                  style={{maxWidth: 64}}
                  numberOfLines={1}
                  textAlign="center"
                  weight={isCurrentUser ? 'bold' : 'normal'}>
                  {isCurrentUser ? 'You' : member.name.split(' ')[0]}
                </Text>
              </VStack>
            );
          })}
        {overflowCount > 0 ? (
          <VStack
            accessibilityRole="button"
            accessibilityLabel={`View all ${group.members.length} members`}
            onPress={onOpenMembersSheet}
            pressStyle={{opacity: 0.8, scale: 0.95}}
            alignItems="center"
            gap="$2">
            <VStack
              width={56}
              height={56}
              borderRadius="$10"
              backgroundColor={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
              borderWidth={1.5}
              borderColor={isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'}
              justifyContent="center"
              alignItems="center">
              <Text variant="body1" weight="bold" color="$text">
                +{overflowCount}
              </Text>
            </VStack>
            <Text variant="caption" color="$textSecondary" weight="semibold">
              All
            </Text>
          </VStack>
        ) : null}
        <VStack alignItems="center" gap="$2" marginLeft="$1">
          <VStack
            accessibilityRole="button"
            accessibilityLabel="Add group member"
            onPress={onAddMember}
            pressStyle={{opacity: 0.75, scale: 0.95}}
            width={56}
            height={56}
            borderRadius="$10"
            backgroundColor={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            borderWidth={1.5}
            borderColor={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}
            justifyContent="center"
            alignItems="center"
            borderStyle="dashed">
            <Ionicons name="add" size={24} color={isDarkMode ? '#FFFFFF' : '#111827'} />
          </VStack>
          <Text variant="caption" color="$textSecondary" weight="medium">
            Add
          </Text>
        </VStack>
      </HStack>
    </ScrollView>
  );
};
