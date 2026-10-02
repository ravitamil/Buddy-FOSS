import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import Animated from 'react-native-reanimated';
import {View} from 'tamagui';
import type {NavigationHeaderModel} from './useNavigationHeaderModel';

interface HeaderBackButtonProps {
  model: NavigationHeaderModel;
  showBackButtonInNonBlur: boolean;
}

export function HeaderBackButton({model, showBackButtonInNonBlur}: HeaderBackButtonProps) {
  const animatedStyle =
    model.isDynamic && (showBackButtonInNonBlur || model.isCollapsing)
      ? model.backButtonStyle
      : undefined;

  return (
    <Animated.View style={animatedStyle}>
      <View
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        backgroundColor={model.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
        borderWidth={1}
        borderColor={model.isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'}
        shadowColor={model.isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)'}
        shadowOffset={{width: 0, height: 2}}
        shadowOpacity={0.2}
        shadowRadius={4}
        pressStyle={{opacity: 0.75, scale: 0.94}}
        onPress={model.handleBackPress}>
        <Ionicons
          name="chevron-back"
          size={22}
          color={model.isDarkMode ? '#FFFFFF' : '#111827'}
          style={{marginLeft: -1}}
        />
      </View>
    </Animated.View>
  );
}
