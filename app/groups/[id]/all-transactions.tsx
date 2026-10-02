import GroupTransactionsScreen from '../../../src/screenModules/GroupTransactionsScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

// Hide default navigation header since we use CustomNavigationHeader
// Also hide the bottom tab bar for this screen
export const unstable_settings = {
  headerShown: false,
};

export default function GroupTransactionsWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const groupId = routeParamString(id);

  return <GroupTransactionsScreen groupId={groupId} />;
}

// Hide the bottom tab bar for this screen
export const options = {
  tabBarStyle: {display: 'none'},
};
