import {SegmentedControl, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView, View, XStack} from 'tamagui';

import {isEmojiCategoryIcon} from './transactionDetailPresentation';
import type {TransactionCategoryItem, TransactionSortOption, TransactionTypeFilter} from '../types';

interface TransactionFilterControlsProps {
  isDarkMode: boolean;
  selectedType: TransactionTypeFilter;
  selectedCategory: string;
  selectedGroups: string[];
  showNoGroups: boolean;
  sortBy: TransactionSortOption;
  visibleCategories: TransactionCategoryItem[];
  onOpenSort: () => void;
  onCycleSort?: () => void;
  onOpenGroupFilter: () => void;
  onSelectType: (type: TransactionTypeFilter) => void;
  onSelectCategory: (categoryId: string) => void;
  onToggleNoGroups: () => void;
}

const typeOptions: Array<{label: string; value: TransactionTypeFilter}> = [
  {label: 'All', value: 'all'},
  {label: 'Income', value: 'income'},
  {label: 'Expense', value: 'expense'},
];

export function TransactionFilterControls({
  selectedType,
  selectedCategory,
  selectedGroups,
  showNoGroups,
  sortBy,
  visibleCategories,
  onOpenSort,
  onCycleSort,
  onOpenGroupFilter,
  onSelectType,
  onSelectCategory,
  onToggleNoGroups,
}: TransactionFilterControlsProps) {
  const handleSortPress = onOpenSort ?? onCycleSort;

  return (
    <VStack gap="$2.5">
      {/* Primary Type Segmented Control */}
      <SegmentedControl
        options={typeOptions}
        value={selectedType}
        onValueChange={(val) => onSelectType(val as TransactionTypeFilter)}
        selectedTone={selectedType === 'income' ? 'info' : 'primary'}
      />

      {/* Unified Horizontal Filter Bar: Sort, Groups, Personal Only | Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollContainerStyle}>
        <XStack gap="$2" alignItems="center">
          {/* Sort Button - Opens Sort Bottom Sheet */}
          <FilterButton
            icon="swap-vertical"
            label={formatSortLabel(sortBy)}
            isActive={sortBy !== 'date-desc'}
            onPress={handleSortPress}
            accessibilityLabel={`Sort order: ${formatSortLabel(sortBy)}. Tap to change`}
          />

          {/* Group Filter Button */}
          <FilterButton
            icon="people-outline"
            label={selectedGroups.length > 0 ? `${selectedGroups.length} Groups` : 'Groups'}
            isActive={selectedGroups.length > 0}
            badgeCount={selectedGroups.length}
            onPress={onOpenGroupFilter}
            accessibilityLabel="Filter by group"
          />

          {/* Personal Only Toggle */}
          <FilterButton
            icon="person-outline"
            label="Personal Only"
            isActive={showNoGroups}
            onPress={onToggleNoGroups}
            accessibilityLabel="Toggle personal only transactions"
          />

          {/* Subtle separator divider */}
          <View
            width={1}
            height={22}
            backgroundColor="$borderColor"
            marginHorizontal="$1"
            opacity={0.6}
          />

          {/* All Categories Chip */}
          <CategoryChip
            label="All Categories"
            icon="apps"
            isActive={selectedCategory === 'all'}
            onPress={() => onSelectCategory('all')}
          />

          {/* Category Chips */}
          {visibleCategories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              icon={category.icon}
              color={category.color}
              isActive={selectedCategory === category.id}
              onPress={() => onSelectCategory(category.id)}
            />
          ))}
        </XStack>
      </ScrollView>
    </VStack>
  );
}

interface FilterButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  badgeCount?: number;
  onPress: () => void;
  accessibilityLabel: string;
}

function FilterButton({label, icon, isActive, onPress, accessibilityLabel}: FilterButtonProps) {
  return (
    <View
      accessibilityRole="button"
      accessibilityState={{selected: isActive}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      pressStyle={{opacity: 0.8, scale: 0.97}}
      hitSlop={{top: 8, bottom: 8, left: 6, right: 6}}>
      <XStack
        alignItems="center"
        gap="$1.5"
        paddingHorizontal="$3"
        paddingVertical="$2"
        minHeight={40}
        borderRadius="$10"
        backgroundColor={isActive ? '$primary' : '$surface'}
        borderWidth={1}
        borderColor={isActive ? '$primary' : '$borderColor'}>
        <Ionicons name={icon} size={15} color={isActive ? '#ffffff' : '$colorSubtitle'} />
        <Text
          variant="caption"
          color={isActive ? '#ffffff' : '$color'}
          weight={isActive ? 'bold' : 'medium'}>
          {label}
        </Text>
      </XStack>
    </View>
  );
}

interface CategoryChipProps {
  label: string;
  icon: string;
  color?: string;
  isActive: boolean;
  onPress: () => void;
}

function CategoryChip({label, icon, color, isActive, onPress}: CategoryChipProps) {
  const isEmoji = Boolean(icon && isEmojiCategoryIcon(icon));
  const iconName =
    !isEmoji && icon && icon in Ionicons.glyphMap
      ? (icon as keyof typeof Ionicons.glyphMap)
      : 'pricetag';

  return (
    <View
      accessibilityRole="button"
      accessibilityState={{selected: isActive}}
      accessibilityLabel={`Filter by ${label}`}
      onPress={onPress}
      pressStyle={{opacity: 0.8, scale: 0.97}}
      hitSlop={{top: 8, bottom: 8, left: 6, right: 6}}>
      <XStack
        alignItems="center"
        gap="$1.5"
        paddingHorizontal="$3"
        paddingVertical="$2"
        minHeight={40}
        borderRadius="$10"
        backgroundColor={isActive ? '$primary' : '$surface'}
        borderWidth={1}
        borderColor={isActive ? '$primary' : '$borderColor'}>
        {isEmoji ? (
          <Text
            fontSize={14}
            style={{
              lineHeight: 16,
              textAlign: 'center',
              textAlignVertical: 'center',
              includeFontPadding: false,
            }}>
            {icon}
          </Text>
        ) : (
          <Ionicons
            name={iconName}
            size={14}
            color={isActive ? '#ffffff' : (color ?? '$colorSubtitle')}
          />
        )}
        <Text
          variant="caption"
          color={isActive ? '#ffffff' : '$color'}
          weight={isActive ? 'bold' : 'medium'}>
          {label}
        </Text>
      </XStack>
    </View>
  );
}

const formatSortLabel = (sortBy: TransactionSortOption) => {
  switch (sortBy) {
    case 'date-desc':
      return 'Newest';
    case 'date-asc':
      return 'Oldest';
    case 'amount-desc':
      return 'Highest';
    case 'amount-asc':
      return 'Lowest';
    case 'category':
      return 'Category';
    case 'type':
      return 'Type';
  }
};

const scrollContainerStyle = {alignItems: 'center' as const};
