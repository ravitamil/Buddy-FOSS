import {Switch} from '@ravitamil/buddy-ui';
import React from 'react';

export function BudgetToggle({
  enabled,
  onChange,
  accessibilityLabel = 'Toggle setting',
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Switch
      checked={enabled}
      onCheckedChange={onChange}
      accessibilityLabel={accessibilityLabel}
      size="compact"
    />
  );
}
