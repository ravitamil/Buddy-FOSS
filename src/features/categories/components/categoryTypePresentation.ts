import type {EditableCategoryType} from '../hooks/useEditCategoryScreen';

export function getCategoryTypeColor(type: EditableCategoryType): string {
  switch (type) {
    case 'income':
      return '#4CAF50';
    case 'expense':
      return '#FF5722';
    case 'investment':
      return '#2196F3';
  }
}

export function getCategoryTypeIcon(type: EditableCategoryType): 'trending-down' | 'trending-up' {
  return type === 'expense' ? 'trending-down' : 'trending-up';
}
