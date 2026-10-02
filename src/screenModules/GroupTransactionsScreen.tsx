import {FloatingAction, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {Platform, TextInput} from 'react-native';
import Animated from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScrollView, View} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {GroupEmptyState} from '@/features/groups/components/GroupEmptyState';
import {
  type GroupAllTransactionsFilter,
  useGroupTransactionsScreen,
} from '@/features/groups/hooks/useGroupTransactionsScreen';
import {GroupTransactionItem} from '@/features/groups/components/GroupTransactionItem';
import {getFontFamilyForWeight} from '@/utils/fonts';

interface GroupTransactionsScreenProps {
  groupId: string;
}

const filterOptions: {
  id: GroupAllTransactionsFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {id: 'all', label: 'All', icon: 'layers-outline'},
  {id: 'expense', label: 'Expenses', icon: 'receipt-outline'},
  {id: 'payment', label: 'Transfers', icon: 'swap-horizontal-outline'},
  {id: 'paid_by_me', label: 'Paid by me', icon: 'arrow-up-outline'},
  {id: 'my_share', label: 'My share', icon: 'people-outline'},
];

export const GroupTransactionsScreen = ({groupId}: GroupTransactionsScreenProps) => {
  const screen = useGroupTransactionsScreen({groupId});

  if (!screen.group && !screen.isLoading) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea edges={['bottom']}>
        <CustomNavigationHeader
          title="Group Transactions"
          subtitle="Not found"
          onBackPress={screen.onBack}
        />
        <VStack flex={1} justifyContent="center" alignItems="center" padding={20} gap="$4">
          <GroupEmptyState
            iconName="people-outline"
            title="Group Not Found"
            subtitle="Unable to load transactions for this group."
            ctaLabel="Go Back"
            onCtaPress={screen.onBack}
          />
        </VStack>
      </ScreenContainer>
    );
  }

  const {isDarkMode, summary} = screen;
  const isNetPositive = summary.netBalance > 0.01;
  const isNetNegative = summary.netBalance < -0.01;

  const netColor = isNetPositive
    ? isDarkMode
      ? '#4ADE80'
      : '#16A34A'
    : isNetNegative
      ? isDarkMode
        ? '#F87171'
        : '#DC2626'
      : isDarkMode
        ? '#9CA3AF'
        : '#6B7280';

  const pillBg = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const pillBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea edges={['bottom']}>
        <CustomNavigationHeader
          title="All Transactions"
          largeTitle="All Transactions"
          subtitle={screen.group ? `${screen.group.emoji || '👥'} ${screen.group.name}` : ''}
          mode="collapsing"
          {...screen.headerProps}
          onBackPress={screen.onBack}
          rightElement={
            <View
              accessibilityRole="button"
              accessibilityLabel={screen.isSearchOpen ? 'Close search' : 'Open search'}
              onPress={() => screen.setIsSearchOpen(!screen.isSearchOpen)}
              pressStyle={{opacity: 0.75, scale: 0.94}}
              width={38}
              height={38}
              borderRadius={19}
              backgroundColor={screen.isSearchOpen ? pillBg : 'transparent'}
              borderWidth={screen.isSearchOpen ? 1 : 0}
              borderColor={pillBorder}
              alignItems="center"
              justifyContent="center">
              <Ionicons
                name={screen.isSearchOpen ? 'close' : 'search-outline'}
                size={20}
                color={isDarkMode ? '#FFFFFF' : '#111827'}
              />
            </View>
          }
        />

        <Animated.ScrollView
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{paddingTop: 118, paddingBottom: 120}}
          scrollEventThrottle={16}
          onScroll={screen.onScroll}>
          <VStack flex={1} paddingHorizontal={18} gap="$4">
            {/* Search Bar Input (Collapsible) */}
            {screen.isSearchOpen ? (
              <GlassSurface padding={12}>
                <HStack alignItems="center" gap="$2.5">
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'}
                  />
                  <TextInput
                    accessibilityLabel="Search group transactions"
                    value={screen.searchQuery}
                    onChangeText={screen.setSearchQuery}
                    placeholder="Search by description, category, or member..."
                    placeholderTextColor={
                      isDarkMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'
                    }
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontFamily: getFontFamilyForWeight('500'),
                      color: isDarkMode ? '#FFFFFF' : '#111827',
                      paddingVertical: Platform.OS === 'android' ? 4 : 2,
                      paddingHorizontal: 0,
                      margin: 0,
                      borderWidth: 0,
                      backgroundColor: 'transparent',
                    }}
                    underlineColorAndroid="transparent"
                    autoFocus
                  />
                  {screen.searchQuery.length > 0 ? (
                    <View
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      onPress={() => screen.setSearchQuery('')}
                      pressStyle={{opacity: 0.7}}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'}
                      />
                    </View>
                  ) : null}
                </HStack>
              </GlassSurface>
            ) : null}

            {/* Live Financial Summary Card */}
            <GlassSurface padding={16}>
              <VStack gap="$3.5">
                {/* Total Group Expenses Hero */}
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack gap="$1">
                    <Text
                      variant="caption"
                      color="$textSecondary"
                      weight="bold"
                      letterSpacing={0.8}
                      textTransform="uppercase">
                      Total Group Expenses
                    </Text>
                    <Text variant="h3" color="$text" weight="bold">
                      {screen.formatCurrency(summary.totalExpenses)}
                    </Text>
                  </VStack>

                  <HStack
                    alignItems="center"
                    gap="$1.5"
                    paddingHorizontal={10}
                    paddingVertical={4}
                    borderRadius={12}
                    backgroundColor={pillBg}
                    borderWidth={1}
                    borderColor={pillBorder}>
                    <Ionicons
                      name="receipt-outline"
                      size={13}
                      color={isDarkMode ? '#4ECDC4' : '#2D8982'}
                    />
                    <Text fontSize={12} weight="bold" color="$textSecondary">
                      {summary.totalCount} txns
                    </Text>
                  </HStack>
                </HStack>

                {/* 3 Metrics Row */}
                <HStack
                  paddingTop="$3"
                  borderTopWidth={1}
                  borderTopColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
                  justifyContent="space-between"
                  alignItems="center">
                  {/* You Paid */}
                  <VStack gap="$0.5">
                    <Text variant="caption" color="$textSecondary" weight="medium">
                      You Paid
                    </Text>
                    <Text variant="body1" color="$green5" weight="bold">
                      {screen.formatCurrency(summary.userPaid)}
                    </Text>
                  </VStack>

                  {/* Your Share */}
                  <VStack gap="$0.5">
                    <Text variant="caption" color="$textSecondary" weight="medium">
                      Your Share
                    </Text>
                    <Text variant="body1" color="$blue5" weight="bold">
                      {screen.formatCurrency(summary.userShare)}
                    </Text>
                  </VStack>

                  {/* Net Balance */}
                  <VStack gap="$0.5" alignItems="flex-end">
                    <Text variant="caption" color="$textSecondary" weight="medium">
                      Net Position
                    </Text>
                    <Text variant="body1" style={{color: netColor}} weight="bold">
                      {isNetPositive ? '+' : ''}
                      {screen.formatCurrency(summary.netBalance)}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </GlassSurface>

            {/* Filter Capsule Tabs Carousel */}
            <ScrollView
              removeClippedSubviews={false}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 2}}>
              <HStack gap="$2">
                {filterOptions.map((filter) => {
                  const isActive = screen.activeFilter === filter.id;
                  return (
                    <HStack
                      key={filter.id}
                      accessibilityRole="button"
                      accessibilityState={{selected: isActive}}
                      accessibilityLabel={`Filter by ${filter.label}`}
                      onPress={() => screen.setActiveFilter(filter.id)}
                      pressStyle={{opacity: 0.85, scale: 0.96}}
                      alignItems="center"
                      gap="$1.5"
                      paddingHorizontal={14}
                      paddingVertical={8}
                      borderRadius={18}
                      backgroundColor={
                        isActive
                          ? isDarkMode
                            ? 'rgba(78, 205, 196, 0.22)'
                            : 'rgba(78, 205, 196, 0.16)'
                          : pillBg
                      }
                      borderWidth={1}
                      borderColor={isActive ? (isDarkMode ? '#4ECDC4' : '#2D8982') : pillBorder}>
                      <Ionicons
                        name={filter.icon}
                        size={14}
                        color={
                          isActive
                            ? isDarkMode
                              ? '#4ECDC4'
                              : '#2D8982'
                            : isDarkMode
                              ? 'rgba(255, 255, 255, 0.6)'
                              : 'rgba(0, 0, 0, 0.5)'
                        }
                      />
                      <Text
                        fontSize={13}
                        weight={isActive ? 'bold' : 'medium'}
                        color={isActive ? (isDarkMode ? '#4ECDC4' : '#2D8982') : '$textSecondary'}>
                        {filter.label}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </ScrollView>

            {/* Transactions Header & List */}
            <VStack gap="$2.5">
              <HStack justifyContent="space-between" alignItems="center" paddingHorizontal={2}>
                <Text
                  variant="caption"
                  color="$textSecondary"
                  weight="bold"
                  letterSpacing={0.8}
                  textTransform="uppercase">
                  Transactions ({screen.filteredTransactions.length})
                </Text>
                {screen.searchQuery ? (
                  <Text variant="caption" color="$iconBrand" weight="medium">
                    Filtered by "{screen.searchQuery}"
                  </Text>
                ) : null}
              </HStack>

              {screen.filteredTransactions.length > 0 ? (
                <VStack gap="$2">
                  {screen.filteredTransactions.map((transaction) => {
                    const item = screen.getTransactionItem(transaction);
                    if (!item) return null;
                    return (
                      <GroupTransactionItem
                        key={transaction.id}
                        {...item}
                        formatCurrency={screen.formatCurrency}
                        onPress={() => screen.onTransactionPress(transaction.id)}
                      />
                    );
                  })}
                </VStack>
              ) : (
                <GroupEmptyState
                  iconName="receipt-outline"
                  title={
                    screen.searchQuery
                      ? 'No Matching Transactions'
                      : screen.activeFilter !== 'all'
                        ? 'No Transactions in this Filter'
                        : 'No Transactions Yet'
                  }
                  subtitle={
                    screen.searchQuery
                      ? `No results found for "${screen.searchQuery}". Try a different keyword.`
                      : 'Tap the button below to add your first expense or transfer.'
                  }
                  ctaLabel="Add Expense"
                  onCtaPress={screen.onAddTransaction}
                />
              )}
            </VStack>
          </VStack>
        </Animated.ScrollView>

        <FloatingAction
          presentation="circular"
          icon="add"
          position="right"
          variant="info"
          onPress={screen.onAddTransaction}
          isScrollingDown={screen.isScrollingDown}
        />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
};

export default GroupTransactionsScreen;
