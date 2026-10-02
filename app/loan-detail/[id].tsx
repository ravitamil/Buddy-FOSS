import LoanDetailScreenModule from '../../src/screenModules/LoanDetailScreen';
import {useLocalSearchParams} from 'expo-router';
import {routeParamString} from '../../src/navigation/routes';

export default function LoanDetailScreen() {
  const params = useLocalSearchParams<{id?: string | string[]; loanId?: string | string[]}>();
  const loanId = routeParamString(params.id) || routeParamString(params.loanId);

  return <LoanDetailScreenModule loanId={loanId} />;
}
