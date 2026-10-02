import React, {useCallback, useMemo} from 'react';
import {FlashList} from '@shopify/flash-list';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import Animated from 'react-native-reanimated';
import {XStack, YStack, useTheme} from 'tamagui';
import type {FlashListProps} from '@shopify/flash-list';

import {Button, Input, Text} from '@ravitamil/buddy-ui';
import {getCurrencySymbol} from '@/constants/currencies';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export interface CurrencyPickerOption {
  code: string;
  name: string;
  symbol?: string;
}

interface CurrencyPickerContentProps {
  currencies: CurrencyPickerOption[];
  searchQuery: string;
  selectedCurrency: string;
  bottomPadding: number;
  onSearchChange: (value: string) => void;
  onCurrencySelect: (currencyCode: string) => void;
  onScroll?: FlashListProps<CurrencyPickerOption>['onScroll'];
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<CurrencyPickerOption>);

const CurrencySearch = React.memo(
  ({
    value,
    onChange,
    isDarkMode,
  }: {
    value: string;
    onChange: (text: string) => void;
    isDarkMode: boolean;
  }) => {
    const theme = useTheme();

    return (
      <YStack paddingHorizontal={24} paddingBottom={8}>
        <XStack
          alignItems="center"
          backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'}
          borderWidth={1}
          borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}
          borderRadius="$4"
          paddingHorizontal="$4"
          height={56}
          focusStyle={{
            borderColor: '$green6',
            borderWidth: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          }}>
          <Ionicons
            name="search"
            size={20}
            color={String(theme.color11?.val ?? theme.color?.val)}
          />
          <Input
            accessibilityLabel="Search currencies"
            chrome={false}
            flex={1}
            placeholder="Search currencies..."
            value={value}
            onChangeText={onChange}
            fontSize="$4"
            paddingLeft="$3"
            color="$color"
            placeholderTextColor={isDarkMode ? '$color10' : '$gray9'}
          />
        </XStack>
      </YStack>
    );
  },
);

export function CurrencyPickerContent({
  currencies,
  searchQuery,
  selectedCurrency,
  bottomPadding,
  onSearchChange,
  onCurrencySelect,
  onScroll,
}: CurrencyPickerContentProps) {
  const {isDarkMode} = useTamaguiTheme();

  const displayCurrencies = useMemo(
    () =>
      currencies.map((currency) => ({
        ...currency,
        symbol: currency.symbol || getCurrencySymbol(currency.code),
      })),
    [currencies],
  );

  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return displayCurrencies;

    return displayCurrencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) || currency.name.toLowerCase().includes(query),
    );
  }, [displayCurrencies, searchQuery]);

  const renderCurrencyItem = useCallback(
    ({item}: {item: CurrencyPickerOption}) => {
      const isSelected = selectedCurrency === item.code;

      return (
        <Button
          key={item.code}
          variant="outline"
          backgroundColor={isSelected ? '$green7' : '$background'}
          borderColor={isSelected ? '$green8' : isDarkMode ? '$color7' : '$gray6'}
          onPress={() => onCurrencySelect(item.code)}
          justifyContent="flex-start"
          paddingHorizontal="$4"
          paddingVertical="$4"
          height={72}
          marginHorizontal={24}
          marginVertical={4}
          borderRadius="$4"
          hoverStyle={{
            backgroundColor: isSelected
              ? isDarkMode
                ? '$green7'
                : '$green3'
              : isDarkMode
                ? '$color2'
                : '$gray1',
          }}
          pressStyle={{
            backgroundColor: isSelected
              ? isDarkMode
                ? '$green8'
                : '$green4'
              : isDarkMode
                ? '$color3'
                : '$gray2',
            opacity: 0.9,
          }}>
          <XStack alignItems="center" gap="$4" flex={1}>
            <YStack
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor={
                isSelected ? 'rgba(255, 255, 255, 0.2)' : isDarkMode ? '$color5' : '$gray5'
              }
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              style={{borderRadius: 24}}>
              <Text
                fontSize="$5"
                fontWeight="700"
                color={isSelected ? 'white' : isDarkMode ? '$color12' : '$gray11'}>
                {item.symbol}
              </Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="600" color={isSelected ? 'white' : '$color'}>
                {item.code}
              </Text>
              <Text
                fontSize="$3"
                color={isSelected ? 'rgba(255, 255, 255, 0.8)' : '$color11'}
                numberOfLines={1}>
                {item.name}
              </Text>
            </YStack>
            {isSelected && (
              <YStack
                width={24}
                height={24}
                borderRadius={12}
                backgroundColor="$green7"
                alignItems="center"
                justifyContent="center">
                <Ionicons name="checkmark" size={16} color="white" />
              </YStack>
            )}
          </XStack>
        </Button>
      );
    },
    [isDarkMode, onCurrencySelect, selectedCurrency],
  );

  return (
    <>
      <YStack paddingTop={75}>
        <CurrencySearch value={searchQuery} onChange={onSearchChange} isDarkMode={isDarkMode} />
      </YStack>

      <AnimatedFlashList
        data={filteredCurrencies}
        renderItem={renderCurrencyItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.code}
        extraData={selectedCurrency}
        onScroll={onScroll}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: bottomPadding,
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
}
