import GroupTransactionDetailScreen from '../../../../src/screenModules/GroupTransactionDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../../src/navigation/routes';

// Hide default navigation header since we use CustomNavigationHeader
export const unstable_settings = {
  headerShown: false,
};

export default function GroupTransactionDetailWrapper() {
  const {groupId, transactionId} = useLocalSearchParams<{
    groupId?: string | string[];
    transactionId?: string | string[];
  }>();

  return (
    <GroupTransactionDetailScreen
      groupId={routeParamString(groupId)}
      transactionId={routeParamString(transactionId)}
    />
  );
}
