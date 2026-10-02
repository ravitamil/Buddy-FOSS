import EditGroupScreen from '../../../src/screenModules/EditGroupScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

export default function EditGroupWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <EditGroupScreen groupId={groupId} />;
}
