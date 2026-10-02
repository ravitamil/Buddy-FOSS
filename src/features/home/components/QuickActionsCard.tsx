import {QuickActionPanel, type QuickActionPanelItem} from '@ravitamil/buddy-ui';
import {useBuddyColors} from '@ravitamil/buddy-ui';
import {useFeatureStatus} from '@/features/featureControls';

interface QuickActionsCardProps {
  onAnalysePress: () => void;
  onAddTransactionPress: () => void;
  onNetWorthPress: () => void;
}

export function QuickActionsCard({
  onAnalysePress,
  onAddTransactionPress,
  onNetWorthPress,
}: QuickActionsCardProps) {
  const colors = useBuddyColors();
  const walletsStatus = useFeatureStatus('wallets');
  const actions: QuickActionPanelItem[] = [
    {
      title: 'Analyse',
      icon: 'analytics',
      color: colors.iconBrand,
      onPress: onAnalysePress,
    },
    {
      title: 'Add',
      icon: 'add',
      color: colors.primary,
      onPress: onAddTransactionPress,
    },
    ...(walletsStatus.isVisible && walletsStatus.canRead
      ? [
          {
            title: 'Net Worth',
            icon: 'wallet',
            color: colors.savings,
            onPress: onNetWorthPress,
          } satisfies QuickActionPanelItem,
        ]
      : []),
  ];

  return <QuickActionPanel actions={actions} />;
}
