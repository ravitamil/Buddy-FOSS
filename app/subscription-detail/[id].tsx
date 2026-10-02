import SubscriptionDetailScreen from '../../src/screenModules/SubscriptionDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

export default function SubscriptionDetailWrapper() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    subscriptionId?: string | string[];
  }>();
  const subscriptionId = routeParamString(params.id) || routeParamString(params.subscriptionId);

  return <SubscriptionDetailScreen subscriptionId={subscriptionId} />;
}
