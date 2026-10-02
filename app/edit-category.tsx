import EditCategoryScreen from '../src/screenModules/EditCategoryScreen';
import {Stack, useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../src/navigation/routes';

export default function EditCategoryPage() {
  const params = useLocalSearchParams<{id?: string | string[]; type?: string | string[]}>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <EditCategoryScreen
        categoryId={routeParamString(params.id)}
        categoryType={routeParamString(params.type)}
      />
    </>
  );
}
