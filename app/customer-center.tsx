import {Stack} from 'expo-router';
import CustomerCenterScreen from '../src/screens/CustomerCenterScreen';

export default function CustomerCenterRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'fade',
          animationDuration: 150,
        }}
      />
      <CustomerCenterScreen />
    </>
  );
}
