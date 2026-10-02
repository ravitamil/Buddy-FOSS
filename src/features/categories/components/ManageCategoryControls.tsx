import React, {useCallback} from 'react';
import {ScrollView} from 'react-native';
import {styled} from 'tamagui';

import {GlassSurface, LoadingIndicator} from '@ravitamil/buddy-ui';
import {HStack, VStack} from '@ravitamil/buddy-ui';
import {Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {createAlphaColor, semanticHexColor} from '@ravitamil/buddy-ui/theme';
import type {CategoryTypeCounts, ManageCategoryFilter} from '../hooks/useManageCategoriesScreen';

export interface CategoryFilterOption {
  color: string;
  filter: ManageCategoryFilter;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

const filterOptions: ReadonlyArray<CategoryFilterOption> = [
  {
    filter: 'all',
    label: 'All',
    icon: 'layers-outline',
    color: semanticHexColor('primary'),
  },
  {
    filter: 'expense',
    label: 'Expense',
    icon: 'arrow-down-outline',
    color: semanticHexColor('danger'),
  },
  {
    filter: 'income',
    label: 'Income',
    icon: 'arrow-up-outline',
    color: semanticHexColor('success'),
  },
  {
    filter: 'investment',
    label: 'Investment',
    icon: 'trending-up-outline',
    color: semanticHexColor('info'),
  },
];

export function CategoryFilters({
  activeFilter,
  counts,
  onChange,
}: {
  activeFilter: ManageCategoryFilter;
  counts?: CategoryTypeCounts;
  onChange: (filter: ManageCategoryFilter) => void;
}) {
  return (
    <GlassSurface padding={6} borderRadius={20}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 6,
          alignItems: 'center',
          paddingHorizontal: 2,
        }}>
        {filterOptions.map((option) => {
          const count =
            counts == null
              ? undefined
              : option.filter === 'all'
                ? counts.total
                : counts[option.filter];

          return (
            <FilterPill
              key={option.filter}
              {...option}
              count={count}
              isActive={activeFilter === option.filter}
              onPress={onChange}
            />
          );
        })}
      </ScrollView>
    </GlassSurface>
  );
}

function FilterPill({
  filter,
  label,
  icon,
  color,
  count,
  isActive,
  onPress,
}: {
  filter: ManageCategoryFilter;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  count?: number;
  isActive: boolean;
  onPress: (filter: ManageCategoryFilter) => void;
}) {
  const handlePress = useCallback(() => onPress(filter), [filter, onPress]);

  return (
    <HStack
      accessibilityRole="button"
      accessibilityLabel={`Show ${label.toLowerCase()} categories`}
      accessibilityState={{selected: isActive}}
      onPress={handlePress}
      pressStyle={{scale: 0.96, opacity: 0.88}}
      minHeight={46}
      paddingHorizontal="$3.5"
      gap="$2"
      borderRadius={14}
      alignItems="center"
      justifyContent="center"
      backgroundColor={isActive ? color : 'transparent'}>
      <ThemedIonicon name={icon} size={16} color={isActive ? '$white' : '$iconSecondary'} />
      <Text
        variant="label"
        color={isActive ? '$white' : '$textSecondary'}
        weight={isActive ? 'bold' : 'semibold'}
        fontSize={13}
        numberOfLines={1}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <HStack
          minWidth={20}
          height={20}
          paddingHorizontal={5}
          borderRadius={10}
          alignItems="center"
          justifyContent="center"
          backgroundColor={
            isActive ? createAlphaColor('#ffffff', 0.28) : createAlphaColor(color, 0.14)
          }>
          <Text fontSize={11} weight="bold" color={isActive ? '$white' : color} lineHeight={14}>
            {count}
          </Text>
        </HStack>
      ) : null}
    </HStack>
  );
}

