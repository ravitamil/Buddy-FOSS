import {tamaguiConfig} from '../tamagui.config';

type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {
    readonly __buddyIoTamaguiConfig?: never;
  }
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {
    readonly __buddyIoTamaguiConfig?: never;
  }
}

declare module '@tamagui/stacks' {
  interface TamaguiCustomConfig extends Conf {
    readonly __buddyIoTamaguiConfig?: never;
  }
}

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends Conf {
    readonly __buddyIoTamaguiConfig?: never;
  }
}
