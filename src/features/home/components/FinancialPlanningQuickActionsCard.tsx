import {QuickActionPanel, type QuickActionPanelItem} from '@ravitamil/buddy-ui';
import {useBuddyColors} from '@ravitamil/buddy-ui';

interface FinancialPlanningQuickActionsCardProps {
  onDebtPayoffPress: () => void;
  onRetirementPress: () => void;
  onNetWorthPress: () => void;
}

export function FinancialPlanningQuickActionsCard({
  onDebtPayoffPress,
  onRetirementPress,
  onNetWorthPress,
}: FinancialPlanningQuickActionsCardProps) {
  const colors = useBuddyColors();
  const actions: QuickActionPanelItem[] = [
    {
      title: 'Debt Payoff',
      icon: 'card',
      color: colors.expense,
      onPress: onDebtPayoffPress,
    },
    {
      title: 'FIRE Plan',
      icon: 'flame',
      color: colors.warning,
      onPress: onRetirementPress,
    },
    {
      title: 'Net Worth',
      icon: 'analytics',
      color: colors.savings,
      onPress: onNetWorthPress,
    },
  ];

  return <QuickActionPanel actions={actions} itemGap="$3" />;
}
