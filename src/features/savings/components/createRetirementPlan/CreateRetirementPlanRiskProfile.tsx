import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Button, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import type {
  RetirementPlanFormData,
  RetirementRiskTolerance,
} from '@/features/savings/hooks/useCreateRetirementPlanScreen';
import {RISK_PROFILES} from './createRetirementPlanConstants';
import type {CreateRetirementPlanFormSectionsProps} from './createRetirementPlanTypes';
import {formatRiskTolerance, SectionHeader} from './CreateRetirementPlanPrimitives';

export const RiskProfileSection = ({
  formData,
  isDarkMode,
  setShowRiskProfileSheet,
  themeColor,
}: Pick<CreateRetirementPlanFormSectionsProps, 'formData' | 'setShowRiskProfileSheet'> & {
  isDarkMode: boolean;
  themeColor: string;
}) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader color="#06B6D4" icon="options" title="Risk Profile" />
      <YStack gap="$2" marginBottom="$3">
        <Text variant="body1" color="$color" weight="semibold">
          Risk Profile
        </Text>
        <Button
          onPress={() => setShowRiskProfileSheet(true)}
          backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
          borderColor={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
          borderWidth={1}
          borderRadius="$3"
          justifyContent="flex-start"
          paddingHorizontal="$3"
          height="$4">
          <XStack justifyContent="space-between" alignItems="center" flex={1}>
            <Text variant="body1" color="$color">
              {formatRiskTolerance(formData.riskTolerance)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColor} />
          </XStack>
        </Button>
      </YStack>
    </YStack>
  </GlassSurface>
);

export const RiskProfileSheet = ({
  currentRiskTolerance,
  onOpenChange,
  open,
  updateField,
}: {
  currentRiskTolerance: RetirementRiskTolerance;
  isDarkMode: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  updateField: <Field extends keyof RetirementPlanFormData>(
    field: Field,
    value: RetirementPlanFormData[Field],
  ) => void;
}) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    snapPoints={[50]}
    title="Select Risk Profile"
    description="Choose the investment risk level for this retirement plan">
    {RISK_PROFILES.map((item) => (
      <BottomSheetOption
        key={item.key}
        label={item.label}
        description={item.description}
        selected={currentRiskTolerance === item.key}
        onPress={() => {
          updateField('riskTolerance', item.key);
          onOpenChange(false);
        }}
      />
    ))}
  </BottomSheet>
);
