const React = require('react');

const NOOP = () => {};
const createMockComponent = (name) => {
  const Comp = React.forwardRef(({children, ...props}, ref) =>
    React.createElement(name, {...props, ref}, children),
  );
  Comp.displayName = name;
  return Comp;
};

const View = createMockComponent('View');
const Text = createMockComponent('Text');
const ScrollView = createMockComponent('ScrollView');

const Animated = {
  View,
  Text,
  ScrollView,
  createAnimatedComponent: (c) => c,
};

module.exports = {
  __esModule: true,
  default: Animated,
  Animated,
  View,
  Text,
  ScrollView,
  useSharedValue: (init) => ({value: init}),
  useAnimatedStyle: (fn) => fn() || {},
  useAnimatedScrollHandler: () => () => {},
  useDerivedValue: (fn) => ({value: fn()}),
  useAnimatedReaction: NOOP,
  withTiming: (toValue, _, callback) => {
    callback && callback(true);
    return toValue;
  },
  withSpring: (toValue, _, callback) => {
    callback && callback(true);
    return toValue;
  },
  withSequence: (...args) => args[args.length - 1],
  withDelay: (_, anim) => anim,
  withRepeat: (anim) => anim,
  interpolate: (_value, _input, output) => output[0],
  interpolateColor: (_value, _input, output) => output[0],
  Extrapolation: {CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity'},
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  cancelAnimation: NOOP,
  Easing: {
    linear: NOOP,
    ease: NOOP,
    bezier: () => NOOP,
    in: () => NOOP,
    out: () => NOOP,
    inOut: () => NOOP,
  },
};