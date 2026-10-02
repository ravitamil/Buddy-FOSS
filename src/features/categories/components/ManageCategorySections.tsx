import React, {useCallback, useMemo} from 'react';
import {FlashList, type ListRenderItemInfo} from '@shopify/flash-list';
import Animated from 'react-native-reanimated';
import {styled} from 'tamagui';

import {Button, GlassSurface, HStack, SearchField, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {createAlphaColor, semanticHexColor} from '@ravitamil/buddy-ui/theme';
import type {Category, InvestmentCategory} from '@/types';
import type {
  ManageCategoryFilter,
  UseManageCategoriesScreenResult,
} from '../hooks/useManageCategoriesScreen';
import {CategoryFilters, ManageCategoriesOverview, StatusMessage} from './ManageCategoryControls';
import {CategoryCountBadge} from './ManageCategoryPrimitives';
import {CategoryItem, InvestmentCategoryItem} from './ManageCategoryRows';

type CategorySectionKey = Exclude<ManageCategoryFilter, 'all'>;

type ManageCategoryListItem =
  | {
      accentColor: string;
      count: number;
      icon: React.ComponentProps<typeof Ionicons>['name'];
      key: string;
      kind: 'section';
      sectionKey: CategorySectionKey;
      title: string;
    }
  | {category: Category; key: string; kind: 'category'}
  | {category: InvestmentCategory; key: string; kind: 'investment'}
  | {
      accentColor: string;
      icon: React.ComponentProps<typeof Ionicons>['name'];
      key: string;
      kind: 'empty';
      label: string;
      searchQuery?: string;
      onClearSearch?: () => void;
    };

type CategorySectionDefinition =
  | {
      accentColor: string;
      categories: Category[];
      icon: React.ComponentProps<typeof Ionicons>['name'];
      itemKind: 'category';
      key: 'expense' | 'income';
      title: string;
    }
  | {
      accentColor: string;
      categories: InvestmentCategory[];
      icon: React.ComponentProps<typeof Ionicons>['name'];
      itemKind: 'investment';
      key: 'investment';
      title: string;
    };

const sectionPresentation = {
  expense: {
    title: 'Expense categories',
    icon: 'arrow-down-outline' as const,
    accentColor: semanticHexColor('danger'),
  },
  income: {
    title: 'Income categories',
    icon: 'arrow-up-outline' as const,
    accentColor: semanticHexColor('success'),
  },
  investment: {
    title: 'Investment categories',
    icon: 'trending-up-outline' as const,
    accentColor: semanticHexColor('info'),
  },
};

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ManageCategoryListItem>);

export function ManageCategorySections({screen}: {screen: UseManageCategoriesScreenResult}) {
  const {
    categoryFilter,
    categoryGroups,
    investmentCategories,
    totalCounts,
    searchQuery,
    setSearchQuery,
    isLoading,
    successMessage,
    errorMessage,
    setCategoryFilter,
    clearErrorMessage,
    handleEditCategory,
    handleEditInvestmentCategory,
    handleDeleteCategory,
    handleDeleteInvestmentCategory,
    isMandatoryCategory,
    isMandatoryInvestmentCategory,
    onScroll,
  } = screen;

  const sections = useMemo<CategorySectionDefinition[]>(() => {
    const allSections: CategorySectionDefinition[] = [
      {
        key: 'expense',
        itemKind: 'category',
        categories: categoryGroups.expense,
        ...sectionPresentation.expense,
      },
      {
        key: 'income',
        itemKind: 'category',
        categories: categoryGroups.income,
        ...sectionPresentation.income,
      },
      {
        key: 'investment',
        itemKind: 'investment',
        categories: investmentCategories,
        ...sectionPresentation.investment,
      },
    ];

    return categoryFilter === 'all'
      ? allSections
      : allSections.filter((section) => section.key === categoryFilter);
  }, [categoryFilter, categoryGroups.expense, categoryGroups.income, investmentCategories]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  const listItems = useMemo(
    () => buildListItems(sections, searchQuery, handleClearSearch),
    [handleClearSearch, searchQuery, sections],
  );

  const listHeader = useMemo(
    () => (
      <VStack gap="$3.5" marginBottom="$2">
        <ManageCategoriesOverview
          expenseCount={totalCounts.expense}
          incomeCount={totalCounts.income}
          investmentCount={totalCounts.investment}
          activeFilter={categoryFilter}
          onSelectFilter={setCategoryFilter}
        />
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search categories..."
          onClear={handleClearSearch}
          testID="manage-categories-search"
        />
        <CategoryFilters
          activeFilter={categoryFilter}
          counts={totalCounts}
          onChange={setCategoryFilter}
        />
        {isLoading ? <StatusMessage message="Updating categories…" tone="info" /> : null}
        {successMessage ? <StatusMessage message={successMessage} tone="success" /> : null}
        {errorMessage ? (
          <StatusMessage message={errorMessage} tone="error" onClose={clearErrorMessage} />
        ) : null}
      </VStack>
    ),
    [
      categoryFilter,
      clearErrorMessage,
      errorMessage,
      handleClearSearch,
      isLoading,
      searchQuery,
      setCategoryFilter,
      setSearchQuery,
      successMessage,
      totalCounts,
    ],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<ManageCategoryListItem>) => {
      switch (item.kind) {
        case 'section':
          return <CategorySectionHeader item={item} />;
        case 'category':
          return (
            <CategoryItem
              category={item.category}
              disabled={isLoading}
              isMandatory={isMandatoryCategory(item.category)}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          );
        case 'investment':
          return (
            <InvestmentCategoryItem
              category={item.category}
              disabled={isLoading}
              isMandatory={isMandatoryInvestmentCategory(item.category)}
              onEdit={handleEditInvestmentCategory}
              onDelete={handleDeleteInvestmentCategory}
            />
          );
        case 'empty':
          return <CategoryEmptyState item={item} />;
      }
    },
    [
      handleDeleteCategory,
      handleDeleteInvestmentCategory,
      handleEditCategory,
      handleEditInvestmentCategory,
      isLoading,
      isMandatoryCategory,
      isMandatoryInvestmentCategory,
    ],
  );

  const keyExtractor = useCallback((item: ManageCategoryListItem) => item.key, []);
  const getItemType = useCallback((item: ManageCategoryListItem) => item.kind, []);

  return (
    <AnimatedFlashList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      extraData={isLoading}
      ListHeaderComponent={listHeader}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingTop: 118, paddingBottom: 176, paddingHorizontal: 16}}
      accessibilityRole="list"
    />
  );
}

