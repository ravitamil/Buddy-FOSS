import GroupActivityFeedScreen from '../../../src/screenModules/GroupActivityFeedScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

export default function GroupActivityFeedWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <GroupActivityFeedScreen groupId={groupId} />;
}
