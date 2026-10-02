import type {TamaguiBuildOptions} from 'tamagui';

export default {
  components: ['tamagui', '@ravitamil/buddy-ui'],
  config: './tamagui.config.ts',
  outputCSS: false,
  importsWhitelist: ['constants.js', 'colors.js'],
  logTimings: true,
} satisfies TamaguiBuildOptions;
