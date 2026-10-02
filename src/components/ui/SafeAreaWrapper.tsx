import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {YStack} from 'tamagui';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  style?: React.ComponentProps<typeof YStack>['style'];
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      flex={1}
      paddingTop={edges.includes('top') ? insets.top : 0}
      paddingBottom={edges.includes('bottom') ? insets.bottom : 0}
      paddingLeft={edges.includes('left') ? insets.left : 0}
      paddingRight={edges.includes('right') ? insets.right : 0}
      style={style}>
      {children}
    </YStack>
  );
};

export default SafeAreaWrapper;
