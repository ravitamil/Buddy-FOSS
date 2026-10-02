import React from 'react';
import {View} from 'tamagui';
import {Input} from '@ravitamil/buddy-ui';

const CIRCULAR_CHARACTER_INPUT_SIZE = 88;
const CIRCULAR_CHARACTER_INPUT_RADIUS = CIRCULAR_CHARACTER_INPUT_SIZE / 2;

export interface CircularCharacterInputProps {
  accessibilityHint?: string;
  accessibilityLabel: string;
  backgroundColor: string;
  editable: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  testID?: string;
  value: string;
}

/**
 * A keyboard-backed, single-character surface for initials, emoji, and compact labels.
 * Callers own validation and any surrounding labels or edit affordances.
 */
export function CircularCharacterInput({
  accessibilityHint,
  accessibilityLabel,
  backgroundColor,
  editable,
  onChangeText,
  placeholder = '+',
  testID,
  value,
}: CircularCharacterInputProps) {
  return (
    <View
      width={CIRCULAR_CHARACTER_INPUT_SIZE}
      height={CIRCULAR_CHARACTER_INPUT_SIZE}
      borderRadius={CIRCULAR_CHARACTER_INPUT_RADIUS}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      backgroundColor={backgroundColor}
      style={circularCharacterInputStyle}>
      <Input
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        chrome={false}
        width={CIRCULAR_CHARACTER_INPUT_SIZE}
        height={CIRCULAR_CHARACTER_INPUT_SIZE}
        borderRadius={0}
        backgroundColor="transparent"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        color="$text"
        placeholder={placeholder}
        placeholderTextColor="$text"
        fontSize={32}
        lineHeight={38}
        padding={0}
        textAlign="center"
        textAlignVertical="center"
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        selectTextOnFocus
        showSoftInputOnFocus
        testID={testID}
      />
    </View>
  );
}

const circularCharacterInputStyle = {
  borderRadius: CIRCULAR_CHARACTER_INPUT_RADIUS,
};
