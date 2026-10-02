import {Badge, GlassSurface, HStack, IconTile, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {Pressable} from 'react-native';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {Asset, Liability} from '@/types';

interface NetWorthHoldingsCardProps {
  assets: Asset[];
  liabilities: Liability[];
  formatCurrency: (amount: number) => string;
}

type HoldingFilter = 'all' | 'assets' | 'liabilities';

export const NetWorthHoldingsCard = ({
  assets,
  liabilities,
  formatCurrency,
}: NetWorthHoldingsCardProps) => {
  const router = useRouter();
  const {isDarkMode} = useTamaguiTheme();
  const [filter, setFilter] = useState<HoldingFilter>('all');

  const totalCount = assets.length + liabilities.length;

  const handleItemPress = (item: Asset | Liability, isLiability: boolean) => {
    if (isLiability) {
      const liability = item as Liability;
      if (liability.linkedLoanId) {
        router.push(`/loan-detail/${liability.linkedLoanId}` as never);
        return;
      }
    } else {
      const asset = item as Asset;
      if (asset.type === 'savings') {
        router.push('/savings-portfolio');
        return;
      }
      if (asset.type === 'investment') {
        router.push('/investment-research');
        return;
      }
    }
  };

  const getItemIcon = (type: string, isLiability: boolean): keyof typeof Ionicons.glyphMap => {
    if (isLiability) return 'receipt-outline';
    switch (type) {
      case 'wallet':
        return 'wallet-outline';
      case 'investment':
        return 'trending-up-outline';
      case 'savings':
        return 'ribbon-outline';
      default:
        return 'cash-outline';
    }
  };

  const getItemColor = (type: string, isLiability: boolean): string => {
    if (isLiability) return '#FF6B6B';
    switch (type) {
      case 'wallet':
        return '#5C7CFA';
      case 'investment':
        return '#4ECDC4';
      case 'savings':
        return '#45B7D1';
      default:
        return '#A0DAA9';
    }
  };

  const filterOptions: {label: string; value: HoldingFilter; count: number}[] = [
    {label: 'All', value: 'all', count: totalCount},
    {label: 'Assets', value: 'assets', count: assets.length},
    {label: 'Liabilities', value: 'liabilities', count: liabilities.length},
  ];

  const displayItems = [
    ...(filter !== 'liabilities' ? assets.map((a) => ({...a, isLiability: false as const})) : []),
    ...(filter !== 'assets' ? liabilities.map((l) => ({...l, isLiability: true as const})) : []),
  ];

  return (
    <GlassSurface borderRadius={24} padding={16} testID="net-worth-holdings-card">
      <VStack gap="$4">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="layers-outline" size={20} color="#4ECDC4" />
            <VStack>
              <Text variant="h5" color="$text" weight="bold">
                Holdings & Accounts
              </Text>
              <Text variant="caption" color="$textSecondary">
                {totalCount} total items tracked
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Filter Pills */}
        <HStack gap="$2">
          {filterOptions.map((opt) => {
            const isSelected = filter === opt.value;
            return (
              <HStack
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{selected: isSelected}}
                accessibilityLabel={`Filter by ${opt.label}`}
                onPress={() => setFilter(opt.value)}
                pressStyle={{opacity: 0.8}}
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$4"
                backgroundColor={
                  isSelected
                    ? '#4ECDC4'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.05)'
                }>
                <Text
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#000' : '$textSecondary'}>
                  {opt.label} ({opt.count})
                </Text>
              </HStack>
            );
          })}
        </HStack>

        {/* Holdings List */}
        {displayItems.length > 0 ? (
          <VStack gap="$2.5">
            {displayItems.map((item) => {
              const isLiability = item.isLiability;
              const value = isLiability ? (item as Liability).currentValue : (item as Asset).value;
              const iconName = getItemIcon(item.type, isLiability);
              const iconColor = getItemColor(item.type, isLiability);

              return (
                <Pressable
                  key={`${isLiability ? 'liab' : 'asset'}-${item.id}`}
                  onPress={() => handleItemPress(item, isLiability)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${formatCurrency(value)}`}
                  style={({pressed}) => ({
                    opacity: pressed ? 0.75 : 1,
                  })}>
                  <GlassSurface
                    fill
                    borderRadius={16}
                    padding={12}
                    washColor={isLiability ? '$red10' : undefined}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack alignItems="center" gap="$3" flex={1}>
                        <IconTile
                          icon={iconName}
                          color={iconColor}
                          size={40}
                          iconSize={20}
                          tone="soft"
                        />
                        <VStack flex={1} gap="$0.5">
                          <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <HStack alignItems="center" gap="$1.5">
                            <Badge
                              label={item.category ?? item.type}
                              tone={isLiability ? 'error' : 'neutral'}
                            />
                          </HStack>
                        </VStack>
                      </HStack>

                      <VStack alignItems="flex-end" gap="$0.5">
                        <Text
                          variant="body1"
                          weight="bold"
                          color={isLiability ? '$error' : '$text'}>
                          {isLiability ? `-${formatCurrency(value)}` : formatCurrency(value)}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={isDarkMode ? '#666' : '#aaa'}
                        />
                      </VStack>
                    </HStack>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </VStack>
        ) : (
          <Text variant="body2" color="$textSecondary" textAlign="center" paddingVertical="$4">
            No items in this category
          </Text>
        )}
      </VStack>
    </GlassSurface>
  );
};
