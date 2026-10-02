import {Stack} from 'expo-router';

const transparentContent = {backgroundColor: 'transparent'};

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: transparentContent,
        animation: 'fade',
        animationDuration: 150,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}>
      <Stack.Screen
        name="[id]/add-transaction"
        options={{
          presentation: 'card',
          animation: 'fade',
          animationDuration: 150,
        }}
      />
      <Stack.Screen
        name="[id]/edit-transaction"
        options={{
          presentation: 'card',
          animation: 'fade',
          animationDuration: 150,
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          presentation: 'card',
          animation: 'fade',
          animationDuration: 150,
        }}
      />
    </Stack>
  );
}
