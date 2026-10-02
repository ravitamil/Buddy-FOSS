import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {GlassSurface, SearchField, Text} from '@ravitamil/buddy-ui';
import {FlashList} from '@shopify/flash-list';
import {XStack, YStack} from 'tamagui';

import {generateCurrencyList} from '@/constants/currencies';
import {OnboardingActionBar, OnboardingStepHeader, ThemedIonicon} from './OnboardingStepChrome';

interface CurrencyPreferenceStepProps {
  currencyPreference: string;
  onCurrencyChange: (currency: string) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyRowProps {
  currency: Currency;
  selected: boolean;
  onPress: () => void;
}

function CurrencyRow({currency, selected, onPress}: CurrencyRowProps) {
  return (
    <XStack
      accessibilityRole="radio"
      accessibilityLabel={`${currency.code}, ${currency.name}`}
      accessibilityState={{selected}}
      onPress={onPress}
      pressStyle={{scale: 0.99, backgroundColor: '$surfacePress'}}
      minHeight={68}
      alignItems="center"
      gap="$3"
      marginHorizontal="$4"
      marginVertical="$1"
      paddingHorizontal="$3.5"
      paddingVertical="$2.5"
      borderRadius="$4"
      borderWidth={1}
      borderColor={selected ? '$primary' : '$borderColor'}
      backgroundColor={selected ? '$surfacePress' : '$surface'}>
      <YStack
        width={44}
        height={44}
        borderRadius={22}
        alignItems="center"
        justifyContent="center"
        backgroundColor={selected ? '$primary' : '$backgroundPress'}>
        <Text variant="h5" weight="bold" color={selected ? '$buttonPrimaryText' : '$text'}>
          {currency.symbol}
        </Text>
      </YStack>

      <YStack flex={1} gap="$0.5">
        <Text variant="body1" weight="semibold" color="$text">
          {currency.code}
        </Text>
        <Text variant="body2" color="$textSecondary" numberOfLines={1}>
          {currency.name}
        </Text>
      </YStack>

      <YStack
        width={28}
        height={28}
        borderRadius={14}
        borderWidth={1.5}
        borderColor={selected ? '$primary' : '$borderColor'}
        backgroundColor={selected ? '$primary' : 'transparent'}
        alignItems="center"
        justifyContent="center">
        {selected ? <ThemedIonicon name="checkmark" size={17} color="$buttonPrimaryText" /> : null}
      </YStack>
    </XStack>
  );
}

const POPULAR_CURRENCIES = [
  {code: 'INR', symbol: '₹', name: 'Indian Rupee'},
  {code: 'USD', symbol: '$', name: 'US Dollar'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'GBP', symbol: '£', name: 'British Pound'},
  {code: 'AED', symbol: 'د.إ', name: 'UAE Dirham'},
  {code: 'CAD', symbol: '$', name: 'Canadian Dollar'},
] as const;

export const CurrencyPreferenceStep: React.FC<CurrencyPreferenceStepProps> = ({
  currencyPreference,
  onCurrencyChange,
  onNext,
  onBack,
  errors,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currencyPreference);
  const currencies = useMemo<Currency[]>(() => generateCurrencyList(), []);
  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return currencies;

    return currencies.filter(
      (currency) =>
        currency.code.toLocaleLowerCase().includes(query) ||
        currency.name.toLocaleLowerCase().includes(query) ||
        currency.symbol.toLocaleLowerCase().includes(query),
    );
  }, [currencies, searchQuery]);

  useEffect(() => {
    setSelectedCurrency(currencyPreference);
  }, [currencyPreference]);

  const selectCurrency = useCallback(
    (currencyCode: string) => {
      setSelectedCurrency(currencyCode);
      onCurrencyChange(currencyCode);
    },
    [onCurrencyChange],
  );

  const handleContinue = useCallback(() => {
    if (!selectedCurrency) return;
    onCurrencyChange(selectedCurrency);
    onNext();
  }, [onCurrencyChange, onNext, selectedCurrency]);

  return (
    <YStack flex={1}>
      <YStack paddingHorizontal="$4" paddingBottom="$3" gap="$3">
        <OnboardingStepHeader
          currentStep={2}
          title="Home currency"
          subtitle="We’ll use it for totals and insights. Individual wallets can still use other currencies."
        />

        {/* Quick Popular Currencies Pill Row */}
        {!searchQuery ? (
          <YStack gap="$1.5">
            <Text variant="caption" weight="semibold" color="$textSecondary" letterSpacing={0.5}>
              POPULAR CHOICES
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {POPULAR_CURRENCIES.map((cur) => {
                const isSelected = selectedCurrency === cur.code;
                return (
                  <XStack
                    key={cur.code}
                    onPress={() => selectCurrency(cur.code)}
                    pressStyle={{scale: 0.96, opacity: 0.85}}
                    alignItems="center"
                    gap="$1.5"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={isSelected ? '$primary' : '$borderColor'}
                    backgroundColor={isSelected ? '$surfacePress' : '$glassSurfaceFill'}>
                    <Text variant="body2" weight="bold" color={isSelected ? '$iconBrand' : '$text'}>
                      {cur.symbol}
                    </Text>
                    <Text
                      variant="body2"
                      weight="semibold"
                      color={isSelected ? '$iconBrand' : '$textSecondary'}>
                      {cur.code}
                    </Text>
                  </XStack>
                );
              })}
            </XStack>
          </YStack>
        ) : null}

        <GlassSurface padding={10} testID="onboarding-currency-search-card">
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by currency, code or symbol"
            onClear={() => setSearchQuery('')}
            testID="onboarding-currency-search"
          />
        </GlassSurface>

        {errors.currencyPreference ? (
          <Text variant="caption" color="$error" accessibilityLiveRegion="polite">
            {errors.currencyPreference}
          </Text>
        ) : null}
      </YStack>

      <YStack flex={1} accessibilityRole="radiogroup">
        <FlashList
          data={filteredCurrencies}
          renderItem={({item}) => (
            <CurrencyRow
              currency={item}
              selected={selectedCurrency === item.code}
              onPress={() => selectCurrency(item.code)}
            />
          )}
          keyExtractor={(item) => item.code}
          extraData={selectedCurrency}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 12}}
          ListEmptyComponent={
            <YStack paddingHorizontal="$4" paddingTop="$4">
              <GlassSurface padding={24} testID="onboarding-currency-empty-state">
                <YStack alignItems="center" gap="$2">
                  <ThemedIonicon name="search-outline" size={30} color="$textSecondary" />
                  <Text variant="h5" weight="semibold" align="center" color="$text">
                    No currency found
                  </Text>
                  <Text variant="body2" align="center" color="$textSecondary">
                    Try a code like USD or search by currency name.
                  </Text>
                </YStack>
              </GlassSurface>
            </YStack>
          }
        />
      </YStack>

      <OnboardingActionBar
        onBack={onBack}
        onContinue={handleContinue}
        continueLabel="Finish setup"
        continueDisabled={!selectedCurrency}
      />
    </YStack>
  );
};
