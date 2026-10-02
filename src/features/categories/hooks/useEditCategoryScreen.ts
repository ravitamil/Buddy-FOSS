import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';

import {useCategory} from '@/context/CategoryContext';
import {useInvestment} from '@/context/InvestmentContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {Category, InvestmentCategory} from '@/types';
import {
  getDefaultCategoryIcon,
  getPersistedCategoryIcon,
  toSingleCategoryIcon,
} from '../categoryIcon';

export type EditableCategoryType = 'income' | 'expense' | 'investment';

interface EditCategoryOriginalValues {
  name: string;
  emoji: string;
  color: string;
  type: EditableCategoryType;
}

export interface UseEditCategoryScreenResult {
  category: Category | InvestmentCategory | undefined;
  categoryName: string;
  hasChanges: boolean;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  isInvestmentCategory: boolean;
  isMandatory: boolean;
  loading: boolean;
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  selectedColor: string;
  selectedEmoji: string;
  selectedType: EditableCategoryType;
  showEmojiPicker: boolean;
  closeEmojiPicker: () => void;
  openEmojiPicker: () => void;
  selectEmoji: (emoji: string) => void;
  handleBack: () => void;
  handleSave: () => Promise<void>;
  setCategoryName: (name: string) => void;
  setSelectedColor: (color: string) => void;
  setSelectedEmoji: (icon: string) => void;
  setSelectedType: (type: EditableCategoryType) => void;
}

const DEFAULT_ORIGINAL_VALUES: EditCategoryOriginalValues = {
  name: '',
  emoji: '',
  color: '',
  type: 'expense',
};

interface UseEditCategoryScreenOptions {
  categoryId: string;
  categoryType?: string;
}

export const useEditCategoryScreen = ({
  categoryId,
  categoryType,
}: UseEditCategoryScreenOptions): UseEditCategoryScreenResult => {
  const {categories, updateCategory} = useCategory();
  const {investmentCategories, updateInvestmentCategory} = useInvestment();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader();

  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedType, setSelectedType] = useState<EditableCategoryType>('expense');
  const [originalValues, setOriginalValues] =
    useState<EditCategoryOriginalValues>(DEFAULT_ORIGINAL_VALUES);

  const isInvestmentCategory = categoryType === 'investment';

  const category = useMemo(
    () =>
      isInvestmentCategory
        ? investmentCategories.find((item) => item.id === categoryId)
        : categories.find((item) => item.id === categoryId),
    [categories, categoryId, investmentCategories, isInvestmentCategory],
  );

  const isMandatory = Boolean(category?.isSystem);

  const hasChanges = useMemo(
    () =>
      categoryName.trim() !== originalValues.name ||
      selectedEmoji !== originalValues.emoji ||
      selectedColor !== originalValues.color ||
      selectedType !== originalValues.type,
    [categoryName, originalValues, selectedColor, selectedEmoji, selectedType],
  );

  const handleBack = useCallback(() => router.back(), []);
  const handleIconChange = useCallback((icon: string) => {
    // Keep the field empty while replacing an icon; resolve a fallback only when saving.
    setSelectedEmoji(toSingleCategoryIcon(icon));
  }, []);

  useEffect(() => {
    if (!category) {
      showAlert({
        title: 'Error',
        message: 'Category not found',
        actions: [{text: 'OK', onPress: () => router.back()}],
      });
      return;
    }

    const categoryType =
      isInvestmentCategory || !('type' in category) ? 'expense' : category.type || 'expense';

    setCategoryName(category.name);
    setSelectedEmoji(toSingleCategoryIcon(category.icon) || getDefaultCategoryIcon(category.name));
    setSelectedColor(category.color);
    setSelectedType(categoryType);
    setOriginalValues({
      name: category.name,
      emoji: category.icon,
      color: category.color,
      type: categoryType,
    });
  }, [category, isInvestmentCategory, showAlert]);

  const handleSave = useCallback(async () => {
    if (!categoryName.trim()) {
      showAlert({
        title: 'Error',
        message: 'Please enter a category name',
      });
      return;
    }

    if (!category) return;

    if (isMandatory) {
      showAlert({
        title: 'Cannot Modify System Category',
        message: 'System categories cannot be modified.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    const icon = getPersistedCategoryIcon(selectedEmoji, categoryName);

    setLoading(true);
    try {
      if (isInvestmentCategory) {
        await updateInvestmentCategory(category.id, {
          icon,
          color: selectedColor,
        });
      } else {
        await updateCategory(category.id, {
          icon,
          color: selectedColor,
          name: categoryName.trim(),
          type: selectedType,
        });
      }

      setOriginalValues({
        name: categoryName.trim(),
        emoji: icon,
        color: selectedColor,
        type: selectedType,
      });

      showAlert({
        title: 'Success',
        message: 'Category updated successfully!',
        actions: [{text: 'OK', onPress: () => router.back(), variant: 'success'}],
      });
    } catch (error) {
      appLogger.error('Error updating category:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to update category. Please try again.',
        actions: [{text: 'OK', variant: 'destructive'}],
      });
    } finally {
      setLoading(false);
    }
  }, [
    category,
    categoryName,
    isInvestmentCategory,
    isMandatory,
    selectedColor,
    selectedEmoji,
    selectedType,
    showAlert,
    updateCategory,
    updateInvestmentCategory,
  ]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const openEmojiPicker = useCallback(() => setShowEmojiPicker(true), []);
  const closeEmojiPicker = useCallback(() => setShowEmojiPicker(false), []);
  const selectEmoji = useCallback(
    (emoji: string) => {
      handleIconChange(emoji);
      setShowEmojiPicker(false);
    },
    [handleIconChange],
  );

  return {
    category,
    categoryName,
    closeEmojiPicker,
    hasChanges,
    headerProps,
    isInvestmentCategory,
    isMandatory,
    loading,
    onScroll,
    openEmojiPicker,
    selectEmoji,
    selectedColor,
    selectedEmoji,
    selectedType,
    showEmojiPicker,
    handleBack,
    handleSave,
    setCategoryName,
    setSelectedColor,
    setSelectedEmoji: handleIconChange,
    setSelectedType,
  };
};
