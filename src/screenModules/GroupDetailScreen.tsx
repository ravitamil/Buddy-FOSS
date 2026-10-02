import {createAlphaColor, FloatingAction, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useMemo} from 'react';
import type {ImageSourcePropType} from 'react-native';
import {StyleSheet} from 'react-native';
import Animated, {Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, YStack} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  GroupDetailActionSheet,
  GroupDetailBalanceSection,
  GroupDetailDeletingOverlay,
  GroupDetailMissingState,
  GroupDetailSettlementSection,
  GroupDetailTransactionsSection,
  GroupMembersBottomSheet,
  useGroupDetailScreen,
} from '@/features/groups';
import loadingJson from '../../assets/lottie/Loading.json';

const loadingSource = loadingJson as ImageSourcePropType;

const STATIC_HEADER_CONTENT_HEIGHT = 60;
const STATIC_HEADER_VERTICAL_PADDING = 28;
const STATIC_HEADER_SCRIM_EXTENSION = 36;

interface HeaderMenuButtonProps {
  isDarkMode: boolean;
  onPress: () => void;
}

const HeaderMenuButton: React.FC<HeaderMenuButtonProps> = ({isDarkMode, onPress}) => (
  <View
    accessibilityRole="button"
    accessibilityLabel="Group options menu"
    onPress={onPress}
    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
    pressStyle={{opacity: 0.75, scale: 0.94}}
    width={40}
    height={40}
    borderRadius={20}
    backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
    borderWidth={1}
    borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'}
    justifyContent="center"
    alignItems="center"
    shadowColor={isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)'}
    shadowOffset={{width: 0, height: 2}}
    shadowOpacity={0.2}
    shadowRadius={4}>
    <Ionicons name="ellipsis-horizontal" size={20} color={isDarkMode ? '#FFFFFF' : '#111827'} />
  </View>
);