export function ManageCategoriesOverview({
  expenseCount,
  incomeCount,
  investmentCount,
  activeFilter,
  onSelectFilter,
}: {
  expenseCount: number;
  incomeCount: number;
  investmentCount: number;
  activeFilter?: ManageCategoryFilter;
  onSelectFilter?: (filter: ManageCategoryFilter) => void;
}) {
  const totalCount = expenseCount + incomeCount + investmentCount;

  return (
    <GlassSurface testID="manage-categories-overview" padding={18} borderRadius={22}>
      <VStack gap="$3.5">
        <HStack alignItems="center" justifyContent="space-between">
          <VStack gap="$0.5">
            <Text variant="body2" color="$textSecondary" weight="semibold">
              Category Library
            </Text>
            <HStack alignItems="flex-end" gap="$2">
              <Text variant="h2" color="$text" weight="bold">
                {totalCount}
              </Text>
              <Text variant="body2" color="$textSecondary" paddingBottom={3}>
                {totalCount === 1 ? 'total category' : 'total categories'}
              </Text>
            </HStack>
          </VStack>

          {onSelectFilter ? (
            <HStack
              accessibilityRole="button"
              accessibilityLabel="Show all categories"
              onPress={() => onSelectFilter('all')}
              pressStyle={{scale: 0.96, opacity: 0.8}}
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$4"
              backgroundColor={
                activeFilter === 'all'
                  ? createAlphaColor(semanticHexColor('primary'), 0.16)
                  : '$glassStrong'
              }
              borderWidth={1}
              borderColor={
                activeFilter === 'all' ? semanticHexColor('primary') : '$glassSurfaceBorder'
              }>
              <Text
                fontSize="$2"
                weight="semibold"
                color={activeFilter === 'all' ? '$iconBrand' : '$textSecondary'}>
                View All
              </Text>
            </HStack>
          ) : null}
        </HStack>

        <HStack gap="$2" justifyContent="space-between">
          <OverviewStatPill
            label="Expense"
            count={expenseCount}
            icon="arrow-down-outline"
            accentColor={semanticHexColor('danger')}
            isActive={activeFilter === 'expense'}
            onPress={onSelectFilter ? () => onSelectFilter('expense') : undefined}
          />
          <OverviewStatPill
            label="Income"
            count={incomeCount}
            icon="arrow-up-outline"
            accentColor={semanticHexColor('success')}
            isActive={activeFilter === 'income'}
            onPress={onSelectFilter ? () => onSelectFilter('income') : undefined}
          />
          <OverviewStatPill
            label="Investment"
            count={investmentCount}
            icon="trending-up-outline"
            accentColor={semanticHexColor('info')}
            isActive={activeFilter === 'investment'}
            onPress={onSelectFilter ? () => onSelectFilter('investment') : undefined}
          />
        </HStack>
      </VStack>
    </GlassSurface>
  );
}

function OverviewStatPill({
  label,
  count,
  icon,
  accentColor,
  isActive = false,
  onPress,
}: {
  label: string;
  count: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accentColor: string;
  isActive?: boolean;
  onPress?: () => void;
}) {
  return (
    <VStack
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={`Filter by ${label.toLowerCase()} categories (${count})`}
      accessibilityState={{selected: isActive}}
      onPress={onPress}
      pressStyle={onPress ? {scale: 0.96, opacity: 0.85} : undefined}
      flex={1}
      minHeight={66}
      paddingHorizontal="$2"
      paddingVertical="$2.5"
      borderRadius={16}
      alignItems="center"
      justifyContent="center"
      gap="$1"
      backgroundColor={
        isActive ? createAlphaColor(accentColor, 0.2) : createAlphaColor(accentColor, 0.08)
      }
      borderWidth={1.5}
      borderColor={isActive ? accentColor : createAlphaColor(accentColor, 0.22)}>
      <HStack alignItems="center" justifyContent="center" gap="$1.5">
        <VStack
          width={22}
          height={22}
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
          backgroundColor={createAlphaColor(accentColor, 0.18)}>
          <ThemedIonicon name={icon} size={13} color={accentColor} />
        </VStack>
        <Text fontSize={16} weight="bold" color="$text" lineHeight={20}>
          {count}
        </Text>
      </HStack>
      <Text
        fontSize={12}
        weight={isActive ? 'bold' : 'semibold'}
        color={isActive ? accentColor : '$textSecondary'}
        textAlign="center"
        numberOfLines={1}
        lineHeight={15}>
        {label}
      </Text>
    </VStack>
  );
}

interface StatusMessageProps {
  message: string;
  onClose?: () => void;
  tone: 'success' | 'error' | 'info';
}

export function StatusMessage({message, tone, onClose}: StatusMessageProps) {
  const isLoading = tone === 'info';
  const color = semanticHexColor(tone);
  const icon = tone === 'success' ? 'checkmark-circle' : 'alert-circle';

  return (
    <GlassSurface washColor={color} padding={12} borderRadius={16}>
      <HStack minHeight={48} alignItems="center" gap="$3">
        {isLoading ? (
          <LoadingIndicator size="small" color={color} accessibilityLabel={message} />
        ) : (
          <ThemedIonicon name={icon} size={22} color={color} />
        )}
        <Text flex={1} variant="body2" color="$text" weight="semibold">
          {message}
        </Text>
        {onClose ? (
          <HStack
            accessibilityRole="button"
            accessibilityLabel="Dismiss message"
            onPress={onClose}
            pressStyle={{scale: 0.96, opacity: 0.75}}
            width={48}
            height={48}
            alignItems="center"
            justifyContent="center"
            borderRadius={14}>
            <ThemedIonicon name="close" size={20} color="$iconSecondary" />
          </HStack>
        ) : null}
      </HStack>
    </GlassSurface>
  );
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
