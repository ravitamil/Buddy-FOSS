import {Switch as TamaguiSwitch} from 'tamagui';

/* eslint-disable development-quality/enforce-tamagui-usage -- switch geometry is intrinsic component anatomy */

export type SwitchSize = 'compact' | 'regular';
export type SwitchTone = 'primary' | 'success' | 'warning';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  tone?: SwitchTone;
  id?: string;
  accessibilityLabel: string;
  testID?: string;
}

const SWITCH_CONFIG = {
  compact: {trackWidth: 44, trackHeight: 26, thumbSize: 20, padding: 3},
  regular: {trackWidth: 50, trackHeight: 30, thumbSize: 24, padding: 3},
} as const;

const ACTIVE_TRACK = {
  primary: '$primary',
  success: '$success',
  warning: '$warning',
} as const;

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'regular',
  tone = 'primary',
  id,
  accessibilityLabel,
  testID,
}: SwitchProps) {
  const dimensions = SWITCH_CONFIG[size];

  return (
    <TamaguiSwitch
      id={id}
      testID={testID}
      unstyled
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{checked, disabled}}
      width={dimensions.trackWidth}
      height={dimensions.trackHeight}
      minWidth={dimensions.trackWidth}
      maxWidth={dimensions.trackWidth}
      minHeight={dimensions.trackHeight}
      maxHeight={dimensions.trackHeight}
      padding={dimensions.padding}
      borderWidth={0}
      borderRadius={9999}
      alignSelf="center"
      justifyContent="center"
      backgroundColor="$secondary"
      opacity={disabled ? 0.45 : 1}
      transition="quick"
      activeStyle={{backgroundColor: ACTIVE_TRACK[tone]}}
      pressStyle={{opacity: disabled ? 0.45 : 0.9}}>
      <TamaguiSwitch.Thumb
        unstyled
        width={dimensions.thumbSize}
        height={dimensions.thumbSize}
        borderRadius={9999}
        backgroundColor="$white"
        boxShadow="0 2px 5px rgba(0, 0, 0, 0.22)"
        transition="quick"
      />
    </TamaguiSwitch>
  );
}
