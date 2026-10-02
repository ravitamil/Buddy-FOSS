import EditGroupTransactionScreen from '../../../src/screenModules/EditGroupTransactionScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

export default function EditGroupTransactionWrapper() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    transactionId?: string | string[];
  }>();

  return (
    <EditGroupTransactionScreen
      groupId={routeParamString(params.id)}
      transactionId={routeParamString(params.transactionId)}
    />
  );
}
