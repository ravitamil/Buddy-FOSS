import React from 'react';
import {Label as TamaguiLabel, type LabelProps as TamaguiLabelProps} from 'tamagui';
import {Text, type TextProps} from './Text';

export interface LabelProps extends TamaguiLabelProps {
  textProps?: TextProps;
}

export function Label({children, textProps, ...props}: LabelProps) {
  return (
    <TamaguiLabel {...props}>
      <Text variant="label" color="$color" weight="semibold" {...textProps}>
        {children}
      </Text>
    </TamaguiLabel>
  );
}
