import React from 'react';

import {ManageCategoriesScreenFrame} from '@/features/categories/components/ManageCategoriesScreenFrame';
import {useManageCategoriesScreen} from '@/features/categories/hooks/useManageCategoriesScreen';

const ManageCategoriesScreen = () => {
  const screen = useManageCategoriesScreen();

  return <ManageCategoriesScreenFrame screen={screen} />;
};

export default ManageCategoriesScreen;