interface GroupDetailScreenProps {
  groupId: string;
}

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({groupId}) => {
  const screen = useGroupDetailScreen({groupId});
  const insets = useSafeAreaInsets();
  const {
    group,
    isDeleting,
    isDeletedPlaceholder,
    isActionSheetOpen,
    isMembersSheetOpen,
    transactionFilter,
    stats,
    memberItems,
    balanceViewModel,
    filteredTopTransactions,
    nudging,
    title,
    subtitle,
    isDarkMode,
    profilePictureUri,
    userId,
    currentUserDisplayName,
    formatCurrency,
    scrollY,
    onScroll,
    isScrollingDown,
    resetScrollDirection,
    setTransactionFilter,
    setActionSheetOpen,
    setMembersSheetOpen,
    navigateBack,
    navigateAddMember,
    navigateAddTransaction,
    navigateInsights,
    navigateActivity,
    navigateSettlementHistory,
    navigateAllTransactions,
    navigateTransaction,
    navigateEditGroup,
    navigateSettleSuggestion,
    handleDeleteGroup,
    handleNudgeSuggestion,
    handleInviteSuggestion,
    getInitials,
    getTransactionItem,
  } = screen;

  const themeBackground = isDarkMode ? '#0A0B0E' : '#FFFFFF';
  const scrimColors = useMemo(
    () =>
      [
        themeBackground,
        createAlphaColor(themeBackground, 0.96),
        createAlphaColor(themeBackground, 0.72),
        createAlphaColor(themeBackground, 0),
      ] as const,
    [themeBackground],
  );

  const headerScrimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP);
    return {opacity};
  });

  if (isDeletedPlaceholder) return null;

  if (!group) {
    return <GroupDetailMissingState onBack={navigateBack} />;
  }

  const staticHeaderScrimHeight =
    Math.max(20, insets.top) +
    STATIC_HEADER_CONTENT_HEIGHT +
    STATIC_HEADER_VERTICAL_PADDING +
    STATIC_HEADER_SCRIM_EXTENSION;

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea edges={['bottom']}>
      <YStack position="relative" zIndex={10}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: staticHeaderScrimHeight,
              zIndex: 1,
            },
            headerScrimStyle,
          ]}>
          <LinearGradient
            colors={scrimColors}
            locations={[0, 0.56, 0.8, 1]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <YStack zIndex={2} paddingTop="$4" paddingBottom="$3">
          <CustomNavigationHeader
            title={title}
            subtitle={subtitle}
            showBackButton
            alignStaticTitleWithContent
            staticTitleVariant="compact"
            onBackPress={navigateBack}
            rightElement={
              <HeaderMenuButton isDarkMode={isDarkMode} onPress={() => setActionSheetOpen(true)} />
            }
          />
        </YStack>
      </YStack>

      <Animated.ScrollView
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 8, paddingBottom: 100}}
        style={{flex: 1}}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollEndDrag={(event) => {
          if (Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.01) {
            resetScrollDirection();
          }
        }}
        onMomentumScrollEnd={resetScrollDirection}>
        <VStack padding="$4" gap="$4">
          <GroupDetailBalanceSection
            group={group}
            stats={stats}
            memberItems={memberItems}
            balanceViewModel={balanceViewModel}
            isDarkMode={isDarkMode}
            formatCurrency={formatCurrency}
            onAddMember={navigateAddMember}
            onOpenMembersSheet={() => setMembersSheetOpen(true)}
            onInsights={navigateInsights}
            getInitials={getInitials}
          />
          <GroupDetailSettlementSection
            group={group}
            stats={stats}
            isDarkMode={isDarkMode}
            profilePictureUri={profilePictureUri}
            userId={userId}
            currentUserDisplayName={currentUserDisplayName}
            formatCurrency={formatCurrency}
            nudging={nudging}
            onInsights={navigateInsights}
            onSettleSuggestion={navigateSettleSuggestion}
            onNudgeSuggestion={handleNudgeSuggestion}
            onInviteSuggestion={handleInviteSuggestion}
            getInitials={getInitials}
          />
          <GroupDetailTransactionsSection
            group={group}
            filteredTopTransactions={filteredTopTransactions}
            transactionFilter={transactionFilter}
            isDarkMode={isDarkMode}
            formatCurrency={formatCurrency}
            onSetFilter={setTransactionFilter}
            onAddTransaction={navigateAddTransaction}
            onAllTransactions={navigateAllTransactions}
            onTransactionPress={navigateTransaction}
            getTransactionItem={getTransactionItem}
          />
        </VStack>
      </Animated.ScrollView>

      <GroupMembersBottomSheet
        group={group}
        isOpen={isMembersSheetOpen}
        onOpenChange={setMembersSheetOpen}
        isDarkMode={isDarkMode}
        userId={userId}
        memberItems={memberItems}
        stats={stats}
        formatCurrency={formatCurrency}
        onAddMember={navigateAddMember}
        onSettleSuggestion={navigateSettleSuggestion}
        onNudgeSuggestion={handleNudgeSuggestion}
        onInviteSuggestion={handleInviteSuggestion}
        getInitials={getInitials}
      />
      <GroupDetailActionSheet
        group={group}
        isOpen={isActionSheetOpen}
        isDarkMode={isDarkMode}
        onOpenChange={setActionSheetOpen}
        onInsights={navigateInsights}
        onActivity={navigateActivity}
        onSettlementHistory={navigateSettlementHistory}
        onEditGroup={navigateEditGroup}
        onDeleteGroup={handleDeleteGroup}
      />
      <FloatingAction
        presentation="circular"
        icon="add"
        position="right"
        onPress={navigateAddTransaction}
        variant="info"
        isScrollingDown={isScrollingDown}
      />
      <GroupDetailDeletingOverlay
        isVisible={isDeleting}
        isDarkMode={isDarkMode}
        loadingSource={loadingSource}
      />
    </ScreenContainer>
  );
};

export default GroupDetailScreen;
