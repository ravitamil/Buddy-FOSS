import {HStack, VStack} from '@ravitamil/buddy-ui';
import React, {useEffect, useRef} from 'react';
import {Animated as RNAnimated} from 'react-native';
import {View} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export const GroupInsightsSkeleton: React.FC = React.memo(() => {
  const {isDarkMode} = useTamaguiTheme();
  const opacity = useRef(new RNAnimated.Value(0.3)).current;
  const mutedBg = isDarkMode ? '$gray2' : '$gray1';
  const strongBg = isDarkMode ? '$gray4' : '$gray3';
  const softBg = isDarkMode ? '$gray3' : '$gray2';

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <RNAnimated.View style={{opacity}}>
      <VStack gap="$4">
        <VStack gap="$4" padding="$4" borderRadius="$4" backgroundColor={mutedBg}>
          <View style={{height: 24, width: '60%', backgroundColor: strongBg, borderRadius: 4}} />
          <HStack justifyContent="space-between">
            {[1, 2, 3].map((item) => (
              <VStack key={item} alignItems="center" flex={1} gap="$2">
                <View
                  style={{height: 32, width: '80%', backgroundColor: strongBg, borderRadius: 4}}
                />
                <View
                  style={{height: 16, width: '60%', backgroundColor: strongBg, borderRadius: 4}}
                />
              </VStack>
            ))}
          </HStack>
        </VStack>

        <HStack gap="$3">
          <View style={{flex: 1, height: 44, backgroundColor: mutedBg, borderRadius: 12}} />
          <View style={{flex: 1, height: 44, backgroundColor: mutedBg, borderRadius: 12}} />
        </HStack>

        <VStack gap="$3">
          <View style={{height: 24, width: '50%', backgroundColor: mutedBg, borderRadius: 4}} />
          {[1, 2, 3].map((item) => (
            <VStack key={item} gap="$3" padding="$4" borderRadius="$4" backgroundColor={mutedBg}>
              <HStack alignItems="center" gap="$3">
                <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: softBg}} />
                <VStack flex={1} gap="$2">
                  <View
                    style={{height: 16, width: '60%', backgroundColor: softBg, borderRadius: 4}}
                  />
                  <View
                    style={{height: 14, width: '40%', backgroundColor: softBg, borderRadius: 4}}
                  />
                </VStack>
              </HStack>
            </VStack>
          ))}
        </VStack>
      </VStack>
    </RNAnimated.View>
  );
});

GroupInsightsSkeleton.displayName = 'GroupInsightsSkeleton';
