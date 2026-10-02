module.exports = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/components/ui/*.stories.@(js|jsx|ts|tsx)',
    '../src/components/forms/*.stories.@(js|jsx|ts|tsx)',
    '../src/components/layout/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-docs',
    '@storybook/addon-ondevice-backgrounds',
  ],
  framework: {
    name: '@storybook/react-native',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};