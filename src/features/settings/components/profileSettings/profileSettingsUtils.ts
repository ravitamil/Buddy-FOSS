import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

export const iconColors: Partial<Record<keyof typeof Ionicons.glyphMap, string>> = {
  person: '#3b82f6',
  'person-outline': '#3b82f6',
  at: '#8b5cf6',
  calendar: '#f59e0b',
  call: '#10b981',
  mail: '#06b6d4',
  'shield-checkmark': '#10b981',
  star: '#f59e0b',
  sparkles: '#ec4899',
  'logo-google': '#ea4335',
  link: '#3b82f6',
  'finger-print': '#6366f1',
};

export const hexToRgba = (hex: string, alpha: number) => {
  const trimmed = hex.replace('#', '');
  const bigint = parseInt(trimmed, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
