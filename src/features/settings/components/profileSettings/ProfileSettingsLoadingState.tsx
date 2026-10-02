import {LoadingIndicator, VStack} from '@ravitamil/buddy-ui';

export function ProfileSettingsLoadingState() {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center">
      <LoadingIndicator size="large" color="$color" label="Loading profile..." />
    </VStack>
  );
}
