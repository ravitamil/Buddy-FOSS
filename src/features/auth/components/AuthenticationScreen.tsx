import {Button, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import {Dialog} from '@ravitamil/buddy-ui/overlays';
/**
 * Authentication Screen Component
 * Main authentication screen with Google Sign-In integration
 */

import React, {useState} from 'react';
import {YStack, XStack, Separator} from 'tamagui';
import {Image} from 'expo-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer, DayNightThemeSwitch} from '@/components/ui';
import {GoogleSignInButton} from './GoogleSignInButton';
import {EmailAuthButton} from './EmailAuthButton';
import {AnonymousAuthButton} from './AnonymousAuthButton';
import {PhoneAuthButton} from './PhoneAuthButton';
import {useGoogleAuth} from '@/hooks/useGoogleAuth';
import {AuthError} from '@/types/auth.types';
import {SuccessAnimationScreen} from '@/features/auth/components/SuccessAnimationScreen';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {logger as appLogger} from '@/services/LoggerService';
import coinsLogoSource from '../../../../assets/appLogo/coins-logo.png';

const logger = appLogger.contextLogger('AuthenticationScreen');
const unknownUserLabel = 'Unknown user';

interface AuthenticationScreenProps {
  onAuthSuccess?: () => void;
  showAlternativeAuth?: boolean;
}

interface AuthenticatedUserReference {
  uid?: string;
}

interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'success';
}

