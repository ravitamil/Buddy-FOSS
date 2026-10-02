import React, {type ReactNode} from 'react';
import {View, styled} from 'tamagui';

import {GlassSurface, type GlassSurfaceProps} from '@ravitamil/buddy-ui';
import {HStack, VStack} from '@ravitamil/buddy-ui';
import {Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {createAlphaColor, semanticHexColor} from '@ravitamil/buddy-ui/theme';

export type ManageCategoryIconName = React.ComponentProps<typeof Ionicons>['name'];

const emojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}\u200D\p{Emoji_Presentation}+|\p{Emoji}\u200D\p{Emoji}+|\p{Extended_Pictographic})+$/u;

export const isEmojiIcon = (icon: string | undefined): icon is string =>
  Boolean(icon && emojiRegex.test(icon));

interface ManageCategoryGlassCardProps {
  children: ReactNode;
  style?: GlassSurfaceProps['style'];
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

export const ManageCategoryGlassCard = React.memo<ManageCategoryGlassCardProps>(
  ({children, style, onPress, disabled = false, accessibilityLabel, accessibilityRole}) => {
    const cardContent = (
      <GlassSurface
        padding={14}
        borderRadius={18}
        style={[{marginBottom: 10, width: '100%'}, style]}>
        {children}
      </GlassSurface>
    );

    if (onPress) {
      return (
        <View
          accessibilityRole={accessibilityRole ?? 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{disabled}}
          disabled={disabled}
          onPress={disabled ? undefined : onPress}
          transition="quick"
          animateOnly={['transform', 'opacity']}
          pressStyle={{scale: 0.98, opacity: 0.88}}>
          {cardContent}
        </View>
      );
    }

    return cardContent;
  },
);

interface CategoryIconProps {
  color?: string;
  fallback: ManageCategoryIconName;
  icon?: string;
}

export function ManageCategoryIcon({icon, color, fallback}: CategoryIconProps) {
  const iconName = icon && icon.length > 1 ? (icon as ManageCategoryIconName) : fallback;
  const iconColor = color || semanticHexColor('primary');

  return (
    <VStack
      width={52}
      height={52}
      flexShrink={0}
      borderRadius={16}
      alignItems="center"
      justifyContent="center"
      backgroundColor={iconColor}
      borderWidth={1}
      borderColor="$glassSurfaceBorder"
      shadowColor={iconColor}
      shadowOffset={{width: 0, height: 4}}
      shadowOpacity={0.22}
      shadowRadius={8}
      elevation={4}>
      {isEmojiIcon(icon) ? (
        <Text
          fontSize={24}
          lineHeight={28}
          textAlign="center"
          textAlignVertical="center"
          includeFontPadding={false}>
          {icon}
        </Text>
      ) : (
        <ThemedIonicon name={iconName} size={24} color="$white" />
      )}
    </VStack>
  );
}

export function CategoryCountBadge({accentColor, count}: {accentColor: string; count: number}) {
  return (
    <HStack
      minHeight={28}
      alignItems="center"
      backgroundColor={createAlphaColor(accentColor, 0.1)}
      paddingHorizontal="$2.5"
      borderRadius="$4"
      borderWidth={1}
      borderColor={createAlphaColor(accentColor, 0.28)}>
      <Text fontSize="$2" color={accentColor} weight="semibold">
        {count} {count === 1 ? 'category' : 'categories'}
      </Text>
    </HStack>
  );
}

export function CategoryTypeBadge({label, accentColor}: {label: string; accentColor: string}) {
  return (
    <HStack
      minHeight={22}
      alignItems="center"
      backgroundColor={createAlphaColor(accentColor, 0.12)}
      paddingHorizontal="$2"
      borderRadius="$2"
      borderWidth={1}
      borderColor={createAlphaColor(accentColor, 0.24)}>
      <Text fontSize={11} color={accentColor} weight="semibold" textTransform="capitalize">
        {label}
      </Text>
    </HStack>
  );
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
