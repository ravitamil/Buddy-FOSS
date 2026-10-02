import React from 'react';

import type {GroupDetailDeletingOverlayProps} from '../types/groupDetailScreen';
import {GroupDeletingOverlay} from './GroupDeletingOverlay';

export const GroupDetailDeletingOverlay: React.FC<GroupDetailDeletingOverlayProps> = ({
  isVisible,
  isDarkMode,
  loadingSource,
}) => (
  <GroupDeletingOverlay
    isVisible={isVisible}
    isDarkMode={isDarkMode}
    loadingSource={loadingSource}
  />
);
