import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

interface BudgetPlanningGlassFrameProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  onPress?: () => void;
  height?: number;
  padding?: number;
}

export function BudgetPlanningGlassFrame({
  children,
  accessibilityLabel,
  onPress,
  padding = 16,
}: BudgetPlanningGlassFrameProps) {
  return (
    <View
      {...(onPress
        ? {
            accessibilityRole: 'button' as const,
            accessibilityLabel,
            onPress,
            pressStyle: {opacity: 0.9},
          }
        : {})}
      width="100%">
      <GlassSurface testID="budget-planning-card-gradient" padding={padding} borderRadius={20}>
        {children}
      </GlassSurface>
    </View>
  );
}
