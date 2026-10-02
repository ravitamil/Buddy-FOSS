import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Svg, {Path} from 'react-native-svg';

import {AnimatedProfileIcon} from '@/components/ui';
import {ProBadge} from '@/components/ui/ProBadge';

const NotificationIcon = ({size = 24, color}: {size?: number; color: string}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
    <Path d="M15 8.38V17H3V5h8.62c-.073-.322-.12-.655-.12-1s.047-.678.12-1H3c-1.102 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8.38c-.322.073-.655.12-1 .12s-.678-.047-1-.12zM16 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </Svg>
);

interface HomeHeaderProps {
  greetingName: string;
  isPro: boolean;
  iconColor: string;
  onProfilePress: () => void;
  onNotificationPress: () => void;
}

export const HomeHeader = ({
  greetingName,
  isPro,
  iconColor,
  onProfilePress,
  onNotificationPress,
}: HomeHeaderProps) => (
  <VStack padding="$4" paddingBottom="$4">
    <HStack justifyContent="space-between" alignItems="center">
      <HStack alignItems="center" gap="$3" flex={1}>
        <AnimatedProfileIcon onPress={onProfilePress} size={48} />
        <VStack flex={1} gap="$1">
          <HStack alignItems="center" gap="$2">
            <Text variant="h3" color="$text" weight="bold">
              Hey, {greetingName}
            </Text>
            {isPro ? <ProBadge /> : <Text variant="h3"> 👋</Text>}
          </HStack>
          <Text color="$textSecondary" variant="body2">
            Let's keep up your personal finance!
          </Text>
        </VStack>
      </HStack>
      <HStack
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onNotificationPress}
        pressStyle={{opacity: 0.7}}
        padding="$2">
        <NotificationIcon size={24} color={iconColor} />
      </HStack>
    </HStack>
  </VStack>
);
