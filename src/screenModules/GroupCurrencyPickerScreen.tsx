import React, {useState, useMemo, useCallback} from 'react';
import {useRouter, useLocalSearchParams, Stack} from 'expo-router';
import type {Href} from 'expo-router';
import {ScreenContainer, CustomNavigationHeader} from '../components/ui';
import {generateCurrencyList, isFxSupportedCurrency} from '../constants/currencies';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {logger as appLogger} from '../services/LoggerService';
import {CurrencyPickerContent} from '../features/settings';

const GroupCurrencyPickerScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{currentCurrency: string; returnTo: string}>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCurrency = params.currentCurrency || 'USD';

  const {onScroll, headerProps} = useProgressiveBlurHeader({
    headerHeight: 75,
    largeTitleFadeDistance: 40,
    showBackButtonInNonBlur: true,
  });

  const currencies = useMemo(() => {
    return generateCurrencyList().filter((currency) => isFxSupportedCurrency(currency.code));
  }, []);

  const handleSelect = useCallback(
    (currencyCode: string) => {
      appLogger.debug('💱 GroupCurrencyPicker: Selected currency:', currencyCode);
      const returnTo = params.returnTo || 'add-group';

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      router.replace({
        pathname: returnTo,
        params: {selectedCurrency: currencyCode},
      } as Href);
    },
    [params.returnTo, router],
  );

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <Stack.Screen options={{headerShown: false}} />
      <CustomNavigationHeader
        title="Group Currency"
        subtitle="Select currency for this group"
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
      />

      <CurrencyPickerContent
        currencies={currencies}
        searchQuery={searchQuery}
        selectedCurrency={selectedCurrency}
        bottomPadding={insets.bottom + 40}
        onSearchChange={setSearchQuery}
        onCurrencySelect={handleSelect}
        onScroll={onScroll}
      />
    </ScreenContainer>
  );
};

export default GroupCurrencyPickerScreen;
