import React, {useCallback, useEffect, useState} from 'react';
/* eslint-disable development-quality/enforce-tamagui-usage -- native animated styles require resolved values */
import {BackHandler, Keyboard, Platform, Pressable, StyleSheet} from 'react-native';
import * as Haptics from 'expo-haptics';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {
  Easing,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {XStack, YStack, useTheme} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {LoadingIndicator} from './LoadingIndicator';
import {Text} from './Text';
import {inferIsDarkMode} from './utils';
import {useBuddyColors} from './useBuddyColors';

export interface SpeedDialAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info';
  onPress: () => void;
  testID?: string;
}

export interface FloatingActionProps {
  onPress?: () => void;
  actions?: SpeedDialAction[];
  presentation?: 'circular' | 'extended' | 'save';
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info';
  position?: 'right' | 'center';
  bottomOffset?: number;
  isScrollingDown?: SharedValue<boolean>;
  autoHideOnKeyboard?: boolean;
  showScrim?: boolean;
  testID?: string;
}

export const FloatingAction = React.memo<FloatingActionProps>(
  ({
    onPress,
    actions,
    presentation = 'circular',
    icon = presentation === 'save' ? 'checkmark' : 'add',
    label,
    disabled = false,
    loading = false,
    variant = 'primary',
    position = 'right',
    bottomOffset = 0,
    isScrollingDown,
    autoHideOnKeyboard = true,
    showScrim = presentation === 'save',
    testID,
  }) => {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const colors = useBuddyColors();
    const isDarkMode = inferIsDarkMode(theme);
    const {progress: keyboardProgress, height: keyboardHeight} = useReanimatedKeyboardAnimation();
    const isKeyboardVisible = useSharedValue(false);
    const pressScale = useSharedValue(1);
    const shimmerProgress = useSharedValue(-1);

    const isSave = presentation === 'save';
    const isExtended = presentation === 'extended';
    const inactive = disabled || loading;

    const bottom = Math.max(24, insets.bottom + (isSave ? 8 : 16)) + bottomOffset;

    const hasActions = Boolean(actions && actions.length > 0);
    const [isOpen, setIsOpen] = useState(false);
    const openProgress = useSharedValue(0);

    useEffect(() => {
      openProgress.value = withSpring(isOpen ? 1 : 0, {
        damping: 16,
        stiffness: 220,
        mass: 0.8,
      });
    }, [isOpen, openProgress]);

    // BackHandler to dismiss speed dial when open
    useEffect(() => {
      if (!isOpen) return;

      const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setIsOpen(false);
        return true;
      });

      return () => backSubscription.remove();
    }, [isOpen]);

    const semanticRole = variant === 'danger' ? 'error' : variant;
    const fill =
      variant === 'secondary'
        ? colors.surface
        : colors[semanticRole === 'secondary' ? 'primary' : semanticRole];
    const gradientColors: [string, string, string] = inactive
      ? [colors.surface, colors.surfaceHover, colors.surfacePress]
      : variant === 'primary'
        ? [colors.primary, colors.primaryHover, colors.primaryPress]
        : [fill, fill, fill];
    const glowColor = inactive || variant === 'secondary' ? 'transparent' : fill;
    const iconColor = inactive
      ? colors.textDisabled
      : variant === 'primary'
        ? colors.buttonPrimaryText
        : variant === 'secondary'
          ? colors.text
          : colors.semanticOnColor;

    const labelColor = '$textSecondary';

    // Keyboard state tracking
    useEffect(() => {
      if (!autoHideOnKeyboard) return;

      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, () => {
        isKeyboardVisible.value = true;
      });
      const hideSub = Keyboard.addListener(hideEvent, () => {
        isKeyboardVisible.value = false;
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, [autoHideOnKeyboard, isKeyboardVisible]);

    // Shimmer sweep animation loop
    useEffect(() => {
      if (!inactive) {
        shimmerProgress.value = withRepeat(
          withSequence(
            withTiming(2, {
              duration: 1500,
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            }),
            withDelay(
              1800,
              withTiming(-1, {
                duration: 0,
              }),
            ),
          ),
          -1,
          false,
        );
      } else {
        shimmerProgress.value = -1;
      }
    }, [inactive, shimmerProgress]);

    const handlePressIn = useCallback(() => {
      if (inactive) return;
      pressScale.value = withSpring(0.92, {
        damping: 12,
        stiffness: 240,
        mass: 0.6,
      });
    }, [inactive, pressScale]);

    const handlePressOut = useCallback(() => {
      pressScale.value = withSpring(1, {
        damping: 14,
        stiffness: 200,
      });
    }, [pressScale]);

    const handlePress = useCallback(() => {
      if (inactive) return;
      try {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch {
        // Haptics unavailable
      }
      if (hasActions) {
        setIsOpen((prev) => !prev);
      } else if (onPress) {
        onPress();
      }
    }, [hasActions, inactive, onPress]);

    // Container slide-away and fade on keyboard / scroll
    const animatedContainerStyle = useAnimatedStyle(() => {
      const isKeyboardActive =
        autoHideOnKeyboard &&
        (isKeyboardVisible.value ||
          (keyboardProgress && keyboardProgress.value > 0.05) ||
          (keyboardHeight && Math.abs(keyboardHeight.value) > 10));
      const isScrolledDown = isScrollingDown ? isScrollingDown.value : false;
      const isHidden = isKeyboardActive || isScrolledDown;

      return {
        transform: [
          {
            translateY: withSpring(isHidden ? 140 : 0, {
              damping: 18,
              stiffness: 160,
              mass: 0.8,
            }),
          },
        ],
        opacity: withTiming(isHidden ? 0 : 1, {
          duration: isHidden ? 150 : 220,
        }),
      };
    });

    const animatedButtonStyle = useAnimatedStyle(() => ({
      transform: [{scale: pressScale.value}],
    }));

    const animatedIconStyle = useAnimatedStyle(() => {
      if (!hasActions) return {};
      const rotation = interpolate(openProgress.value, [0, 1], [0, 45]);
      return {
        transform: [{rotate: `${rotation}deg`}],
      };
    });

    const animatedScrimStyle = useAnimatedStyle(() => ({
      opacity: withTiming(openProgress.value, {duration: 180}),
    }));

    // Shimmer beam sweep animated style
    const animatedShimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(shimmerProgress.value, [-1, 2], [-80, 160]);
      return {
        transform: [{translateX}, {rotate: '25deg'}],
        opacity: inactive ? 0 : 1,
      };
    });

    const scrimHeight = Math.max(120, insets.bottom + 90);

    const buttonBody = (
      <Animated.View
        style={[
          styles.glowWrapper,
          isSave ? styles.sizeSave : isExtended ? styles.sizeExtended : styles.sizeCircular,
          {
            shadowColor: glowColor,
            shadowOpacity: inactive ? 0 : isDarkMode ? 0.45 : 0.35,
            elevation: inactive ? 0 : 8,
          },
          animatedButtonStyle,
        ]}>
        <YStack
          style={[
            styles.buttonOuter,
            isSave ? styles.sizeSave : isExtended ? styles.sizeExtended : styles.sizeCircular,
            inactive
              ? isDarkMode
                ? styles.borderDisabledDark
                : styles.borderDisabledLight
              : isDarkMode
                ? styles.borderActiveDark
                : styles.borderActiveLight,
          ]}>
          {/* Multi-stop Diagonal Gradient Colors */}
          <LinearGradient
            colors={gradientColors}
            locations={[0, 0.45, 1]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />

          {/* Shimmer Light Beam Effect */}
          {!inactive ? (
            <Animated.View style={[styles.shimmerBeamWrapper, animatedShimmerStyle]}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0)',
                  'rgba(255, 255, 255, 0.45)',
                  'rgba(255, 255, 255, 0)',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          ) : null}

          {/* Content: Icon + Label (Extended) or Centered Icon */}
          {isExtended ? (
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$2"
              paddingHorizontal="$4"
              zIndex={10}>
              {loading ? (
                <LoadingIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name={icon} size={22} color={iconColor} />
              )}
              {label ? (
                <Text
                  color={iconColor}
                  fontWeight="700"
                  fontSize={15}
                  letterSpacing={-0.2}
                  numberOfLines={1}>
                  {label}
                </Text>
              ) : null}
            </XStack>
          ) : (
            <YStack style={styles.centerContent}>
              {loading ? (
                <LoadingIndicator size="small" color="#ffffff" />
              ) : (
                <Animated.View style={hasActions ? animatedIconStyle : undefined}>
                  <Ionicons name={icon} size={isSave ? 32 : 28} color={iconColor} />
                </Animated.View>
              )}
            </YStack>
          )}
        </YStack>
      </Animated.View>
    );

    if (isSave) {
      return (
        <>
          {showScrim ? (
            <Animated.View
              style={[styles.scrimContainer, {height: scrimHeight}, animatedContainerStyle]}
              pointerEvents="none">
              <LinearGradient
                colors={[
                  'rgba(0, 0, 0, 0)',
                  isDarkMode ? 'rgba(16, 12, 8, 0.75)' : 'rgba(251, 252, 250, 0.82)',
                  isDarkMode ? '#100C08' : '#fbfcfa',
                ]}
                locations={[0, 0.42, 1]}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          ) : null}

          <Animated.View
            testID={testID}
            style={[styles.saveContainer, {bottom}, animatedContainerStyle]}
            pointerEvents="box-none">
            <Pressable
              onPress={handlePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={inactive}
              accessibilityRole="button"
              accessibilityLabel={label ?? 'Save'}
              accessibilityState={{disabled: inactive, busy: loading}}
              style={styles.pressable}>
              {buttonBody}
              {label ? (
                <Text
                  color={labelColor}
                  textAlign="center"
                  marginTop="$2.5"
                  fontWeight="600"
                  fontSize={13}
                  letterSpacing={-0.1}>
                  {loading ? 'Saving...' : label}
                </Text>
              ) : null}
            </Pressable>
          </Animated.View>
        </>
      );
    }

    return (
      <>
        {/* Full-screen backdrop scrim when speed dial is open */}
        {hasActions && isOpen ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.scrimBackdrop,
              {
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)',
              },
              animatedScrimStyle,
            ]}
            pointerEvents="auto">
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close actions"
            />
          </Animated.View>
        ) : null}

        <Animated.View
          testID={testID}
          style={[
            styles.floatingContainer,
            {
              bottom,
              right: position === 'right' ? 24 : undefined,
              left: position === 'center' ? '50%' : undefined,
              marginLeft: position === 'center' ? (isExtended ? -75 : -28) : 0,
            },
            animatedContainerStyle,
          ]}
          pointerEvents="box-none">
          {/* Action buttons stacked above main FAB */}
          {hasActions && isOpen ? (
            <YStack
              position="absolute"
              bottom={68}
              right={0}
              alignItems="flex-end"
              gap="$3"
              zIndex={1001}>
              {actions?.map((action, index) => (
                <SpeedDialActionButton
                  key={action.id}
                  action={action}
                  index={actions.length - 1 - index}
                  isDarkMode={isDarkMode}
                  colors={colors}
                  onPress={() => {
                    setIsOpen(false);
                    action.onPress();
                  }}
                />
              ))}
            </YStack>
          ) : null}

          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityLabel={
              hasActions
                ? isOpen
                  ? 'Close actions'
                  : (label ?? 'Open actions')
                : (label ?? 'Action')
            }
            accessibilityState={{
              disabled: inactive,
              busy: loading,
              expanded: hasActions ? isOpen : undefined,
            }}
            style={styles.pressable}>
            {buttonBody}
          </Pressable>
        </Animated.View>
      </>
    );
  },
);

