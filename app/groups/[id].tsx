import GroupDetailScreen from '../../src/screenModules/GroupDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

export default function GroupDetailWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <GroupDetailScreen groupId={groupId} />;
}
