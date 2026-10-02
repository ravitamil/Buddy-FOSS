import React from 'react';

import {CustomNavigationHeader} from '@/components/ui/CustomNavigationHeader';
import {FloatingAction} from '@ravitamil/buddy-ui';
import ScreenContainer from '@/components/ui/ScreenContainer';
import type {UseManageCategoriesScreenResult} from '../hooks/useManageCategoriesScreen';
import {ManageCategorySections} from './ManageCategorySections';

export const ManageCategoriesScreenFrame: React.FC<{
  screen: UseManageCategoriesScreenResult;
}> = ({screen}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
    <CustomNavigationHeader
      title="Manage Categories"
      subtitle="Organize spending, income, and investments"
      onBackPress={screen.handleBack}
      mode="collapsing"
      {...screen.headerProps}
    />

    <ManageCategorySections screen={screen} />

    <FloatingAction
      presentation="circular"
      variant="info"
      label="Add category"
      icon="add"
      bottomOffset={16}
      onPress={screen.handleAddCategory}
      loading={screen.isLoading}
      isScrollingDown={screen.isScrollingDown}
    />
  </ScreenContainer>
);
