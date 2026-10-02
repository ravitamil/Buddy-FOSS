import {Stack} from 'expo-router';

const transparentContent = {backgroundColor: 'transparent'};

export default function TransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: transparentContent,
        animation: 'fade',
        animationDuration: 150,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    />
  );
}
