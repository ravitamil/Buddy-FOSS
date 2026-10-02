import {LottieAnimationView} from '@ravitamil/buddy-ui';
import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {View, useTheme} from 'tamagui';

import {resolveThemeColor} from '@ravitamil/buddy-ui';

export interface GroupDeletingOverlayProps {
  isVisible: boolean;
  isDarkMode: boolean;
  loadingSource: ImageSourcePropType;
}

export const GroupDeletingOverlay: React.FC<GroupDeletingOverlayProps> = ({
  isVisible,
  isDarkMode,
  loadingSource,
}) => {
  const theme = useTheme();
  if (!isVisible) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: resolveThemeColor(theme, 'glassStrong', 'rgba(0, 0, 0, 0.72)'),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
      }}>
      <GlassBackdrop
        intensity={95}
        tint={isDarkMode ? 'dark' : 'light'}
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <VStack alignItems="center" gap="$4">
          <LottieAnimationView
            source={loadingSource}
            width={150}
            height={150}
            backgroundColor="transparent"
          />
          <Text variant="h4" color="white" weight="bold" textAlign="center">
            Cleaning up residues...
          </Text>
        </VStack>
      </GlassBackdrop>
    </View>
  );
};
