import {useLocalSearchParams} from 'expo-router';

import AddEditLoanScreenModule from '../src/screenModules/AddEditLoanScreen';
import {useAddEditLoanRoute} from '../src/features/loans/hooks/useAddEditLoanRoute';

export default function AddEditLoanRoute() {
  const {id} = useLocalSearchParams<{id?: string}>();
  const route = useAddEditLoanRoute(typeof id === 'string' ? id : undefined);

  return (
    <AddEditLoanScreenModule
      initialData={route.initialData}
      onSubmit={route.handleSubmit}
      onCancel={route.handleCancel}
      isEditing={route.isEditing}
      loading={route.loading}
    />
  );
}
