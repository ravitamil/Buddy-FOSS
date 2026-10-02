import React, {useEffect, useRef} from 'react';
import LottieView from 'lottie-react-native';
import {YStack, type YStackProps} from 'tamagui';

export interface LottieAnimationViewProps {
  source: unknown;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  resizeMode?: 'contain' | 'cover' | 'center';
  backgroundColor?: string;
  onAnimationFinish?: (cancelled: boolean) => void;
  onAnimationReady?: () => void;
  style?: YStackProps['style'];
  testID?: string;
}

export function LottieAnimationView({
  source,
  width = 200,
  height = 200,
  autoPlay = true,
  loop = true,
  speed = 1,
  resizeMode = 'contain',
  backgroundColor = 'transparent',
  onAnimationFinish,
  onAnimationReady,
  style,
  testID,
}: LottieAnimationViewProps) {
  const animationRef = useRef<LottieView>(null);
  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = setTimeout(() => {
      animationRef.current?.play();
      onAnimationReady?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [autoPlay, onAnimationReady]);
  return (
    <YStack
      testID={testID}
      width={width}
      height={height}
      alignItems="center"
      justifyContent="center"
      backgroundColor={backgroundColor}
      style={style}>
      <LottieView
        testID={testID ? `${testID}-animation` : undefined}
        ref={animationRef}
        source={source as React.ComponentProps<typeof LottieView>['source']}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        resizeMode={resizeMode}
        onAnimationFinish={onAnimationFinish}
        style={{width, height}}
      />
    </YStack>
  );
}

export function useLottieControl(
  ref: React.RefObject<{play: () => void; pause: () => void; reset: () => void} | null>,
) {
  return {
    play: () => ref.current?.play(),
    pause: () => ref.current?.pause(),
    reset: () => ref.current?.reset(),
  };
}
