import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React, {useEffect, useState} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {View} from 'tamagui';
import {FormField} from '@ravitamil/buddy-ui/FormField';

import {SectionTitle} from './DebtPayoffPrimitives';

export function ExtraPaymentSection({
  extraPayment,
  setExtraPayment,
  isDarkMode,
  currencySymbol,
}: {
  extraPayment: number;
  setExtraPayment: (value: number) => void;
  isDarkMode: boolean;
  currencySymbol: string;
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(extraPayment === 0 ? '' : extraPayment.toString());
  }, [extraPayment]);

  const handleTextChange = (text: string) => {
    if (text === '') {
      setInputValue('');
      setExtraPayment(0);
      return;
    }

    const numericValue = text.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const normalizedText =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : numericValue;
    const limitedText =
      parts.length === 2 && parts[1].length > 2
        ? `${parts[0]}.${parts[1].substring(0, 2)}`
        : normalizedText;

    setInputValue(limitedText);
    setExtraPayment(Number.parseFloat(limitedText) || 0);
  };

  return (
    <GlassSurface>
      <VStack gap="$4">
        <SectionTitle
          icon="cash"
          title="Extra Payment"
          color={isDarkMode ? '#4ECDC4' : '#2A9D8F'}
        />
        <VStack gap="$3">
          <FormField
            value={inputValue}
            onChangeText={handleTextChange}
            placeholder="Enter extra payment amount"
            keyboardType="decimal-pad"
            returnKeyType="done"
            testID="extra-payment"
            leftIcon={
              <HStack alignItems="center" gap="$2" style={{marginRight: 8, marginLeft: 8}}>
                <Text variant="body1" color="$textSecondary">
                  {currencySymbol}
                </Text>
                <Ionicons name="cash" size={20} color={isDarkMode ? '#ffffff' : '#1e293b'} />
              </HStack>
            }
          />
          <Text variant="caption" color="$textSecondary">
            Applying extra payments can reduce your payoff time and save on interest.
          </Text>
        </VStack>
      </VStack>
    </GlassSurface>
  );
}

export function ApplyStrategyButton({
  isGenerating,
  onApplyStrategy,
}: {
  isGenerating: boolean;
  onApplyStrategy: () => void;
}) {
  return (
    <View
      accessibilityRole="button"
      accessibilityState={{disabled: isGenerating}}
      onPress={onApplyStrategy}
      disabled={isGenerating}
      pressStyle={{opacity: 0.8}}
      marginVertical="$4">
      <LinearGradient
        colors={isGenerating ? ['#9E9E9E', '#757575'] : ['#4CAF50', '#2E7D32']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{paddingVertical: 16, borderRadius: 12, alignItems: 'center'}}>
        <HStack alignItems="center" gap="$2">
          <Ionicons
            name={isGenerating ? 'hourglass-outline' : 'checkmark-circle-outline'}
            size={20}
            color="white"
          />
          <Text variant="body1" color="white" weight="bold">
            {isGenerating ? 'Generating...' : 'Apply Strategy'}
          </Text>
        </HStack>
      </LinearGradient>
    </View>
  );
}
