import ProfileSettingsScreen from '../src/screenModules/ProfileSettingsScreen';
import {Stack} from 'expo-router';

export default function ProfileSettingsRoute() {
  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ProfileSettingsScreen />
    </>
  );
}
