import React from 'react';
import {ScrollView, type ScrollViewProps} from '@tamagui/scroll-view';
import {YStack} from 'tamagui';
import Animated from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import type {KeyboardAwareScrollViewProps} from 'react-native-keyboard-controller';
import {SafeAreaWrapper} from './SafeAreaWrapper';
import {useIsInsideScreenContainer} from './ScreenContainer';
import {StandardKeyboardAvoidingView} from './StandardKeyboardAvoidingView';
import {logger as appLogger} from '../../services/LoggerService';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);

type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';
type KeyboardMode = 'avoid' | 'aware-scroll' | 'none';
type ScrollSurfaceStyle = KeyboardAwareScrollViewProps['style'];
type ScrollContentStyle = KeyboardAwareScrollViewProps['contentContainerStyle'];

const DEFAULT_SAFE_AREA_EDGES: SafeAreaEdge[] = ['top', 'bottom'];
const NO_SAFE_AREA_EDGES: SafeAreaEdge[] = [];

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  keyboardMode?: KeyboardMode;
  backgroundColor?: string;
  padding?: boolean;
  edges?: SafeAreaEdge[];
  useSafeArea?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
  keyboardBehavior?: React.ComponentProps<typeof StandardKeyboardAvoidingView>['behavior'];
  keyboardVerticalOffset?: number;
  keyboardAutomaticOffset?: boolean;
  contentContainerStyle?: ScrollContentStyle;
  scrollViewStyle?: ScrollSurfaceStyle;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  bounces?: ScrollViewProps['bounces'];
  nestedScrollEnabled?: ScrollViewProps['nestedScrollEnabled'];
  onScroll?: KeyboardAwareScrollViewProps['onScroll'];
  scrollEventThrottle?: number;
  keyboardBottomOffset?: number;
  extraKeyboardSpace?: number;
  keyboardAwareMode?: KeyboardAwareScrollViewProps['mode'];
}

export function ScreenWrapper({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  keyboardMode,
  backgroundColor,
  padding = true,
  edges,
  useSafeArea = true,
  refreshControl,
  keyboardBehavior,
  keyboardVerticalOffset,
  keyboardAutomaticOffset,
  contentContainerStyle,
  scrollViewStyle,
  keyboardShouldPersistTaps = 'handled',
  bounces,
  nestedScrollEnabled,
  onScroll,
  scrollEventThrottle = 16,
  keyboardBottomOffset = 60,
  extraKeyboardSpace,
  keyboardAwareMode = 'insets',
}: ScreenWrapperProps) {
  const isInsideScreenContainer = useIsInsideScreenContainer();
  const effectiveEdges =
    edges ?? (isInsideScreenContainer ? NO_SAFE_AREA_EDGES : DEFAULT_SAFE_AREA_EDGES);
  const effectiveBackgroundColor =
    backgroundColor ?? (isInsideScreenContainer ? 'transparent' : '$background');
  const shouldApplySafeArea = useSafeArea && effectiveEdges.length > 0;
  const effectiveKeyboardMode: KeyboardMode =
    keyboardMode ?? (keyboardAvoiding ? (scrollable ? 'aware-scroll' : 'avoid') : 'none');
  const logger = appLogger.component('ScreenWrapper');
  const scrollSurfaceStyle: ScrollSurfaceStyle = [{flex: 1}, scrollViewStyle];
  const scrollContentStyle: ScrollContentStyle = [{flexGrow: 1}, contentContainerStyle];
  const tamaguiScrollSurfaceStyle = scrollSurfaceStyle as unknown as ScrollViewProps['style'];
  const tamaguiScrollContentStyle =
    scrollContentStyle as unknown as ScrollViewProps['contentContainerStyle'];

  React.useEffect(() => {
    logger.debug('ScreenWrapper initialized', {
      scrollable,
      keyboardAvoiding,
      keyboardMode: effectiveKeyboardMode,
      useSafeArea,
      padding,
      edges: effectiveEdges,
      isInsideScreenContainer,
    });
  }, [
    scrollable,
    keyboardAvoiding,
    effectiveKeyboardMode,
    useSafeArea,
    padding,
    effectiveEdges,
    isInsideScreenContainer,
    logger,
  ]);

  const content = shouldApplySafeArea ? (
    <SafeAreaWrapper edges={effectiveEdges}>
      <YStack flex={1} backgroundColor={effectiveBackgroundColor} padding={padding ? '$4' : 0}>
        {children}
      </YStack>
    </SafeAreaWrapper>
  ) : (
    <YStack flex={1} backgroundColor={effectiveBackgroundColor} padding={padding ? '$4' : 0}>
      {children}
    </YStack>
  );

  if (effectiveKeyboardMode === 'aware-scroll') {
    return (
      <AnimatedKeyboardAwareScrollView
        style={scrollSurfaceStyle}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        bounces={bounces}
        nestedScrollEnabled={nestedScrollEnabled}
        refreshControl={refreshControl || undefined}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        bottomOffset={keyboardBottomOffset}
        extraKeyboardSpace={extraKeyboardSpace}
        mode={keyboardAwareMode}>
        {content}
      </AnimatedKeyboardAwareScrollView>
    );
  }

  if (effectiveKeyboardMode === 'avoid') {
    return (
      <StandardKeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        automaticOffset={keyboardAutomaticOffset}>
        {scrollable ? (
          <ScrollView
            style={tamaguiScrollSurfaceStyle}
            contentContainerStyle={tamaguiScrollContentStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            bounces={bounces}
            nestedScrollEnabled={nestedScrollEnabled}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
            refreshControl={refreshControl || undefined}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </StandardKeyboardAvoidingView>
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        style={tamaguiScrollSurfaceStyle}
        contentContainerStyle={tamaguiScrollContentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        bounces={bounces}
        nestedScrollEnabled={nestedScrollEnabled}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        refreshControl={refreshControl || undefined}>
        {content}
      </ScrollView>
    );
  }

  return content;
}
