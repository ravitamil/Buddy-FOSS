import React from 'react';
import {TamaguiThemeProvider} from './TamaguiThemeProvider';

interface TamaguiProviderProps {
  children: React.ReactNode;
}

export function TamaguiProvider({children}: TamaguiProviderProps) {
  // Native builds embed the configured fonts through the expo-font config plugin.
  return <TamaguiThemeProvider>{children}</TamaguiThemeProvider>;
}
