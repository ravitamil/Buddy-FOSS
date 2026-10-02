import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {SelectField as BuddySelectField, ToggleField} from '@ravitamil/buddy-ui';
import type {IoniconName} from './addEditSubscriptionSectionsTypes';

interface ToggleRowProps {
  icon: IoniconName;
  iconColor: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  enabledColor?: string;
  onPress: () => void;
}

interface SelectFieldProps {
  isDarkMode: boolean;
  onPress: () => void;
  label: string;
  leadingIcon?: IoniconName;
  compact?: boolean;
}

export function ToggleRow({icon, iconColor, title, subtitle, enabled, onPress}: ToggleRowProps) {
  return (
    <ToggleField
      leading={<Ionicons name={icon} size={20} color={iconColor} />}
      title={title}
      description={subtitle}
      checked={enabled}
      onCheckedChange={onPress}
      testID={`subscription-toggle-${title}`}
    />
  );
}

export function SelectField({isDarkMode, onPress, label, leadingIcon, compact}: SelectFieldProps) {
  return (
    <BuddySelectField
      onPress={onPress}
      label="Selection"
      value={label}
      leading={
        leadingIcon ? (
          <Ionicons name={leadingIcon} size={18} color={mutedIconColor(isDarkMode)} />
        ) : undefined
      }
      compact={compact}
    />
  );
}

export function ChevronDown({isDarkMode}: {isDarkMode: boolean}) {
  return <Ionicons name="chevron-down" size={20} color={mutedIconColor(isDarkMode)} />;
}

export function mutedIconColor(isDarkMode: boolean) {
  return isDarkMode ? '#9ca3af' : '#6b7280';
}