export function AuthenticationScreen({
  onAuthSuccess,
  showAlternativeAuth = true,
}: AuthenticationScreenProps) {
  const {isDarkMode, toggleTheme} = useTamaguiTheme();
  const insets = useSafeAreaInsets();
  const {authState} = useGoogleAuth();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalActions, setModalActions] = useState<ModalAction[]>([]);

  const showModal = (title: string, message: string, actions: ModalAction[] = []) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalActions(actions);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const showAuthSuccess = () => {
    setShowSuccessAnimation(true);
    onAuthSuccess?.();
  };

  const getUserIdLabel = (user?: AuthenticatedUserReference) => user?.uid ?? unknownUserLabel;

  const handleSignInSuccess = (user?: AuthenticatedUserReference) => {
    logger.debug('Authentication successful:', getUserIdLabel(user));
    showAuthSuccess();
  };

  const handleSignInError = (error: string | AuthError) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    logger.error('Authentication error:', errorMessage);
    showModal('Sign-In Error', errorMessage, [{text: 'OK', onPress: hideModal}]);
  };

  const handleSignInCancel = () => {
    logger.debug('User cancelled sign-in');
  };

  const handleAnonymousAuthSuccess = (user?: AuthenticatedUserReference) => {
    logger.debug('Anonymous authentication successful:', getUserIdLabel(user));
    showAuthSuccess();
  };

  const handleSignOut = async () => {
    try {
      logger.debug('AuthenticationScreen: Using centralized sign out utility...');
      const {signOutAndNavigate} = await import('@/utils/signOutUtils');
      await signOutAndNavigate();
      showModal('Signed Out', 'You have been signed out successfully.');
    } catch (error) {
      logger.error('AuthenticationScreen: Sign out failed:', error);
      showModal('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleThemeTogglePress = () => {
    void toggleTheme();
  };

  const handleSignOutPress = () => {
    void handleSignOut();
  };

  const themeToggleTop = insets.top + 12;

  // Show success animation for existing users
  if (showSuccessAnimation) {
    return (
      <SuccessAnimationScreen
        type="existingUser"
        message="Welcome back!"
        duration={3000}
        navigateTo="/(tabs)"
      />
    );
  }

  // If user is already authenticated, show profile
  if (authState.isAuthenticated && authState.user) {
    return (
      <ScreenContainer showDots={false} ignoreBottomSafeArea={true}>
        {/* Theme Toggle Switch - Top Right */}
        <YStack position="absolute" top={themeToggleTop} right={20} zIndex={1000}>
          <DayNightThemeSwitch
            checked={isDarkMode}
            onCheckedChange={handleThemeTogglePress}
            testID="auth-profile-theme-switch"
            accessibilityLabel={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          />
        </YStack>

        <YStack flex={1} padding="$4" paddingTop="$8" justifyContent="center" gap="$4">
          <GlassSurface padding="$6" borderRadius={16}>
            <YStack alignItems="center" gap="$4">
              <Text fontSize="$6" fontWeight="bold" color="$color">
                Welcome back!
              </Text>
              <Text fontSize="$4" color="$color11" textAlign="center">
                You are signed in as:
              </Text>
              <Text fontSize="$5" fontWeight="600" color="$color">
                {authState.user.name || authState.user.email || 'User'}
              </Text>
              <Button
                onPress={handleSignOutPress}
                backgroundColor="$red9"
                color="white"
                borderRadius={12}
                paddingHorizontal="$6"
                paddingVertical="$3">
                Sign Out
              </Button>
            </YStack>
          </GlassSurface>

          {/* Glassmorphism Modal */}
          <Dialog
            open={modalVisible}
            onOpenChange={(open) => {
              if (!open) hideModal();
            }}
            title={modalTitle}
            description={modalMessage}
            actions={modalActions.map(toDialogAction)}
          />
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      {/* Theme Toggle Switch - Top Right */}
      <YStack position="absolute" top={themeToggleTop} right={20} zIndex={1000}>
        <DayNightThemeSwitch
          checked={isDarkMode}
          onCheckedChange={handleThemeTogglePress}
          testID="login-theme-switch"
          accessibilityLabel={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        />
      </YStack>

      <YStack
        flex={1}
        paddingHorizontal="$4"
        paddingTop={themeToggleTop + 36}
        paddingBottom="$4"
        justifyContent="space-between">
        {/* Brand / Hero Header */}
        <YStack alignItems="center" gap="$3" width="100%">
          <Image
            source={coinsLogoSource}
            contentFit="contain"
            style={{
              width: 120,
              height: 120,
            }}
          />

          <YStack alignItems="center" width="100%" paddingHorizontal="$3">
            <Text
              color="$color"
              align="center"
              weight="bold"
              fontSize="$10"
              lineHeight={48}
              letterSpacing={-1.3}>
              Your money,
            </Text>
            <Text
              color="$iconBrand"
              align="center"
              weight="bold"
              fontSize="$10"
              lineHeight={48}
              letterSpacing={-1.3}>
              in sync.
            </Text>
            <Text
              variant="body1"
              color="$colorSecondary"
              align="center"
              lineHeight={22}
              marginTop="$2">
              One place for everything.{`\n`}Always up to date.
            </Text>
          </YStack>
        </YStack>

        {/* Main Fluid Surface Authentication Card */}
        <YStack width="100%" gap="$3">
          <GlassSurface padding="$4" borderRadius={24}>
            <YStack gap="$3">
              <Text
                color="$colorSecondary"
                textAlign="center"
                fontWeight="700"
                fontSize="$2"
                letterSpacing={0.8}>
                GET STARTED
              </Text>

              {/* Primary Google Sign-In */}
              <GoogleSignInButton
                onSignInSuccess={handleSignInSuccess}
                onSignInError={handleSignInError}
                onSignInCancel={handleSignInCancel}
              />

              {/* Alternative Auth Options */}
              {showAlternativeAuth ? (
                <>
                  <XStack alignItems="center" gap="$3" marginVertical="$1">
                    <Separator flex={1} borderColor="$borderColor" />
                    <Text
                      color="$colorSecondary"
                      fontSize="$1"
                      fontWeight="600"
                      letterSpacing={0.5}>
                      OR CONTINUE WITH
                    </Text>
                    <Separator flex={1} borderColor="$borderColor" />
                  </XStack>

                  <EmailAuthButton onError={handleSignInError} />
                </>
              ) : null}
            </YStack>
          </GlassSurface>

          {/* Secondary Actions below Card */}
          {showAlternativeAuth ? (
            <YStack alignItems="center" gap="$1">
              <PhoneAuthButton compact onError={handleSignInError} />
              <AnonymousAuthButton
                compact
                disabled
                onSuccess={handleAnonymousAuthSuccess}
                onError={handleSignInError}
              />
            </YStack>
          ) : null}
        </YStack>

        {/* Footer */}
        <YStack alignItems="center" paddingVertical="$2">
          <Text color="$colorSecondary" fontSize="$2" textAlign="center">
            Made with ❤️ in India
          </Text>
        </YStack>
      </YStack>

      {/* Glassmorphism Modal */}
      <Dialog
        open={modalVisible}
        onOpenChange={(open) => {
          if (!open) hideModal();
        }}
        title={modalTitle}
        description={modalMessage}
        actions={modalActions.map(toDialogAction)}
      />
    </ScreenContainer>
  );
}

const toDialogAction = (action: ModalAction) => ({
  label: action.text,
  onPress: action.onPress,
  tone:
    action.variant === 'destructive'
      ? ('destructive' as const)
      : action.variant === 'success'
        ? ('success' as const)
        : ('default' as const),
});
