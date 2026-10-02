import {VStack} from '@ravitamil/buddy-ui';
import React, {useState} from 'react';
import {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';
import {router} from 'expo-router';
import {YStack} from 'tamagui';

import {ScreenContainer, CustomNavigationHeader, ScreenWrapper} from '../components/ui';
import {useInvestment} from '../context';
import {useAlert} from '../hooks/useAlert';
import {InvestmentType} from '../types';
import {logger as appLogger} from '../services/LoggerService';
import {
  AddInvestmentDatePicker,
  AddInvestmentInputField,
  AddInvestmentSaveButton,
  AddInvestmentTypeSelector,
  investmentTypes,
} from '../features/investments';

export default function AddInvestmentScreen() {
  const {investmentCategories, addInvestment} = useInvestment();
  const {showAlert} = useAlert();

  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('stocks');
  const [amount, setAmount] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [symbol, setSymbol] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerProps = {
    scrollY,
    enableProgressiveBlur: true,
  };

  const handleSave = async () => {
    if (!name.trim() || !amount || !purchaseAmount) {
      showAlert({
        title: 'Error',
        message: 'Please fill in all required fields',
        actions: [{text: 'OK', onPress: () => {}}],
      });
      return;
    }

    const amountValue = parseFloat(amount);
    const purchaseAmountValue = parseFloat(purchaseAmount);

    if (
      isNaN(amountValue) ||
      isNaN(purchaseAmountValue) ||
      amountValue <= 0 ||
      purchaseAmountValue <= 0
    ) {
      showAlert({
        title: 'Error',
        message: 'Please enter valid amounts',
        actions: [{text: 'OK', onPress: () => {}}],
      });
      return;
    }

    // Find appropriate category based on investment type
    const category =
      investmentCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(type.toLowerCase()) ||
          cat.name
            .toLowerCase()
            .includes(investmentTypes.find((t) => t.value === type)?.label.toLowerCase() || ''),
      ) || investmentCategories[0];

    if (!category) {
      showAlert({
        title: 'Error',
        message: 'No investment category found. Please set up investment categories first.',
        actions: [{text: 'OK', onPress: () => {}}],
      });
      return;
    }

    setLoading(true);
    try {
      const quantityValue = quantity ? parseFloat(quantity) : 1;
      const currentPriceValue = amountValue / quantityValue;
      const purchasePriceValue = purchaseAmountValue / quantityValue;

      await addInvestment({
        name: name.trim(),
        categoryId: category.id,
        category: category,
        type,
        amount: amountValue,
        purchaseAmount: purchaseAmountValue,
        quantity: quantityValue,
        currentPrice: currentPriceValue,
        purchasePrice: purchasePriceValue,
        purchaseDate,
        currency: 'USD', // Default currency
        symbol: symbol.trim() || undefined,
        platform: platform.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true,
      });

      showAlert({
        title: 'Success',
        message: 'Investment added successfully!',
        actions: [{text: 'OK', onPress: () => router.back()}],
      });
    } catch (error) {
      appLogger.error('Error adding investment:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to add investment. Please try again.',
        actions: [{text: 'OK', onPress: () => {}}],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Add Investment"
        subtitle="Track your portfolio growth"
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="aware-scroll"
        onScroll={onScroll}
        scrollViewStyle={{flex: 1, backgroundColor: 'transparent'}}
        contentContainerStyle={{flexGrow: 1, paddingTop: 118, paddingBottom: 100}}
        keyboardBottomOffset={100}>
        <VStack flex={1} padding="$4" gap="$4">
          {/* Form Fields */}
          <YStack gap="$4">
            <AddInvestmentInputField
              label="Investment Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Apple Inc. Stock, SBI Bluechip Fund"
              required
            />
            <AddInvestmentTypeSelector type={type} onTypeChange={setType} />
            <AddInvestmentInputField
              label="Current Value"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              required
            />
            <AddInvestmentInputField
              label="Purchase Amount"
              value={purchaseAmount}
              onChangeText={setPurchaseAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              required
            />
            <AddInvestmentDatePicker
              purchaseDate={purchaseDate}
              showDatePicker={showDatePicker}
              onOpen={() => setShowDatePicker(true)}
              onShowDatePickerChange={setShowDatePicker}
              onPurchaseDateChange={setPurchaseDate}
            />
            <AddInvestmentInputField
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Number of units/shares (optional)"
              keyboardType="decimal-pad"
            />
            <AddInvestmentInputField
              label="Symbol/Code"
              value={symbol}
              onChangeText={setSymbol}
              placeholder="e.g., AAPL, SBIN (optional)"
            />
            <AddInvestmentInputField
              label="Platform/Broker"
              value={platform}
              onChangeText={setPlatform}
              placeholder="e.g., Zerodha, Groww (optional)"
            />
            <AddInvestmentInputField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional information (optional)"
            />
          </YStack>

          <AddInvestmentSaveButton
            loading={loading}
            onPress={() => {
              void handleSave();
            }}
          />
        </VStack>
      </ScreenWrapper>
    </ScreenContainer>
  );
}
