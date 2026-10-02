import type React from 'react';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {ProfileSettingsScreenModel} from '../../hooks/useProfileSettingsScreen';

export interface ProfileSettingsSectionProps {
  screen: ProfileSettingsScreenModel;
}

export interface ProfileFieldRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  lockIcon?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  onPress?: () => void;
  showChevron?: boolean;
  testID?: string;
  helperText?: string;
}

export type EditableFieldProps = ProfileFieldRowProps;

export interface ProfileSectionCardProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}
