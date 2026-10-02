import EditGroupScreen from '../src/screenModules/EditGroupScreen';
import {Stack, useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../src/navigation/routes';

export default function EditGroupPage() {
  const {groupId} = useLocalSearchParams<{groupId?: string | string[]}>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <EditGroupScreen groupId={routeParamString(groupId)} />
    </>
  );
}
