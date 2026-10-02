import React, {useEffect, useState} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {XStack, YStack, styled} from 'tamagui';
import {Button, Card, Text} from '@ravitamil/buddy-ui';

interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface CustomToastProps {
  config: ToastConfig;
  onHide: (id: string) => void;
}

type ToastIconName = React.ComponentProps<typeof Ionicons>['name'];

interface ToastStyle {
  icon: ToastIconName;
  accentColorToken: string;
}

const CustomToast: React.FC<CustomToastProps> = ({config, onHide}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Get icon and colors based on type using Tamagui semantic theme tokens.
  const getToastStyle = (type: ToastConfig['type']): ToastStyle => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          accentColorToken: '$success',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          accentColorToken: '$error',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          accentColorToken: '$warning',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          accentColorToken: '$info',
        };
      default:
        return {
          icon: 'information-circle' as const,
          accentColorToken: '$colorSecondary',
        };
    }
  };

  const toastStyle = getToastStyle(config.type);

  // Auto-hide toast
  useEffect(() => {
    const duration = config.duration || 4000;

    // Show animation
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.back(1.7)),
    });
    opacity.value = withTiming(1, {duration: 300});
    scale.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(hideTimer);
  }, []);

  const hideToast = () => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    });
    opacity.value = withTiming(0, {duration: 300});
    scale.value = withTiming(0.8, {duration: 300});

    setTimeout(() => {
      setIsVisible(false);
      runOnJS(onHide)(config.id);
    }, 300);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}, {scale: scale.value}],
      opacity: opacity.value,
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: '100%',
          zIndex: 9999,
        },
      ]}>
      <ToastCard elevation={1}>
        <YStack height={4} width="100%" backgroundColor={toastStyle.accentColorToken} />

        <XStack padding="$4" alignItems="flex-start" gap="$3">
          <ThemedIonicon
            name={toastStyle.icon}
            size={24}
            color={toastStyle.accentColorToken}
            style={{marginTop: 2}}
          />

          <YStack flex={1} gap="$1">
            <Text variant="body1" color="$text" weight="bold" numberOfLines={2}>
              {config.title}
            </Text>

            {config.message && (
              <Text variant="body2" color="$textSecondary" numberOfLines={3} lineHeight={18}>
                {config.message}
              </Text>
            )}

            {config.action && (
              <Button
                size="small"
                variant="outline"
                borderColor={toastStyle.accentColorToken}
                color={toastStyle.accentColorToken}
                backgroundColor="transparent"
                hoverStyle={{backgroundColor: '$backgroundHover'}}
                pressStyle={{backgroundColor: '$backgroundPress'}}
                marginTop="$2"
                onPress={config.action.onPress}>
                {config.action.label}
              </Button>
            )}
          </YStack>

          <ToastCloseButton
            onPress={() => onHide(config.id)}
            accessibilityLabel="Close toast"
            accessibilityRole="button">
            <ThemedIonicon name="close" size={16} color="$iconSecondary" />
          </ToastCloseButton>
        </XStack>
      </ToastCard>
    </Animated.View>
  );
};

const ToastCard = styled(Card, {
  name: 'CustomToastCard',
  width: '100%',
  backgroundColor: '$surface',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$4',
  padding: '$0',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.14,
  shadowRadius: 8,
});

const ToastCloseButton = styled(YStack, {
  name: 'CustomToastCloseButton',
  backgroundColor: '$backgroundHover',
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  hoverStyle: {backgroundColor: '$backgroundPress'},
  pressStyle: {backgroundColor: '$surfacePress', scale: 0.98},
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

export default CustomToast;
