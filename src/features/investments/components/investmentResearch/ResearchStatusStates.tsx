import {LoadingIndicator} from '@ravitamil/buddy-ui';
import {Text, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export const ResearchLoading = ({marketName}: {marketName: string}) => (
  <VStack flex={1} justifyContent="center" alignItems="center" padding="$8">
    <LoadingIndicator size="large" label="Loading research" />
    <Text variant="body1" color="$textSecondary" marginTop="$3">
      Loading market data...
    </Text>
    <Text variant="caption" color="$textSecondary" marginTop="$2" textAlign="center">
      Fetching real-time data for {marketName}
    </Text>
  </VStack>
);

export const ResearchError = ({
  error,
  onRetry,
}: {
  error: string;
  marketName: string;
  onRetry: () => Promise<void>;
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const handleRetry = useCallback(() => {
    void onRetry();
  }, [onRetry]);

  return (
    <VStack flex={1} justifyContent="center" alignItems="center" padding="$8">
      <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#FF6B6B' : '#D32F2F'} />
      <Text variant="body1" color="$text" textAlign="center" marginTop="$3">
        {error}
      </Text>
      <Text variant="caption" color="$textSecondary" marginTop="$2" textAlign="center">
        Showing mock data for demonstration
      </Text>
      <VStack
        accessibilityRole="button"
        onPress={handleRetry}
        pressStyle={{opacity: 0.8}}
        marginTop="$4"
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderRadius="$2"
        backgroundColor={isDarkMode ? '$teal10' : '$teal11'}>
        <Text variant="body1" color="white" weight="semibold">
          Retry
        </Text>
      </VStack>
    </VStack>
  );
};
