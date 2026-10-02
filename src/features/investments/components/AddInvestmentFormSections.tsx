import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated from 'react-native-reanimated';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, XStack, YStack} from 'tamagui';

import {FormField} from '@ravitamil/buddy-ui/FormField';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {InvestmentType} from '@/types';

import {investmentTypes} from '../constants';

interface AddInvestmentInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  required?: boolean;
}

export const AddInvestmentInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  required = false,
}: AddInvestmentInputFieldProps) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <YStack gap="$2">
      <Text variant="body1" color="$text" weight="semibold">
        {label} {required && <Text color="#FF5722">*</Text>}
      </Text>
      <GlassBackdrop
        intensity={isDarkMode ? 40 : 80}
        tint={isDarkMode ? 'dark' : 'light'}
        style={{borderRadius: 12, overflow: 'hidden'}}>
        <FormField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          testID="investment-input"
        />
      </GlassBackdrop>
    </YStack>
  );
};

interface AddInvestmentDatePickerProps {
  purchaseDate: Date;
  showDatePicker: boolean;
  onOpen: () => void;
  onShowDatePickerChange: (show: boolean) => void;
  onPurchaseDateChange: (date: Date) => void;
}

export const AddInvestmentDatePicker = ({
  purchaseDate,
  showDatePicker,
  onOpen,
  onShowDatePickerChange,
  onPurchaseDateChange,
}: AddInvestmentDatePickerProps) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <YStack gap="$2">
      <Text variant="body1" color="$text" weight="semibold">
        Purchase Date
      </Text>
      <View
        accessibilityRole="button"
        accessibilityLabel="Select purchase date"
        onPress={onOpen}
        pressStyle={{opacity: 0.7}}>
        <GlassBackdrop
          intensity={isDarkMode ? 40 : 80}
          tint={isDarkMode ? 'dark' : 'light'}
          style={{borderRadius: 12, overflow: 'hidden'}}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            padding="$4"
            backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'}>
            <Text variant="body1" color="$text">
              {purchaseDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#fff' : '#000'} />
          </XStack>
        </GlassBackdrop>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={purchaseDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, selectedDate) => {
            onShowDatePickerChange(Platform.OS === 'ios');
            if (selectedDate) {
              onPurchaseDateChange(selectedDate);
            }
          }}
        />
      )}
    </YStack>
  );
};

export const AddInvestmentTypeSelector = ({
  type,
  onTypeChange,
}: {
  type: InvestmentType;
  onTypeChange: (type: InvestmentType) => void;
}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <YStack gap="$2">
      <Text variant="body1" color="$text" weight="semibold">
        Investment Type <Text color="#FF5722">*</Text>
      </Text>
      <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {investmentTypes.map((item) => (
            <View
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{selected: type === item.value}}
              accessibilityLabel={`Select ${item.label} investment type`}
              onPress={() => onTypeChange(item.value)}
              pressStyle={{opacity: 0.7}}>
              <GlassBackdrop
                intensity={isDarkMode ? 40 : 80}
                tint={isDarkMode ? 'dark' : 'light'}
                style={{borderRadius: 20, overflow: 'hidden'}}>
                <LinearGradient
                  colors={
                    type === item.value
                      ? ['#4CAF50', '#66BB6A']
                      : isDarkMode
                        ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']
                        : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}>
                  <Text
                    variant="body2"
                    color={type === item.value ? 'white' : '$text'}
                    weight={type === item.value ? 'semibold' : 'normal'}>
                    {item.label}
                  </Text>
                </LinearGradient>
              </GlassBackdrop>
            </View>
          ))}
        </XStack>
      </Animated.ScrollView>
    </YStack>
  );
};

export const AddInvestmentSaveButton = ({
  loading,
  onPress,
}: {
  loading: boolean;
  onPress: () => void;
}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={loading ? 'Adding investment' : 'Add investment'}
      onPress={onPress}
      disabled={loading}
      pressStyle={{opacity: 0.8}}
      marginTop={24}>
      <GlassBackdrop
        intensity={80}
        tint={isDarkMode ? 'dark' : 'light'}
        style={{borderRadius: 16, overflow: 'hidden'}}>
        <LinearGradient
          colors={loading ? ['#9E9E9E', '#757575'] : ['#4CAF50', '#66BB6A']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
          }}>
          {loading && <Ionicons name="refresh" size={20} color="white" />}
          <Text variant="h5" color="white" weight="semibold">
            {loading ? 'Adding Investment...' : 'Add Investment'}
          </Text>
        </LinearGradient>
      </GlassBackdrop>
    </View>
  );
};
