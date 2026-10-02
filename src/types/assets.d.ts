declare module '*.png' {
  import type {ImageSourcePropType} from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}

declare module '*.otf' {
  const source: number;
  export default source;
}
