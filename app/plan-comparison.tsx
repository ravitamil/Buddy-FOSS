import {Stack} from 'expo-router';
import PlanComparisonScreen from '../src/screens/PlanComparisonScreen';

export default function PlanComparisonRoute() {
  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <PlanComparisonScreen />
    </>
  );
}
