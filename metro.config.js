const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('lottie');
config.watchFolders = [path.resolve(__dirname, 'packages')];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@ravitamil/buddy-ui': path.resolve(__dirname, 'packages/buddy-ui/src'),
  'react-native-linear-gradient': path.resolve(
    __dirname,
    'src/shims/react-native-linear-gradient.ts',
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native-linear-gradient' ||
    moduleName.startsWith('react-native-linear-gradient/')
  ) {
    return {
      filePath: path.resolve(__dirname, 'src/shims/react-native-linear-gradient.ts'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
