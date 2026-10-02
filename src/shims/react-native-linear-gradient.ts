/**
 * Shim for react-native-linear-gradient in Expo environment.
 * Redirects to expo-linear-gradient so that all consumers (such as react-native-gifted-charts)
 * use ExpoLinearGradient instead of looking for the missing native view config `BVLinearGradient`.
 */
import {LinearGradient} from 'expo-linear-gradient';

// Ensure full CommonJS and ESM interop
(LinearGradient as unknown as Record<string, unknown>).LinearGradient = LinearGradient;
(LinearGradient as unknown as Record<string, unknown>).default = LinearGradient;

export {LinearGradient};
export default LinearGradient;
