import type React from 'react';
import type {SharedValue} from 'react-native-reanimated';

export interface CustomNavigationHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  showBackButton?: boolean;
  scrollY?: SharedValue<number>;
  enableProgressiveBlur?: boolean;
  largeTitle?: string;
  headerHeight?: number;
  hideRightElementInBlur?: boolean;
  showBackButtonInNonBlur?: boolean;
  mode?: 'static' | 'progressive' | 'collapsing';
  showProBadge?: boolean;
  alignStaticTitleWithContent?: boolean;
  staticTitleVariant?: 'default' | 'compact';
}