FloatingAction.displayName = 'FloatingAction';

interface SpeedDialActionButtonProps {
  action: SpeedDialAction;
  index: number;
  isDarkMode: boolean;
  colors: ReturnType<typeof useBuddyColors>;
  onPress: () => void;
}

const SpeedDialActionButton: React.FC<SpeedDialActionButtonProps> = ({
  action,
  index,
  isDarkMode,
  colors,
  onPress,
}) => {
  const pressScale = useSharedValue(1);
  const appearAnim = useSharedValue(0);

  useEffect(() => {
    appearAnim.value = withDelay(index * 35, withSpring(1, {damping: 14, stiffness: 220}));
  }, [appearAnim, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: appearAnim.value,
    transform: [
      {translateY: interpolate(appearAnim.value, [0, 1], [16, 0])},
      {scale: pressScale.value * interpolate(appearAnim.value, [0, 1], [0.85, 1])},
    ],
  }));

  const variant = action.variant ?? 'primary';
  const actionFill =
    variant === 'danger'
      ? '#F43F5E'
      : variant === 'success'
        ? '#10B981'
        : variant === 'info'
          ? '#3B82F6'
          : colors.primary;

  const gradientColors: [string, string, string] =
    variant === 'success'
      ? ['#10B981', '#059669', '#047857']
      : variant === 'danger'
        ? ['#F43F5E', '#E11D48', '#BE123C']
        : variant === 'info'
          ? ['#3B82F6', '#2563EB', '#1D4ED8']
          : [colors.primary, colors.primaryHover, colors.primaryPress];

  const handlePressIn = () => {
    pressScale.value = withSpring(0.92, {damping: 12, stiffness: 240});
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {damping: 14, stiffness: 200});
  };

  const handlePress = () => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={action.testID}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        style={styles.actionPressable}>
        <XStack alignItems="center" gap="$3">
          {/* Label Pill */}
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$10"
            backgroundColor={isDarkMode ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.96)'}
            borderWidth={1}
            borderColor="$borderColor"
            shadowColor="#000000"
            shadowOffset={{width: 0, height: 2}}
            shadowOpacity={0.15}
            shadowRadius={6}
            elevation={4}>
            <Text
              fontSize={14}
              fontWeight="600"
              color={isDarkMode ? '#F8FAFC' : '#0F172A'}
              letterSpacing={-0.1}>
              {action.label}
            </Text>
          </XStack>

          {/* Mini Circular FAB */}
          <YStack
            width={46}
            height={46}
            borderRadius={23}
            overflow="hidden"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)'}
            shadowColor={actionFill}
            shadowOffset={{width: 0, height: 3}}
            shadowOpacity={0.4}
            shadowRadius={8}
            elevation={6}
            position="relative">
            <LinearGradient
              colors={gradientColors}
              locations={[0, 0.5, 1]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name={action.icon} size={22} color="#FFFFFF" />
          </YStack>
        </XStack>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrimContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  saveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 14,
  },
  sizeSave: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sizeCircular: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sizeExtended: {
    height: 52,
    minWidth: 130,
    borderRadius: 26,
  },
  buttonOuter: {
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  borderActiveLight: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  borderActiveDark: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  borderDisabledLight: {
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  borderDisabledDark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shimmerBeamWrapper: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 45,
    zIndex: 5,
  },
  centerContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  actionPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scrimBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
