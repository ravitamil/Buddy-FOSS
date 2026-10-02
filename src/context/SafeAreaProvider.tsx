import React, {createContext, useContext, useEffect} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getTokens} from 'tamagui';

interface SafeAreaContextType {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const SafeAreaContext = createContext<SafeAreaContextType>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const useSafeAreaTokens = () => useContext(SafeAreaContext);

interface SafeAreaProviderProps {
  children: React.ReactNode;
}

export function SafeAreaProvider({children}: SafeAreaProviderProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Update Tamagui tokens with current safe area insets
    const tokens = getTokens();
    if (tokens.safeArea) {
      // Update the safe area tokens dynamically
      Object.assign(tokens.safeArea, {
        top: insets.top,
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
      });
    }
  }, [insets.top, insets.bottom, insets.left, insets.right]);

  return <SafeAreaContext.Provider value={insets}>{children}</SafeAreaContext.Provider>;
}
