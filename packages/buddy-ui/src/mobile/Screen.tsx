import React from 'react';
import {KeyboardAvoidingView, Platform, type ViewStyle} from 'react-native';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';
import {ScrollView, YStack, type ScrollViewProps, type YStackProps} from 'tamagui';

export interface ScreenProps extends YStackProps {
  edges?: readonly Edge[];
  useSafeArea?: boolean;
}

export function Screen({
  children,
  edges = ['top', 'bottom'],
  useSafeArea = true,
  ...props
}: ScreenProps) {
  const content = (
    <YStack flex={1} backgroundColor="$background" {...props}>
      {children}
    </YStack>
  );
  return useSafeArea ? (
    <SafeAreaView edges={[...edges]} style={fillStyle}>
      {content}
    </SafeAreaView>
  ) : (
    content
  );
}

export interface ScreenScrollViewProps extends ScrollViewProps {
  edges?: readonly Edge[];
  useSafeArea?: boolean;
  contentPadding?: YStackProps['padding'];
}

export function ScreenScrollView({
  children,
  edges,
  useSafeArea,
  contentPadding = '$4',
  contentContainerStyle,
  ...props
}: ScreenScrollViewProps) {
  return (
    <Screen edges={edges} useSafeArea={useSafeArea} padding={0}>
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          ...(contentContainerStyle === 'unset' ? {} : contentContainerStyle),
        }}
        {...props}>
        <YStack flexGrow={1} padding={contentPadding}>
          {children}
        </YStack>
      </ScrollView>
    </Screen>
  );
}

export interface KeyboardScreenProps extends ScreenScrollViewProps {
  keyboardVerticalOffset?: number;
  scrollable?: boolean;
}

export function KeyboardScreen({
  keyboardVerticalOffset = 0,
  scrollable = true,
  children,
  edges,
  useSafeArea,
  contentPadding,
  ...props
}: KeyboardScreenProps) {
  return (
    <KeyboardAvoidingView
      style={fillStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      {scrollable ? (
        <ScreenScrollView
          edges={edges}
          useSafeArea={useSafeArea}
          contentPadding={contentPadding}
          {...props}>
          {children}
        </ScreenScrollView>
      ) : (
        <Screen edges={edges} useSafeArea={useSafeArea} padding={contentPadding ?? '$4'}>
          {children}
        </Screen>
      )}
    </KeyboardAvoidingView>
  );
}

const fillStyle: ViewStyle = {flex: 1};
