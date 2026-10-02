import SettlementHistoryScreen from '../../../src/screenModules/SettlementHistoryScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

export default function SettlementHistoryWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <SettlementHistoryScreen groupId={groupId} />;
}

// Hide the default navigation header and bottom tab bar
export const options = {
  headerShown: false,
  tabBarStyle: {display: 'none'},
};
