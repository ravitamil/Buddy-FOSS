import React from 'react';
import Animated from 'react-native-reanimated';
import {XStack, YStack} from 'tamagui';
import {HeaderBackButton} from './navigationHeader/HeaderBackButton';
import {HeaderTitleBlock} from './navigationHeader/HeaderTitleBlock';
import {ProgressiveHeaderBackground} from './navigationHeader/ProgressiveHeaderBackground';
import type {CustomNavigationHeaderProps} from './navigationHeader/navigationHeaderTypes';
import {useNavigationHeaderModel} from './navigationHeader/useNavigationHeaderModel';

export type {CustomNavigationHeaderProps};

export function CustomNavigationHeader(props: CustomNavigationHeaderProps) {
  const {
    title,
    subtitle,
    rightElement,
    showBackButton = true,
    largeTitle,
    hideRightElementInBlur = true,
    showBackButtonInNonBlur = false,
    showProBadge = false,
    alignStaticTitleWithContent = false,
    staticTitleVariant = 'default',
  } = props;
  const model = useNavigationHeaderModel(props);
  const shouldShowBackButton =
    (!model.isDynamic && showBackButton) ||
    (model.isDynamic && (showBackButtonInNonBlur || model.isCollapsing));
  const shouldShowRightElement = !model.isDynamic || !hideRightElementInBlur || model.isCollapsing;
  const shouldReserveLeadingSpace =
    shouldShowBackButton || model.isDynamic || !alignStaticTitleWithContent;

  return (
    <>
      <ProgressiveHeaderBackground model={model} hasCompactSubtitle={Boolean(subtitle)} />

      <Animated.View
        pointerEvents="box-none"
        style={
          model.isDynamic
            ? [
                progressiveHeaderStyle,
                {paddingTop: model.insets.top > 0 ? model.insets.top + 12 : 20},
              ]
            : [{paddingTop: Math.max(20, model.insets.top)}]
        }>
        <YStack
          width="100%"
          paddingHorizontal={alignStaticTitleWithContent && !model.isDynamic ? '$4' : undefined}>
          <XStack position="relative" alignItems="center">
            <XStack alignItems="center" gap="$3" flex={1}>
              {shouldShowBackButton ? (
                <HeaderBackButton model={model} showBackButtonInNonBlur={showBackButtonInNonBlur} />
              ) : shouldReserveLeadingSpace ? (
                <YStack width={40} height={40} />
              ) : null}

              <HeaderTitleBlock
                title={title}
                subtitle={subtitle}
                largeTitle={largeTitle}
                rightElement={model.isDynamic ? undefined : rightElement}
                showProBadge={showProBadge}
                staticTitleVariant={staticTitleVariant}
                model={model}
              />
            </XStack>

            {rightElement && shouldShowRightElement && (
              <Animated.View
                style={[
                  model.isDynamic ? dynamicRightElementStyle : undefined,
                  model.isDynamic && model.isCollapsing ? model.rightElementStyle : undefined,
                ]}>
                {rightElement}
              </Animated.View>
            )}
          </XStack>
        </YStack>
      </Animated.View>
    </>
  );
}

const progressiveHeaderStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  paddingTop: 45,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 12,
  borderWidth: 0,
  borderColor: 'transparent',
} as const;

const dynamicRightElementStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
} as const;
