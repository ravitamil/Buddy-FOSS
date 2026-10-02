import {Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme, View, XStack, YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface FeatureRowProps {
  basic: string | boolean;
  feature: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
  pro: string | boolean;
}

const FEATURES: FeatureRowProps[] = [
  {icon: 'people-outline', feature: 'Groups', basic: '1 Group', pro: 'Unlimited'},
  {icon: 'receipt-outline', feature: 'Expenses', basic: 'Unlimited', pro: 'Unlimited'},
  {icon: 'person-add-outline', feature: 'Members', basic: 'Unlimited', pro: 'Unlimited'},
  {icon: 'headset-outline', feature: 'Support', basic: 'Standard', pro: 'Priority'},
  {icon: 'megaphone-outline', feature: 'Ad-Free', basic: false, pro: true},
];

export function PlanComparisonFeatureTable() {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <GlassSurface padding={0}>
      <YStack padding="$3">
        <XStack
          paddingBottom="$2"
          marginBottom="$1"
          borderBottomWidth={1}
          borderColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
          alignItems="center"
          gap="$2">
          <View style={{flex: 2}}>
            <Text variant="caption" weight="bold" color="$gray11">
              FEATURES
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text variant="caption" weight="bold" color="$gray11">
              BASIC
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text variant="caption" weight="bold" color="#F59E0B">
              PRO
            </Text>
          </View>
        </XStack>

        {FEATURES.map((feature, index) => (
          <FeatureRow key={feature.feature} {...feature} isLast={index === FEATURES.length - 1} />
        ))}
      </YStack>
    </GlassSurface>
  );
}

function FeatureRow({icon, feature, basic, pro, isLast}: FeatureRowProps) {
  const theme = useTheme();
  const {isDarkMode} = useTamaguiTheme();
  const featureTextColor = typeof theme.color?.val === 'string' ? theme.color.val : undefined;

  return (
    <XStack
      paddingVertical="$3"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      borderColor={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
      alignItems="center"
      gap="$2">
      <XStack flex={2} alignItems="center" gap="$2">
        <Ionicons name={icon} size={16} color={isDarkMode ? '#999' : '#888'} />
        <Text variant="body2" weight="medium" color={featureTextColor}>
          {feature}
        </Text>
      </XStack>
      <View style={{flex: 1, alignItems: 'center'}}>{renderValue(basic, false, isDarkMode)}</View>
      <View style={{flex: 1, alignItems: 'center'}}>{renderValue(pro, true, isDarkMode)}</View>
    </XStack>
  );
}

function renderValue(value: string | boolean, isPro: boolean, isDarkMode: boolean) {
  if (typeof value === 'boolean') {
    return (
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={
          value
            ? isPro
              ? '#F59E0B'
              : isDarkMode
                ? '#6ee7b7'
                : '#059669'
            : isDarkMode
              ? '#555'
              : '#bbb'
        }
      />
    );
  }

  return (
    <Text
      variant="caption"
      color={isPro ? '#F59E0B' : isDarkMode ? '#aaa' : '#666'}
      weight={isPro ? 'bold' : 'medium'}
      textAlign="center">
      {value}
    </Text>
  );
}
