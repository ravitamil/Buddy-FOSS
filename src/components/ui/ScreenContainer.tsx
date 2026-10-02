import React, {createContext, useContext, useId, useRef} from 'react';
import {BlurTargetView} from 'expo-blur';
import type {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {YStack} from 'tamagui';
import {BlurTargetProvider} from '@ravitamil/buddy-ui/mobile';
import {useTamaguiTheme} from '../../context/TamaguiThemeProvider';
import Svg, {Defs, Pattern, Circle, Rect} from 'react-native-svg';

const ScreenContainerContext = createContext(false);

export const useIsInsideScreenContainer = () => useContext(ScreenContainerContext);

const fillLayerProps = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const backgroundLayerProps = {
  ...fillLayerProps,
  zIndex: 1,
};

type ScreenThemeMode = 'light' | 'dark';

interface ScreenContainerProps {
  children: React.ReactNode;
  dotSize?: number;
  dotSpacing?: number;
  dotColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
  gradientStart?: {x: number; y: number};
  gradientEnd?: {x: number; y: number};
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  backgroundColor?: string;
  showGradient?: boolean;
  ignoreBottomSafeArea?: boolean;
  // Enhanced props for consistency
  showDots?: boolean;
  theme?: ScreenThemeMode | 'auto';
}

const resolveScreenTheme = (theme: ScreenContainerProps['theme'], isDarkMode: boolean) => {
  if (theme && theme !== 'auto') {
    return theme;
  }

  if (isDarkMode) {
    return 'dark';
  }

  return 'light';
};

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  dotSize = 2,
  dotSpacing = 20,
  dotColor,
  gradientColors,
  edges = ['top', 'bottom'],
  backgroundColor = 'transparent',
  showGradient = false,
  ignoreBottomSafeArea = false,
  showDots = true,
  theme = 'auto',
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const insets = useSafeAreaInsets();
  const patternId = useId();
  const blurTargetRef = useRef<View>(null);

  // Determine theme mode
  const effectiveTheme = resolveScreenTheme(theme, isDarkMode);
  const isEffectivelyDark = effectiveTheme === 'dark';

  const defaultBackgroundColor = '$background';
  const backgroundLayerColor = showGradient
    ? (gradientColors?.[0] ?? (isEffectivelyDark ? '$gray10' : '$gray1'))
    : defaultBackgroundColor;

  const defaultDotColor =
    dotColor || (isEffectivelyDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.14)');

  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? Math.max(insets.top, 24) : 0,
    paddingBottom: edges.includes('bottom') ? (ignoreBottomSafeArea ? 0 : insets.bottom) : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const renderDots = () => {
    if (!showDots) return null;

    return (
      <YStack {...fillLayerProps} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id={patternId}
              x="0"
              y="0"
              width={dotSpacing}
              height={dotSpacing}
              patternUnits="userSpaceOnUse">
              <Circle
                cx={dotSpacing / 2}
                cy={dotSpacing / 2}
                r={dotSize / 2}
                fill={defaultDotColor}
              />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </Svg>
      </YStack>
    );
  };

  return (
    <YStack flex={1} position="relative">
      {/* Edge-to-edge background layer */}
      <BlurTargetView ref={blurTargetRef} style={backgroundLayerProps}>
        <YStack {...fillLayerProps} backgroundColor={backgroundLayerColor}>
          {renderDots()}
        </YStack>
      </BlurTargetView>

      {/* Content layer with safe area insets */}
      <BlurTargetProvider value={blurTargetRef}>
        <ScreenContainerContext.Provider value={true}>
          <YStack flex={1} zIndex={2} style={safeAreaStyle} backgroundColor={backgroundColor}>
            {children}
          </YStack>
        </ScreenContainerContext.Provider>
      </BlurTargetProvider>
    </YStack>
  );
};

export default ScreenContainer;
