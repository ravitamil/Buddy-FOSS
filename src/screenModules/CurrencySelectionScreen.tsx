import React, {useState, useMemo, useCallback} from 'react';
import {YStack, XStack} from 'tamagui';
import {useRouter} from 'expo-router';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {KeyboardStickyView} from 'react-native-keyboard-controller';
import {ScreenContainer, CustomNavigationHeader} from '../components/ui';
import {Button, Text} from '@ravitamil/buddy-ui';
import {useSettings} from '../context';
import {generateCurrencyList} from '../constants/currencies';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CurrencyPickerContent} from '../features/settings';

const CurrencySelectionScreen = () => {
  const router = useRouter();
  const {currency, updateCurrency} = useSettings();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const {onScroll, headerProps} = useProgressiveBlurHeader({
    headerHeight: 75,
    largeTitleFadeDistance: 40,
    showBackButtonInNonBlur: true,
  });

  const currencies = useMemo(() => generateCurrencyList(), []);

  const hasChanges = selectedCurrency !== currency;

  const handleSave = useCallback(() => {
    if (selectedCurrency && hasChanges) {
      void updateCurrency(selectedCurrency).then(() => {
        router.back();
      });
    }
  }, [selectedCurrency, hasChanges, updateCurrency, router]);

  const handleCurrencySelect = useCallback((currencyCode: string) => {
    setSelectedCurrency(currencyCode);
  }, []);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <CustomNavigationHeader
        title="Select Currency"
        subtitle="Choose your preferred currency"
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
      />

      <CurrencyPickerContent
        currencies={currencies}
        searchQuery={searchQuery}
        selectedCurrency={selectedCurrency}
        bottomPadding={insets.bottom + 140}
        onSearchChange={setSearchQuery}
        onCurrencySelect={handleCurrencySelect}
        onScroll={onScroll}
      />

      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: 0,
        }}>
        <YStack
          backgroundColor="$background"
          paddingHorizontal={24}
          paddingTop={16}
          paddingBottom={insets.bottom + 16}
          borderTopWidth={1}
          borderTopColor="$borderColor"
          gap="$3"
          width="100%">
          <Button
            onPress={handleSave}
            disabled={!hasChanges}
            backgroundColor={hasChanges ? '$green6' : '$gray4'}
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$4"
            opacity={hasChanges ? 1 : 0.7}
            borderWidth={0}
            height={48}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name="checkmark" size={18} color="white" />
              <Text color="white" fontSize="$4" weight="bold">
                Save
              </Text>
            </XStack>
          </Button>
        </YStack>
      </KeyboardStickyView>
    </ScreenContainer>
  );
};

export default CurrencySelectionScreen;
