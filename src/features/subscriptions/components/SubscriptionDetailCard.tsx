import React from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {SubscriptionCardShell} from './SubscriptionCardShell';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SubscriptionDetailCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  isDarkMode: boolean;
  accentColor?: string;
  icon?: IoniconName;
}

export const SubscriptionDetailCard = React.memo(function SubscriptionDetailCard({
  children,
  title,
  subtitle,
  style,
  onPress,
  isDarkMode,
  accentColor,
  icon,
}: SubscriptionDetailCardProps) {
  return (
    <SubscriptionCardShell
      title={title}
      subtitle={subtitle}
      onPress={onPress}
      style={style}
      isDarkMode={isDarkMode}
      accentColor={accentColor}
      icon={icon}>
      {children}
    </SubscriptionCardShell>
  );
});
