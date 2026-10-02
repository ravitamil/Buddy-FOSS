import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {View} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {getInactiveChipColors} from './researchGlass';

interface ResearchChipProps {
  active: boolean;
  activeColors: readonly [string, string];
  children: React.ReactNode;
  onPress: () => void;
}

export const ResearchChip = ({active, activeColors, children, onPress}: ResearchChipProps) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <View
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      onPress={onPress}
      pressStyle={{opacity: 0.8}}>
      <LinearGradient
        colors={active ? activeColors : getInactiveChipColors(isDarkMode)}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          borderWidth: active ? 0 : 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}>
        {children}
      </LinearGradient>
    </View>
  );
};
