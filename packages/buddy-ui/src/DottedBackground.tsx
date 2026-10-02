import React from 'react';
import {styled, View} from '@tamagui/core';
import {DottedBackgroundLayer, type DottedBackgroundOptions} from './DottedBackgroundLayer';

export interface DottedBackgroundProps extends DottedBackgroundOptions {
  children?: React.ReactNode;
}

const Container = styled(View, {
  flex: 1,
  position: 'relative',
});

const ContentContainer = styled(View, {
  flex: 1,
  zIndex: 1,
});

export const DottedBackground: React.FC<DottedBackgroundProps> = ({
  children,
  dotSize = 2,
  dotSpacing = 20,
  dotColor,
  gradientColors,
  gradientStart = {x: 0, y: 0},
  gradientEnd = {x: 1, y: 1},
}) => {
  return (
    <Container>
      <DottedBackgroundLayer
        dotSize={dotSize}
        dotSpacing={dotSpacing}
        dotColor={dotColor}
        gradientColors={gradientColors}
        gradientStart={gradientStart}
        gradientEnd={gradientEnd}
        dotBorderRadius={50}
        gradientStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        dotContainerStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      />

      <ContentContainer>{children}</ContentContainer>
    </Container>
  );
};
