import {QuickActionPanel, type QuickActionPanelItem} from '@ravitamil/buddy-ui';
import {useBuddyColors} from '@ravitamil/buddy-ui';

interface QuickActionsCardProps {
  onAnalysePress: () => void;
  onInvestmentsPress: () => void;
  onRetirementPress: () => void;
}

export const QuickActionsCard = ({
  onAnalysePress,
  onInvestmentsPress,
  onRetirementPress,
}: QuickActionsCardProps) => {
  const colors = useBuddyColors();
  const actions: QuickActionPanelItem[] = [
    {
      title: 'Analyse',
      icon: 'analytics',
      onPress: onAnalysePress,
      color: colors.iconBrand,
    },
    {
      title: 'Investments',
      icon: 'trending-up',
      onPress: onInvestmentsPress,
      color: colors.savings,
    },
    {
      title: 'FIRE Plan',
      icon: 'flame',
      onPress: onRetirementPress,
      color: colors.warning,
    },
  ];

  return <QuickActionPanel actions={actions} itemGap="$3" marginTop={16} />;
};