function buildListItems(
  sections: CategorySectionDefinition[],
  searchQuery?: string,
  onClearSearch?: () => void,
): ManageCategoryListItem[] {
  const items: ManageCategoryListItem[] = [];
  const hasActiveSearch = Boolean(searchQuery && searchQuery.trim().length > 0);

  for (const section of sections) {
    items.push({
      kind: 'section',
      key: `section-${section.key}`,
      sectionKey: section.key,
      title: section.title,
      count: section.categories.length,
      icon: section.icon,
      accentColor: section.accentColor,
    });

    if (section.categories.length === 0) {
      items.push({
        kind: 'empty',
        key: `empty-${section.key}`,
        label: section.title.toLowerCase(),
        icon: section.icon,
        accentColor: section.accentColor,
        searchQuery: hasActiveSearch ? searchQuery : undefined,
        onClearSearch,
      });
      continue;
    }

    if (section.itemKind === 'investment') {
      for (const category of section.categories) {
        items.push({kind: 'investment', key: `investment-${category.id}`, category});
      }
      continue;
    }

    for (const category of section.categories) {
      items.push({kind: 'category', key: `${section.key}-${category.id}`, category});
    }
  }

  return items;
}

function CategorySectionHeader({item}: {item: Extract<ManageCategoryListItem, {kind: 'section'}>}) {
  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      paddingTop="$4"
      paddingBottom="$2.5">
      <HStack flex={1} minWidth={0} alignItems="center" gap="$2.5">
        <VStack
          width={36}
          height={36}
          borderRadius={12}
          alignItems="center"
          justifyContent="center"
          backgroundColor={createAlphaColor(item.accentColor, 0.12)}
          borderWidth={1}
          borderColor={createAlphaColor(item.accentColor, 0.28)}>
          <ThemedIonicon name={item.icon} size={18} color={item.accentColor} />
        </VStack>
        <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
          {item.title}
        </Text>
      </HStack>
      <CategoryCountBadge accentColor={item.accentColor} count={item.count} />
    </HStack>
  );
}

function CategoryEmptyState({item}: {item: Extract<ManageCategoryListItem, {kind: 'empty'}>}) {
  if (item.searchQuery) {
    return (
      <GlassSurface padding={20} borderRadius={18} style={{marginBottom: 10}}>
        <VStack minHeight={120} alignItems="center" justifyContent="center" gap="$2.5">
          <VStack
            width={48}
            height={48}
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            backgroundColor={createAlphaColor(item.accentColor, 0.12)}>
            <ThemedIonicon name="search-outline" size={22} color={item.accentColor} />
          </VStack>
          <Text variant="body1" color="$text" weight="bold" textAlign="center">
            No matching {item.label}
          </Text>
          <Text variant="body2" color="$textSecondary" textAlign="center">
            No categories match &quot;{item.searchQuery}&quot;.
          </Text>
          {item.onClearSearch ? (
            <Button
              variant="outline"
              size="small"
              onPress={item.onClearSearch}
              accessibilityLabel="Clear search text">
              Clear search
            </Button>
          ) : null}
        </VStack>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface padding={20} borderRadius={18} style={{marginBottom: 10}}>
      <VStack minHeight={116} alignItems="center" justifyContent="center" gap="$2.5">
        <VStack
          width={48}
          height={48}
          borderRadius={16}
          alignItems="center"
          justifyContent="center"
          backgroundColor={createAlphaColor(item.accentColor, 0.12)}>
          <ThemedIonicon name={item.icon} size={22} color={item.accentColor} />
        </VStack>
        <Text variant="body1" color="$text" weight="semibold" textAlign="center">
          No {item.label} yet
        </Text>
        <Text variant="body2" color="$textSecondary" textAlign="center">
          Add one when you need a custom label.
        </Text>
      </VStack>
    </GlassSurface>
  );
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
