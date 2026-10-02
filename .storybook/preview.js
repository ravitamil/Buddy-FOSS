import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { View } from 'react-native';

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#121212',
      },
      {
        name: 'gray',
        value: '#f5f5f5',
      },
    ],
  },
  docs: {
    story: {
      inline: true,
    },
  },
};

// Global decorators for consistent theming
export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || 'light';
    const backgroundColor = theme === 'dark' ? '#121212' : '#ffffff';
    
    return (
      <TamaguiProvider config={config} defaultTheme={theme}>
        <View style={{ 
          padding: 20, 
          backgroundColor, 
          minHeight: 200,
          flex: 1 
        }}>
          <Story />
        </View>
      </TamaguiProvider>
    );
  },
];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      showName: true,
    },
  },
};