module.exports = function (api) {
  api.cache(true);
  process.env.TAMAGUI_TARGET = 'native';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui', '@ravitamil/buddy-ui'],
          config: './tamagui.config.ts',
          exclude: /node_modules/,
          importsWhitelist: ['constants.js', 'colors.js'],
          logTimings: true,
          disableExtraction: process.env.NODE_ENV !== 'production',
          experimentalFlattenThemesOnNative: true,
        },
      ],
    ],
  };
};
