import {GlassSurface, HStack, IconTile, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useRouter} from 'expo-router';
import React from 'react';
import {Pressable} from 'react-native';

export const NetWorthQuickActionsCard = () => {
  const router = useRouter();

  const actions = [
    {
      id: 'investment',
      title: 'Add Investment',
      icon: 'trending-up-outline' as const,
      color: '$teal10',
      onPress: () => router.push('/add-investment'),
    },
    {
      id: 'savings',
      title: 'Add Goal',
      icon: 'ribbon-outline' as const,
      color: '$blue10',
      onPress: () => router.push('/add-savings-goal'),
    },
    {
      id: 'loan',
      title: 'Add Loan',
      icon: 'receipt-outline' as const,
      color: '$red10',
      onPress: () => router.push('/add-edit-loan'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics-outline' as const,
      color: '$primary',
      onPress: () => router.push('/analytics'),
    },
  ];

  return (
    <GlassSurface borderRadius={24} padding={16} testID="net-worth-quick-actions-card">
      <VStack gap="$3">
        {/* Header */}
        <HStack alignItems="center" gap="$2">
          <Ionicons name="flash-outline" size={18} color="#4ECDC4" />
          <Text variant="h6" color="$text" weight="bold">
            Quick Actions
          </Text>
        </HStack>

        {/* 4-Action Grid */}
        <HStack gap="$2" width="100%">
          {actions.map((act) => (
            <Pressable
              key={act.id}
              onPress={act.onPress}
              accessibilityRole="button"
              accessibilityLabel={act.title}
              style={({pressed}) => ({
                flex: 1,
                opacity: pressed ? 0.75 : 1,
              })}>
              <GlassSurface fill borderRadius={16} padding={10} style={{alignItems: 'center'}}>
                <VStack alignItems="center" gap="$1.5">
                  <IconTile icon={act.icon} color={act.color} size={36} iconSize={18} tone="soft" />
                  <Text
                    variant="caption"
                    color="$text"
                    weight="medium"
                    textAlign="center"
                    numberOfLines={1}
                    fontSize={11}>
                    {act.title}
                  </Text>
                </VStack>
              </GlassSurface>
            </Pressable>
          ))}
        </HStack>
      </VStack>
    </GlassSurface>
  );
};
