import React from 'react';
import {BackHandler} from 'react-native';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';
import {Sheet, XStack, YStack, styled, useTheme} from 'tamagui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Ionicons} from '../icons/AppIcon';
import {useBlurTarget} from '../mobile';
import {Button} from '../Button';
import {Text} from '../Text';
import {inferIsDarkMode, resolveThemeColor} from '../utils';
import {type DialogAction, DialogActionButton} from './DialogAction';

export interface BottomSheetProps {
  children: React.ReactNode;
  defaultPosition?: number;
  description?: string;
  fill?: boolean;
  moveOnKeyboardChange?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  footer?: React.ReactNode;
  scrollable?: boolean;
  snapPoints?: number[];
  title?: string;
  testID?: string;
  zIndex?: number;
}

export interface BottomSheetOptionProps {
  description?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  leading?: React.ReactNode;
  label: string;
  onPress: () => void;
  selected?: boolean;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  testID?: string;
}

export interface BottomSheetActionProps {
  description?: string;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  testID?: string;
  tone?: 'default' | 'destructive';
}

export interface AdaptiveSheetProps {
  children?: React.ReactNode;
  snapPoints?: number[];
  title?: string;
  description?: string;
  actions?: readonly DialogAction[];
  dialogChildren?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export const bottomSheetChrome = {
  motion: 'quick' as const,
  overlayColor: 'rgba(0, 0, 0, 0.58)',
  radius: 28,
};

export function BottomSheet({
  children,
  defaultPosition,
  description,
  fill,
  footer,
  moveOnKeyboardChange = false,
  onOpenChange,
  open,
  scrollable = false,
  snapPoints,
  title,
  testID = 'buddy-bottom-sheet-frame',
  zIndex,
}: BottomSheetProps) {
  const resolvedSnapPoints = snapPoints ?? (scrollable ? [80] : [32]);
  const shouldFill = fill ?? Boolean(snapPoints);

  React.useEffect(() => {
    if (!open) return;

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onOpenChange(false);
      return true;
    });

    return () => backSubscription.remove();
  }, [open, onOpenChange]);

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={resolvedSnapPoints}
      snapPointsMode="percent"
      defaultPosition={defaultPosition}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      moveOnKeyboardChange={moveOnKeyboardChange}
      zIndex={zIndex}
      transition={bottomSheetChrome.motion}>
      <Sheet.Overlay
        backgroundColor={bottomSheetChrome.overlayColor}
        transition={bottomSheetChrome.motion}
        enterStyle={{opacity: 0}}
        exitStyle={{opacity: 0}}
      />
      <SheetChrome testID={testID} fill={shouldFill}>
        {title ? (
          <YStack gap="$1" accessibilityRole="header">
            <Text variant="h4" weight="bold" color="$color">
              {title}
            </Text>
            {description ? (
              <Text variant="body2" color="$textSecondary">
                {description}
              </Text>
            ) : null}
          </YStack>
        ) : null}
        {scrollable ? (
          <Sheet.ScrollView
            flex={shouldFill ? 1 : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <YStack gap="$2" paddingBottom="$2">
              {children}
            </YStack>
          </Sheet.ScrollView>
        ) : (
          <YStack gap="$2" flex={shouldFill ? 1 : undefined}>
            {children}
          </YStack>
        )}
        {footer ? <YStack gap="$2">{footer}</YStack> : null}
      </SheetChrome>
    </Sheet>
  );
}

export function BottomSheetOption({
  description,
  icon,
  leading,
  label,
  onPress,
  selected = false,
  selectionMode = 'single',
  disabled = false,
  testID,
}: BottomSheetOptionProps) {
  return (
    <OptionFrame
      testID={testID}
      selected={selected}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      accessibilityRole={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      accessibilityLabel={label}
      accessibilityState={{checked: selected, disabled}}>
      {leading ?? (icon ? <ThemedIonicon name={icon} size={22} color="$textSecondary" /> : null)}
      <YStack flex={1} gap="$1">
        <Text variant="body1" weight={selected ? 'semibold' : 'medium'} color="$color">
          {label}
        </Text>
        {description ? (
          <Text variant="caption" color="$textSecondary">
            {description}
          </Text>
        ) : null}
      </YStack>
      {selected ? <ThemedIonicon name="checkmark-circle" size={22} color="$iconBrand" /> : null}
    </OptionFrame>
  );
}

export function BottomSheetAction({
  description,
  disabled = false,
  icon,
  label,
  onPress,
  showChevron = true,
  testID,
  tone = 'default',
}: BottomSheetActionProps) {
  const iconColor = tone === 'destructive' ? '$error' : '$textSecondary';

  return (
    <ActionFrame
      testID={testID}
      tone={tone}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{disabled}}>
      {icon ? <ThemedIonicon name={icon} size={22} color={iconColor} /> : null}
      <YStack flex={1} gap="$1">
        <Text
          variant="body1"
          weight="semibold"
          color={tone === 'destructive' ? '$error' : '$color'}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" color="$textSecondary">
            {description}
          </Text>
        ) : null}
      </YStack>
      {showChevron ? (
        <ThemedIonicon
          name="chevron-forward"
          size={20}
          color={tone === 'destructive' ? '$error' : '$textSecondary'}
        />
      ) : null}
    </ActionFrame>
  );
}

