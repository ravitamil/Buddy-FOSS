import {BottomSheet, BottomSheetAction} from '@ravitamil/buddy-ui/overlays';
import React from 'react';

import type {GroupDetailActionSheetProps} from '../types/groupDetailScreen';

export const GroupDetailActionSheet: React.FC<GroupDetailActionSheetProps> = ({
  isOpen,
  onOpenChange,
  onInsights,
  onActivity,
  onSettlementHistory,
  onEditGroup,
  onDeleteGroup,
}) => {
  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[65, 90]}
      scrollable
      title="Group Options"
      description="Manage this group, review activity, and view settlement history">
      <BottomSheetAction
        label="View insights"
        description="Charts and spending analysis"
        icon="analytics"
        onPress={onInsights}
      />
      <BottomSheetAction
        label="Activity feed"
        description="Who did what in this group"
        icon="time"
        onPress={onActivity}
      />
      <BottomSheetAction
        label="Settlement history"
        description="View past payments"
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
        onPress={onDeleteGroup}
      />
    </BottomSheet>
  );
};
