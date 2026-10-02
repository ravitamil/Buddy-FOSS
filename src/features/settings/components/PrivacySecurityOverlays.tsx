import {LottieAnimationView} from '@ravitamil/buddy-ui';
import {BottomSheet, BottomSheetOption, ConfirmationDialog} from '@ravitamil/buddy-ui/overlays';
import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {View} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import loadingAnimation from '../../../../assets/lottie/Loading.json';
import {
  AUTO_LOCK_TIMEOUT_OPTIONS,
  type PrivacySecurityScreenModel,
} from '../hooks/usePrivacySecurityScreen';

interface PrivacySecurityOverlayProps {
  screen: PrivacySecurityScreenModel;
}

export function DeleteDataLoadingOverlay({screen}: PrivacySecurityOverlayProps) {
  const {isDarkMode} = useTamaguiTheme();

  if (!screen.isDeleting) return null;

  return (
    <View
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      justifyContent="center"
      alignItems="center"
      zIndex={9999}>
      <GlassBackdrop
        intensity={80}
        tint={isDarkMode ? 'dark' : 'light'}
        style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <View width="100%" height="100%" justifyContent="center" alignItems="center">
          <LottieAnimationView
            source={loadingAnimation}
            width={200}
            height={200}
            autoPlay={true}
            loop={true}
            backgroundColor="transparent"
          />
          <Text
            variant="h3"
            color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
            weight="bold"
            marginTop="$4">
            Deleting Data
          </Text>
          <Text
            variant="body1"
            color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
            textAlign="center"
            marginTop="$2"
            paddingHorizontal="$4">
            Please wait while we securely delete all your financial data...
          </Text>
        </View>
      </GlassBackdrop>
    </View>
  );
}

export function AutoLockTimeoutSheet({screen}: PrivacySecurityOverlayProps) {
  return (
    <BottomSheet
      open={screen.showTimeoutSheet}
      onOpenChange={screen.setShowTimeoutSheet}
      snapPoints={[50]}
      scrollable
      title="Auto-lock Timeout"
      description="Choose when the app should automatically lock">
      {AUTO_LOCK_TIMEOUT_OPTIONS.map((option) => {
        const isSelected = screen.autoLockTimeout === option.value;

        return (
          <BottomSheetOption
            key={option.value}
            label={option.label}
            selected={isSelected}
            onPress={() => screen.handleTimeoutSelect(option.value)}
          />
        );
      })}
    </BottomSheet>
  );
}

export function DeleteDataConfirmationModal({screen}: PrivacySecurityOverlayProps) {
  return (
    <ConfirmationDialog
      open={screen.showDeleteModal}
      onOpenChange={(open) => {
        if (!open) screen.setShowDeleteModal(false);
      }}
      title="Delete All Data"
      description="This will permanently delete all your financial data from both your device and the cloud. This action cannot be undone. Your account will remain active, but all transactions, budgets, savings goals, and other financial information will be lost."
      onCancel={() => screen.setShowDeleteModal(false)}
      onConfirm={() => void screen.confirmDeleteData()}
      confirmLabel="Delete"
    />
  );
}
