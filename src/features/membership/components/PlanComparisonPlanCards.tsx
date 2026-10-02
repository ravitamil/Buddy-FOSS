import {Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, styled} from 'tamagui';

interface PlanComparisonPlanCardsProps {
  isPro: boolean;
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const PlanIconFrame = styled(YStack, {
  name: 'PlanIconFrame',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$1',

  variants: {
    tone: {
      neutral: {
        backgroundColor: '$surface',
      },
      pro: {
        backgroundColor: '$warning2',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'neutral',
  },
});

const CurrentBadge = styled(YStack, {
  name: 'PlanCurrentBadge',
  backgroundColor: '$gray5',
  paddingHorizontal: '$2.5',
  paddingVertical: '$1',
  borderRadius: '$3',
  marginTop: '$1',

  variants: {
    tone: {
      neutral: {
        backgroundColor: '$gray5',
      },
      pro: {
        backgroundColor: '$warning6',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'neutral',
  },
});

const PopularBadge = styled(XStack, {
  name: 'PlanPopularBadge',
  position: 'absolute',
  top: -12,
  left: '$4',
  right: '$4',
  height: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  backgroundColor: '$warning6',
});

const ProCardAccent = styled(YStack, {
  name: 'ProCardAccent',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '$warning2',
  opacity: 0.18,
});

export function PlanComparisonPlanCards({isPro}: PlanComparisonPlanCardsProps) {
  return (
    <XStack gap="$3" justifyContent="center">
      <BasicPlanCard isPro={isPro} />
      <ProPlanCard isPro={isPro} />
    </XStack>
  );
}

type PlanCardStateProps = Pick<PlanComparisonPlanCardsProps, 'isPro'>;

function BasicPlanCard({isPro}: PlanCardStateProps) {
  return (
    <GlassSurface fill padding={14} style={{flex: 1, minHeight: 170}}>
      <YStack gap="$2" alignItems="center" justifyContent="space-between" flex={1}>
        <YStack alignItems="center" gap="$1">
          <PlanIconFrame>
            <ThemedIonicon name="person-outline" size={22} color="$colorSecondary" />
          </PlanIconFrame>
          <Text variant="h5" weight="bold" textAlign="center">
            Basic
          </Text>
          <Text variant="caption" color="$gray11" textAlign="center">
            Get started
          </Text>
        </YStack>
        <Text variant="h4" weight="bold" textAlign="center">
          Free
        </Text>
        {!isPro && (
          <CurrentBadge>
            <Text variant="caption" weight="bold" color="$white" fontSize={10}>
              CURRENT
            </Text>
          </CurrentBadge>
        )}
      </YStack>
    </GlassSurface>
  );
}

function ProPlanCard({isPro}: PlanCardStateProps) {
  return (
    <YStack flex={1}>
      <PopularBadge>
        <ThemedIonicon name="star" size={10} color="$white" />
        <Text variant="caption" weight="bold" color="$white" fontSize={9} marginLeft="$1">
          POPULAR
        </Text>
      </PopularBadge>

      <GlassSurface fill padding={14} style={{flex: 1, minHeight: 170}}>
        <ProCardAccent opacity={0.14} />
        <YStack gap="$2" alignItems="center" justifyContent="space-between" flex={1}>
          <YStack alignItems="center" gap="$1">
            <PlanIconFrame tone="pro">
              <ThemedIonicon name="diamond-outline" size={22} color="$warning6" />
            </PlanIconFrame>
            <Text variant="h5" weight="bold" color="$warning6" textAlign="center">
              Pro
            </Text>
            <Text variant="caption" color="$gray11" textAlign="center">
              Unlock all
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text variant="h4" weight="bold" textAlign="center">
              $4.99
            </Text>
            <Text variant="caption" color="$gray11">
              / month
            </Text>
          </YStack>
          {isPro && (
            <CurrentBadge tone="pro">
              <Text variant="caption" weight="bold" color="$white" fontSize={10}>
                CURRENT
              </Text>
            </CurrentBadge>
          )}
        </YStack>
      </GlassSurface>
    </YStack>
  );
}
