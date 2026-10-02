import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {GroupTransactionDetailSections} from '@/features/groups/components/GroupTransactionDetailSections';
import {useGroupTransactionDetailScreen} from '@/features/groups/hooks/useGroupTransactionDetailScreen';

interface GroupTransactionDetailScreenProps {
  transactionId: string;
  groupId: string;
}

const GroupTransactionEmptyState = ({
  title,
  subtitle,
  icon,
  headerTitle,
  headerSubtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  icon: string;
  headerTitle: string;
  headerSubtitle: string;
  onBack: () => void;
}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
    <VStack flex={1} padding="$4" gap="$4">
      <CustomNavigationHeader title={headerTitle} subtitle={headerSubtitle} onBackPress={onBack} />

      <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Text fontSize={64}>{icon}</Text>
        <Text variant="h3" color="$text" weight="bold" textAlign="center">
          {title}
        </Text>
        <Text variant="body2" color="$textSecondary" textAlign="center">
          {subtitle}
        </Text>
      </VStack>
    </VStack>
  </ScreenContainer>
);

const GroupTransactionDetailScreen: React.FC<GroupTransactionDetailScreenProps> = ({
  transactionId,
  groupId,
}) => {
  const screen = useGroupTransactionDetailScreen({transactionId, groupId});

  if (!screen.group) {
    return (
      <GroupTransactionEmptyState
        icon="\uD83D\uDE15"
        title="Group not found"
        subtitle="The group for this transaction could not be found."
        headerTitle="Group Not Found"
        headerSubtitle="Unable to load group information"
        onBack={screen.handleBack}
      />
    );
  }

  if (!screen.transaction) {
    return (
      <GroupTransactionEmptyState
        icon="\uD83D\uDCC4"
        title="Transaction not found"
        subtitle="This transaction may have been deleted or moved."
        headerTitle="Transaction Not Found"
        headerSubtitle={`${screen.group.emoji || '\uD83D\uDC65'} ${screen.group.name}`}
        onBack={screen.handleBack}
      />
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <CustomNavigationHeader
        title="Transaction Details"
        subtitle={`${screen.group.emoji || '\uD83D\uDC65'} ${screen.group.name}`}
        largeTitle="Transaction Details"
        {...screen.headerProps}
        onBackPress={screen.handleBack}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}
          scrollEventThrottle={16}
          onScroll={screen.onScroll}>
          <VStack flex={1} padding="$4" gap="$4" paddingTop="$0">
            <GroupTransactionDetailSections screen={screen} />
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default GroupTransactionDetailScreen;
