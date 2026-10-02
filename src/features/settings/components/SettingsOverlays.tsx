import {Text} from '@ravitamil/buddy-ui';
import {Dialog} from '@ravitamil/buddy-ui/overlays';
import {Portal} from '@tamagui/portal';
import React from 'react';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {View} from 'tamagui';

import {LottieAnimationView} from '@ravitamil/buddy-ui';
import type {SettingsModalAction, UseSettingsScreenResult} from '../hooks/useSettingsScreen';
import LoadingAnimation from '../../../../assets/lottie/Loading.json';

interface SettingsModalProps {
  screen: UseSettingsScreenResult;
}

export function SettingsModal({screen}: SettingsModalProps) {
  const actions: SettingsModalAction[] =
    screen.modalActions.length > 0
      ? screen.modalActions
      : [
          {
            text: 'OK',
            onPress: screen.hideModal,
            variant: 'default',
          },
        ];

  return (
    <Dialog
      open={screen.modalVisible}
      onOpenChange={(open) => {
        if (!open) screen.hideModal();
      }}
      title={screen.modalTitle}
      description={screen.modalMessage}
      actions={actions.map((action) => ({
        label: action.text,
        onPress: action.onPress,
        tone:
          action.variant === 'destructive'
            ? ('destructive' as const)
            : action.variant === 'success'
              ? ('success' as const)
              : action.text.toLowerCase() === 'cancel'
                ? ('outline' as const)
                : ('primary' as const),
      }))}
    />
  );
}

interface SettingsLoadingOverlayProps {
  isVisible: boolean;
  isDarkMode: boolean;
  title: string;
  message: string;
  size?: number;
}

export function SettingsLoadingOverlay({
  isVisible,
  isDarkMode,
  title,
  message,
  size = 150,
}: SettingsLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <Portal>
      <View
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        justifyContent="center"
        alignItems="center"
        zIndex={99999}
        backgroundColor="$colorTransparent">
        <GlassBackdrop
          intensity={95}
          tint={isDarkMode ? 'dark' : 'light'}
          style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <View width="100%" height="100%" justifyContent="center" alignItems="center">
            <LottieAnimationView
              source={LoadingAnimation}
              width={size}
              height={size}
              autoPlay
              loop
              backgroundColor="transparent"
            />
            <Text
              variant="h3"
              color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
              weight="bold"
              marginTop="$4">
              {title}
            </Text>
            <Text
              variant="body1"
              color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
              textAlign="center"
              marginTop="$2"
              paddingHorizontal="$4">
              {message}
            </Text>
          </View>
        </GlassBackdrop>
      </View>
    </Portal>
  );
}
