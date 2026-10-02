import React, {useEffect, useState} from 'react';
import {LottieAnimationView, GlassSurface, Button, Text} from '@ravitamil/buddy-ui';
import noInternetAnimation from '../../../assets/lottie/no-internet.json';
import NetInfo from '@react-native-community/netinfo';
import {YStack, XStack} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {router} from 'expo-router';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export const OfflineNotice = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const {isDarkMode} = useTamaguiTheme();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        setIsDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isConnected !== false || isDismissed) {
    return null;
  }

  const handleOpenDetails = () => {
    setIsDismissed(true);
    try {
      router.push('/network-unavailable');
    } catch {
      // route may be handled modal
    }
  };

  return (
    <YStack
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={99999}
      style={{elevation: 99999}}
      backgroundColor={isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.55)'}
      alignItems="center"
      justifyContent="center"
      padding="$4">
      <YStack maxWidth={340} width="100%">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" justifyContent="center" gap="$3">
            {/* Offline Lottie Animation */}
            <LottieAnimationView
              source={noInternetAnimation}
              autoPlay
              loop
              width={160}
              height={160}
            />

            <YStack alignItems="center" gap="$1.5">
              <Text fontSize="$5" color="$color" fontWeight="800" textAlign="center">
                No Internet Connection
              </Text>
              <Text fontSize="$3" color="$color11" textAlign="center" lineHeight={20}>
                You can keep using Buddy. Your transactions will sync automatically once you’re back
                online.
              </Text>
            </YStack>

            <YStack width="100%" gap="$2.5" marginTop="$2">
              <Button
                backgroundColor="$blue10"
                color="white"
                borderRadius={12}
                height={48}
                onPress={() => setIsDismissed(true)}
                pressStyle={{opacity: 0.85}}
                accessibilityLabel="Dismiss offline notice">
                <Text color="white" fontWeight="700" fontSize="$3">
                  OK, Got it
                </Text>
              </Button>

              <Button
                variant="outline"
                borderColor="$borderColor"
                color="$color"
                borderRadius={12}
                height={48}
                onPress={handleOpenDetails}
                accessibilityLabel="View offline details and reconnection options">
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={isDarkMode ? '#e4e4e7' : '#27272a'}
                  />
                  <Text color="$color" fontWeight="600" fontSize="$3">
                    Connection Details
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        </GlassSurface>
      </YStack>
    </YStack>
  );
};

export default OfflineNotice;
