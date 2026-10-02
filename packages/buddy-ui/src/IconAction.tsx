import React from 'react';
import {Button as TamaguiButton, YStack, styled} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export type IconActionTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'accent';
export type IconActionSize = 'small' | 'medium' | 'large';

export interface IconActionProps {
  icon: keyof typeof Ionicons.glyphMap | React.ReactElement;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: IconActionTone;
  size?: IconActionSize;
  testID?: string;
}

export function IconAction({
  icon,
  label,
  onPress,
  disabled = false,
  tone = 'primary',
  size = 'medium',
  testID,
}: IconActionProps) {
  return (
    <YStack alignItems="center" gap="$2" flex={1}>
      <IconActionFrame
        testID={testID}
        actionTone={tone}
        actionSize={size}
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{disabled}}>
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <ThemedIonicon
            name={icon}
            size={iconSize[size]}
            color={
              tone === 'neutral'
                ? '$text'
                : tone === 'primary' || tone === 'accent'
                  ? '$buttonPrimaryText'
                  : '$semanticOnColor'
            }
          />
        )}
      </IconActionFrame>
      <Text
        variant="caption"
        color={disabled ? '$textDisabled' : '$text'}
        weight="medium"
        align="center">
        {label}
      </Text>
    </YStack>
  );
}

const iconSize: Record<IconActionSize, number> = {small: 20, medium: 24, large: 28};

const IconActionFrame = styled(TamaguiButton, {
  name: 'BuddyIconAction',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: 0,
  transition: 'quick',
  animateOnly: ['transform', 'opacity'],
  pressStyle: {scale: 0.95, opacity: 0.88},
  disabledStyle: {opacity: 0.5},
  variants: {
    actionTone: {
      neutral: {backgroundColor: '$secondary'},
      primary: {backgroundColor: '$primary'},
      success: {backgroundColor: '$success'},
      info: {backgroundColor: '$info'},
      warning: {backgroundColor: '$warning'},
      danger: {backgroundColor: '$error'},
      accent: {backgroundColor: '$primary'},
    },
    actionSize: {
      small: {width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: 24},
      medium: {width: 60, height: 60, minWidth: 60, minHeight: 60, borderRadius: 30},
      large: {width: 72, height: 72, minWidth: 72, minHeight: 72, borderRadius: 36},
    },
  } as const,
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
