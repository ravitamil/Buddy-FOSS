import React from 'react';

import {CategoriesScreenFrame} from '@/features/categories/components/CategoriesScreenFrame';
import {useCategoriesScreen} from '@/features/categories/hooks/useCategoriesScreen';

const CategoriesScreen = () => {
  const screen = useCategoriesScreen();

  return <CategoriesScreenFrame screen={screen} />;
};

export default CategoriesScreen;
