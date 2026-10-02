import GroupInsightsScreen from '../../src/screenModules/GroupInsightsScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

export default function GroupInsightsWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <GroupInsightsScreen groupId={groupId} />;
}
