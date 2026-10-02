import type React from 'react';
import {XStack, type XStackProps, YStack, type YStackProps} from 'tamagui';

export interface BoxProps {
  direction?: 'column' | 'row';
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function Box({direction = 'column', children, ...props}: BoxProps) {
  const Component = direction === 'column' ? YStack : XStack;

  return <Component {...props}>{children}</Component>;
}

export function VStack(props: YStackProps) {
  return <YStack {...props} />;
}

export function HStack(props: XStackProps) {
  return <XStack {...props} />;
}
