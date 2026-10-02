import AddGroupTransactionScreen from '../../../src/screenModules/AddGroupTransactionScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../../src/navigation/routes';

export default function AddGroupTransactionWrapper() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    initialType?: string | string[];
    initialPaidBy?: string | string[];
    initialReceivedBy?: string | string[];
    initialAmount?: string | string[];
  }>();

  return (
    <AddGroupTransactionScreen
      groupId={routeParamString(params.id)}
      initialAmount={routeParamString(params.initialAmount)}
      initialPaidBy={routeParamString(params.initialPaidBy)}
      initialReceivedBy={routeParamString(params.initialReceivedBy)}
      initialType={routeParamString(params.initialType)}
    />
  );
}
