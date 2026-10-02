import React, {useEffect, useRef, useState} from 'react';
import {Input, Text} from '@ravitamil/buddy-ui';
import {View, XStack, YStack} from 'tamagui';

interface OtpCodeInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  value: string;
  onChange: (otp: string) => void;
}

export function OtpCodeInput({length = 6, onComplete, value, onChange}: OtpCodeInputProps) {
  const inputRef = useRef<React.ElementRef<typeof Input>>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(numericText);
  };

  const isActiveBox = (index: number) => {
    if (isFocused) {
      if (value.length === length) return index === length - 1;
      return index === value.length;
    }

    return value.length > 0 && index === value.length - 1;
  };

  return (
    <YStack gap="$4" alignItems="center" width="100%">
      <Input
        accessibilityLabel="Verification code"
        chrome={false}
        ref={inputRef}
        value={value}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        maxLength={length}
        position="absolute"
        opacity={0}
        width={0}
        height={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        showSoftInputOnFocus
      />

      <XStack gap="$3" justifyContent="center" alignItems="center">
        {Array.from({length}, (_, index) => (
          <View
            key={index}
            onPress={handleBoxPress}
            pressStyle={{opacity: 0.8}}
            width={42}
            height={52}
            borderRadius="$3"
            backgroundColor="$background"
            borderWidth={isActiveBox(index) ? 2 : 1}
            borderColor={isActiveBox(index) ? '$primary' : '$borderColor'}
            alignItems="center"
            justifyContent="center"
            shadowColor="$shadowColor"
            shadowOffset={{width: 0, height: 1}}
            shadowOpacity={0.05}
            shadowRadius={2}>
            <Text color="$color" fontWeight="bold" fontSize="$5">
              {value[index] || ''}
            </Text>
          </View>
        ))}
      </XStack>
    </YStack>
  );
}
