import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';

export function StatusBarManager() {
  const {isDarkMode} = useTamaguiTheme();

  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}
