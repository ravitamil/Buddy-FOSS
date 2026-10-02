import React, {useCallback} from 'react';
import {Button as TamaguiButton, XStack, styled} from 'tamagui';

import {GlassSurface} from './GlassSurface';
import {Text} from './Text';

export interface SegmentedControlOption {
  label: string;
  value: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: readonly SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  selectedTone?: 'primary' | 'info';
  testID?: string;
  fontSize?: number | string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  selectedTone = 'primary',
  testID,
  fontSize,
}: SegmentedControlProps) {
  return (
    <GlassSurface testID={testID} padding={3} borderRadius={28}>
      <XStack minHeight={50} alignItems="center" accessibilityRole="tablist">
        {options.map((option, index) => (
          <SegmentButton
            key={`segmented-${option.value || index}`}
            option={option}
            selected={option.value === value}
            selectedTone={selectedTone}
            onValueChange={onValueChange}
            fontSize={fontSize}
          />
        ))}
      </XStack>
    </GlassSurface>
  );
}

function SegmentButton({
  option,
  selected,
  selectedTone,
  onValueChange,
  fontSize,
}: {
  option: SegmentedControlOption;
  selected: boolean;
  selectedTone: NonNullable<SegmentedControlProps['selectedTone']>;
  onValueChange: (value: string) => void;
  fontSize?: number | string;
}) {
  const handlePress = useCallback(() => onValueChange(option.value), [onValueChange, option.value]);
  const selectedBackgroundColor = selectedTone === 'info' ? '$blue3' : '$primary';
  const selectedTextColor = selectedTone === 'info' ? '$blue12' : '$buttonPrimaryText';

  return (
    <SegmentFrame
      flex={1}
      backgroundColor={selected ? selectedBackgroundColor : 'transparent'}
      disabled={option.disabled}
      onPress={option.disabled ? undefined : handlePress}
      accessibilityRole="tab"
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityState={{selected, disabled: option.disabled}}>
      <Text
        color={selected ? selectedTextColor : '$text'}
        weight={selected ? 'bold' : 'semibold'}
        textAlign="center"
        fontSize={fontSize ?? '$4'}
        lineHeight={22}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {option.label}
      </Text>
    </SegmentFrame>
  );
}

const SegmentFrame = styled(TamaguiButton, {
  name: 'BuddySegment',
  unstyled: true,
  minHeight: 48,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$2',
  backgroundColor: 'transparent',
  transition: 'quick',
  animateOnly: ['opacity', 'transform'],
  pressStyle: {scale: 0.98, opacity: 0.84},
  disabledStyle: {opacity: 0.5},
});
