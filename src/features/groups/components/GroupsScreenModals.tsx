import {BottomSheet, BottomSheetAction, ConfirmationDialog} from '@ravitamil/buddy-ui/overlays';
import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {View} from 'tamagui';

import loadingAnimation from '../../../../assets/lottie/Loading.json';

import {LottieAnimationView} from '@ravitamil/buddy-ui';
import type {EnhancedGroup} from '@/features/groups/types';

interface GroupsScreenModalsProps {
  isDarkMode: boolean;
  selectedGroup: EnhancedGroup | null;
  isDeleting: boolean;
  isActionSheetOpen: boolean;
  isDeleteModalOpen: boolean;
  onActionSheetOpenChange: (open: boolean) => void;
  onDeleteModalClose: () => void;
  onInsights: () => void;
  onSettlementHistory: () => void;
  onEditGroup: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
}

export const GroupsScreenModals: React.FC<GroupsScreenModalsProps> = ({
  isDarkMode,
  selectedGroup,
  isDeleting,
  isActionSheetOpen,
  isDeleteModalOpen,
  onActionSheetOpenChange,
  onDeleteModalClose,
  onInsights,
  onSettlementHistory,
  onEditGroup,
  onRequestDelete,
  onConfirmDelete,
}) => {
  if (!isDeleting && !isActionSheetOpen && (!isDeleteModalOpen || !selectedGroup)) {
    return null;
  }

  return (
    <VStack pointerEvents="box-none" position="absolute" top={0} left={0} right={0} bottom={0}>
      {isDeleting ? <GroupsScreenDeletingOverlay isDarkMode={isDarkMode} /> : null}
      {isActionSheetOpen ? (
        <GroupsScreenActionSheet
          selectedGroup={selectedGroup}
          isOpen={isActionSheetOpen}
          onOpenChange={onActionSheetOpenChange}
          onInsights={onInsights}
          onSettlementHistory={onSettlementHistory}
          onEditGroup={onEditGroup}
          onRequestDelete={onRequestDelete}
        />
      ) : null}
      {isDeleteModalOpen && selectedGroup ? (
        <GroupsScreenDeleteModal
          selectedGroup={selectedGroup}
          onClose={onDeleteModalClose}
          onConfirmDelete={onConfirmDelete}
        />
      ) : null}
    </VStack>
  );
};

const GroupsScreenDeletingOverlay: React.FC<{isDarkMode: boolean}> = ({isDarkMode}) => (
  <View
    position="absolute"
    top={0}
    right={0}
    bottom={0}
    left={0}
    justifyContent="center"
    alignItems="center"
    zIndex={9999}
    backgroundColor="$colorTransparent">
    <GlassBackdrop
      intensity={95}
      tint={isDarkMode ? 'dark' : 'light'}
      style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <VStack alignItems="center" justifyContent="center" gap="$4">
        <LottieAnimationView
          source={loadingAnimation}
          width={150}
          height={150}
          autoPlay
          loop
          backgroundColor="transparent"
        />
        <Text
          variant="h3"
          color={isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
          weight="bold">
          Deleting Group
        </Text>
        <Text
          variant="body1"
          color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
          textAlign="center"
          paddingHorizontal="$4">
          Please wait while we securely remove your group and all associated transactions...
        </Text>
      </VStack>
    </GlassBackdrop>
  </View>
);

interface ActionSheetProps {
  selectedGroup: EnhancedGroup | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsights: () => void;
  onSettlementHistory: () => void;
  onEditGroup: () => void;
  onRequestDelete: () => void;
}

const GroupsScreenActionSheet: React.FC<ActionSheetProps> = ({
  selectedGroup,
  isOpen,
  onOpenChange,
  onInsights,
  onSettlementHistory,
  onEditGroup,
  onRequestDelete,
}) => (
  <BottomSheet
    open={isOpen}
    onOpenChange={onOpenChange}
    snapPoints={[72, 95]}
    scrollable
    title="Group Options"
    description={
      selectedGroup
        ? `Manage ${selectedGroup.name}, review insights, or view settlement history`
        : 'Manage this group, review insights, or view settlement history'
    }>
    <BottomSheetAction
      label="View insights"
      description="Charts and spending analysis"
      icon="analytics"
      onPress={onInsights}
    />
    <BottomSheetAction
      label="View settlement history"
      description="Review past payments"
      icon="time"
      onPress={onSettlementHistory}
    />
    <BottomSheetAction
      label="Edit group"
      description="Change name and members"
      icon="pencil"
      onPress={onEditGroup}
    />
    <BottomSheetAction
      label="Delete group"
      description="Remove this group permanently"
      icon="trash"
      tone="destructive"
      onPress={onRequestDelete}
    />
  </BottomSheet>
);

interface DeleteModalProps {
  selectedGroup: EnhancedGroup;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const GroupsScreenDeleteModal: React.FC<DeleteModalProps> = ({
  selectedGroup,
  onClose,
  onConfirmDelete,
}) => (
  <ConfirmationDialog
    open
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
    title="Delete group?"
    description={`Are you sure you want to delete "${selectedGroup.name}"? This action cannot be undone.`}
    confirmLabel="Delete"
    confirmTone="destructive"
    onConfirm={onConfirmDelete}
    onCancel={onClose}
  />
);
