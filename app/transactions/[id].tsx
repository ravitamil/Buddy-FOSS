import TransactionDetailScreen from '../../src/screenModules/TransactionDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

// Hide default navigation header since we use CustomNavigationHeader
export const unstable_settings = {
  headerShown: false,
};

export default function TransactionDetailWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const transactionId = routeParamString(id);

  return <TransactionDetailScreen transactionId={transactionId} />;
}