export function AdaptiveSheet({
  children,
  snapPoints,
  title,
  description,
  actions = [],
  dialogChildren,
  onOpenChange,
}: AdaptiveSheetProps) {
  const resolvedSnapPoints = snapPoints ?? [36];
  const hasDialogContent = Boolean(title || description || actions.length > 0 || dialogChildren);

  return (
    <Sheet
      modal
      dismissOnSnapToBottom
      dismissOnOverlayPress
      snapPoints={resolvedSnapPoints}
      snapPointsMode="percent"
      transition={bottomSheetChrome.motion}>
      <Sheet.Overlay
        backgroundColor={bottomSheetChrome.overlayColor}
        transition={bottomSheetChrome.motion}
        enterStyle={{opacity: 0}}
        exitStyle={{opacity: 0}}
      />
      <SheetChrome fill>
        {hasDialogContent ? (
          <YStack gap="$4" width="100%">
            <YStack gap="$2">
              {title ? (
                <Text variant="h4" color="$color" weight="bold" textAlign="center">
                  {title}
                </Text>
              ) : null}
              {description ? (
                <Text variant="body1" color="$textSecondary" textAlign="center">
                  {description}
                </Text>
              ) : null}
            </YStack>
            {dialogChildren}
            <XStack gap="$3" justifyContent="center" width="100%" flexWrap="wrap">
              {actions.length ? (
                actions.map((action, actionIndex) => (
                  <DialogActionButton
                    key={`adaptive-action-${action.label || actionIndex}`}
                    action={action}
                    onOpenChange={onOpenChange ?? (() => undefined)}
                  />
                ))
              ) : (
                <Button flex={1} variant="primary" onPress={() => onOpenChange?.(false)}>
                  OK
                </Button>
              )}
            </XStack>
          </YStack>
        ) : null}
        {children}
      </SheetChrome>
    </Sheet>
  );
}

function SheetChrome({
  children,
  fill = false,
  testID,
}: {
  children: React.ReactNode;
  fill?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const blurTarget = useBlurTarget();
  const dark = inferIsDarkMode(theme);
  const border = resolveThemeColor(
    theme,
    'glassSurfaceBorder',
    dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
  );
  const start = resolveThemeColor(
    theme,
    'glassSurfaceStart',
    dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.85)',
  );
  const end = resolveThemeColor(
    theme,
    'glassSurfaceEnd',
    dark ? 'rgba(255, 255, 255, 0.005)' : 'rgba(235, 238, 242, 0.55)',
  );
  const frameBackground = resolveThemeColor(
    theme,
    'sheetBackground',
    dark ? '#000000' : 'rgba(255, 255, 255, 0.98)',
  );

  return (
    <Sheet.Frame
      testID={testID}
      position="relative"
      overflow="hidden"
      backgroundColor={frameBackground}
      borderTopWidth={1}
      borderColor={border}
      borderTopLeftRadius={bottomSheetChrome.radius}
      borderTopRightRadius={bottomSheetChrome.radius}
      paddingBottom={Math.max(insets.bottom, 20)}
      flex={fill ? 1 : undefined}
      accessibilityViewIsModal>
      <SheetBlurLayer
        intensity={dark ? 20 : 52}
        tint={dark ? 'dark' : 'light'}
        blurTarget={blurTarget ?? undefined}
        blurMethod={blurTarget ? 'dimezisBlurViewSdk31Plus' : 'none'}
      />
      <LinearGradient colors={[start, end]} style={absoluteLayerStyle} />
      <Sheet.Handle
        backgroundColor={dark ? 'rgba(255, 255, 255, 0.25)' : '$borderColorHover'}
        width={40}
        height={4}
        borderRadius={2}
        marginTop="$3"
        alignSelf="center"
      />
      <YStack
        position="relative"
        paddingHorizontal="$4"
        paddingTop="$2"
        gap="$4"
        flex={fill ? 1 : undefined}>
        {children}
      </YStack>
    </Sheet.Frame>
  );
}

const OptionFrame = styled(XStack, {
  name: 'BuddyBottomSheetOption',
  minHeight: 56,
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  backgroundColor: '$surface',
  pressStyle: {backgroundColor: '$surfacePress', scale: 0.99},
  disabledStyle: {opacity: 0.5},
  variants: {
    selected: {
      true: {borderWidth: 2, borderColor: '$primary', backgroundColor: '$backgroundPress'},
    },
  } as const,
});

const ActionFrame = styled(XStack, {
  name: 'BuddyBottomSheetAction',
  minHeight: 56,
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  backgroundColor: '$surface',
  pressStyle: {backgroundColor: '$surfacePress', scale: 0.99},
  disabledStyle: {opacity: 0.5},
  variants: {
    tone: {
      default: {},
      destructive: {borderColor: '$error'},
    },
  } as const,
});

const SheetBlurLayer = styled(BlurView, {
  name: 'BuddyBottomSheetBlurLayer',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const absoluteLayerStyle = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
