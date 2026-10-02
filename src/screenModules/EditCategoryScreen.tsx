import React from 'react';

import {EditCategoryScreenFrame} from '@/features/categories/components/EditCategoryScreenFrame';
import {useEditCategoryScreen} from '@/features/categories/hooks/useEditCategoryScreen';

interface EditCategoryScreenProps {
  categoryId: string;
  categoryType?: string;
}

export default function EditCategoryScreen({categoryId, categoryType}: EditCategoryScreenProps) {
  const screen = useEditCategoryScreen({categoryId, categoryType});

  return <EditCategoryScreenFrame screen={screen} />;
}
