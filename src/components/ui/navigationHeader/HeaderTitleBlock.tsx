import React from 'react';
import Animated from 'react-native-reanimated';
import {XStack, YStack} from 'tamagui';
import {Text} from '@ravitamil/buddy-ui';
import {ProBadge} from '../ProBadge';
import {getFontFamilyForWeight} from '../../../utils/fonts';
import type {NavigationHeaderModel} from './useNavigationHeaderModel';

const TITLE_SUBTITLE_GAP = 5;

interface HeaderTitleBlockProps {
  title: string;
  subtitle?: string;
  largeTitle?: string;
  rightElement?: React.ReactNode;
  showProBadge: boolean;
  staticTitleVariant: 'default' | 'compact';
  model: NavigationHeaderModel;
}

export function HeaderTitleBlock({
  title,
  subtitle,
  largeTitle,
  rightElement,
  showProBadge,
  staticTitleVariant,
  model,
}: HeaderTitleBlockProps) {
  const isCompactStaticTitle = staticTitleVariant === 'compact';

  if (!model.isDynamic) {
    return (
      <YStack flex={1} alignItems="flex-start">
        <XStack alignItems="center" gap="$2">
          <Text
            fontSize={isCompactStaticTitle ? 22 : 28}
            lineHeight={isCompactStaticTitle ? 28 : 34}
            fontWeight="700"
            color={model.themeTextColor}
            letterSpacing={isCompactStaticTitle ? -0.3 : -0.5}
            paddingLeft={0}
            fontFamily={getFontFamilyForWeight('bold')}>
            {title}
          </Text>
          {showProBadge && <ProBadge />}
        </XStack>
        {subtitle && (
          <Text
            fontSize={11}
            lineHeight={13}
            fontWeight="600"
            color={model.themeSubtitleColor}
            paddingTop={TITLE_SUBTITLE_GAP}
            paddingLeft={0}
            textTransform="uppercase"
            letterSpacing={0.5}
            fontFamily={getFontFamilyForWeight('semibold')}>
            {subtitle}
          </Text>
        )}
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {model.isCollapsing && (
        <Animated.View
          style={[
            model.largeHeaderStyle,
            {position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center'},
          ]}>
          <YStack flex={1} alignItems="flex-start">
            <XStack alignItems="center" gap="$2">
              <Text
                fontSize={22}
                lineHeight={28}
                fontWeight="700"
                color={model.themeTextColor}
                letterSpacing={-0.3}
                paddingLeft={0}
                fontFamily={getFontFamilyForWeight('bold')}>
                {title}
              </Text>
              {showProBadge && <ProBadge />}
            </XStack>
            {subtitle && (
              <Text
                fontSize={11}
                lineHeight={13}
                fontWeight="600"
                color={model.themeSubtitleColor}
                paddingTop={TITLE_SUBTITLE_GAP}
                paddingLeft={0}
                textTransform="uppercase"
                letterSpacing={0.5}
                fontFamily={getFontFamilyForWeight('semibold')}>
                {subtitle}
              </Text>
            )}
          </YStack>
        </Animated.View>
      )}

      <Animated.View
        style={[
          model.smallHeaderStyle,
          {flex: 1, alignItems: 'center', marginRight: rightElement ? 0 : 44},
        ]}>
        <YStack alignItems="center">
          <XStack alignItems="center" justifyContent="center" gap="$2">
            <Text
              variant="h5"
              color={model.themeTextColor}
              weight="bold"
              align="center"
              style={{
                textShadowColor: model.themeBackgroundColor,
                textShadowOffset: {width: 0, height: 3},
                textShadowRadius: 6,
                fontSize: 18,
              }}>
              {largeTitle || title}
            </Text>
            {showProBadge && <ProBadge />}
          </XStack>
          {subtitle && (
            <Text
              color={model.themeTextColor}
              variant="body2"
              weight="semibold"
              align="center"
              marginTop={TITLE_SUBTITLE_GAP}
              textTransform="uppercase"
              letterSpacing={0.5}
              style={{
                textShadowColor: model.themeBackgroundColor,
                textShadowOffset: {width: 0, height: 2},
                textShadowRadius: 4,
                fontSize: 11,
              }}>
              {subtitle}
            </Text>
          )}
        </YStack>
      </Animated.View>
    </YStack>
  );
}
