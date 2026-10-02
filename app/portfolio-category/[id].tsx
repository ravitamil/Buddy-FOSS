import PortfolioCategoryDetailScreen from '../../src/screenModules/PortfolioCategoryDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

export default function PortfolioCategoryDetailWrapper() {
  const {id} = useLocalSearchParams<{id?: string | string[]}>();
  const categoryId = routeParamString(id);

  return <PortfolioCategoryDetailScreen categoryId={categoryId} />;
}
