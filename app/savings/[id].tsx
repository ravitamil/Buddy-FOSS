import SavingsGoalDetailScreen from '../../src/screenModules/SavingsGoalDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamBoolean, routeParamString} from '../../src/navigation/routes';

export default function SavingsGoalDetailWrapper() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    fromCreation?: string | string[];
  }>();

  return (
    <SavingsGoalDetailScreen
      goalId={routeParamString(params.id)}
      fromCreation={routeParamBoolean(params.fromCreation)}
    />
  );
}
