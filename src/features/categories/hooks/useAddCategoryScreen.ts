import {useCallback, useState} from 'react';
import {router} from 'expo-router';

import {useAlert} from '@/hooks/useAlert';
import {useCategory} from '@/context/CategoryContext';
import {useInvestment} from '@/context/InvestmentContext';
import type {Category, InvestmentCategory} from '@/types';
import {logger as appLogger} from '@/services/LoggerService';
import {
  getDefaultCategoryIcon,
  getPersistedCategoryIcon,
  toSingleCategoryIcon,
} from '../categoryIcon';

export type AddCategoryType = 'income' | 'expense' | 'investment';

export function useAddCategoryScreen() {
  const {addCategory, categories} = useCategory();
  const {addInvestmentCategory} = useInvestment();
  const {showAlert} = useAlert();

  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(getDefaultCategoryIcon(''));
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [type, setType] = useState<AddCategoryType>('expense');
  const [hasCustomIcon, setHasCustomIcon] = useState(false);

  const handleCategoryNameChange = useCallback(
    (name: string) => {
      setCategoryName(name);
      if (!hasCustomIcon) {
        setSelectedEmoji(getDefaultCategoryIcon(name));
      }
    },
    [hasCustomIcon],
  );

  const handleIconChange = useCallback((icon: string) => {
    // Keep the field empty while replacing an icon; resolve a fallback only when saving.
    setSelectedEmoji(toSingleCategoryIcon(icon));
    setHasCustomIcon(true);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      showAlert({
        title: 'Error',
        message: 'Please enter a category name',
      });
      return;
    }

    if (trimmedName.length < 2) {
      showAlert({
        title: 'Invalid Length',
        message: 'Category name must be at least 2 characters long.',
      });
      return;
    }

    if (trimmedName.length > 30) {
      showAlert({
        title: 'Invalid Length',
        message: 'Category name cannot exceed 30 characters.',
      });
      return;
    }

    const existingCategory = categories.find(
      (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingCategory) {
      showAlert({
        title: 'Duplicate Category',
        message: 'A category with this name already exists. Please choose a different name.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    const icon = getPersistedCategoryIcon(selectedEmoji, trimmedName);

    setLoading(true);
    try {
      if (type === 'investment') {
        const newInvestmentCategory: Omit<InvestmentCategory, 'id'> = {
          name: trimmedName,
          icon,
          color: selectedColor,
          riskLevel: 'medium',
          expectedReturn: 8,
        };
        await addInvestmentCategory(newInvestmentCategory);
      } else {
        const newCategory: Omit<Category, 'id'> = {
          name: trimmedName,
          icon,
          color: selectedColor,
          type,
        };
        await addCategory(newCategory);
      }

      showAlert({
        title: 'Success',
        message: 'Category created successfully!',
        actions: [{text: 'OK', onPress: () => router.back(), variant: 'success'}],
      });
    } catch (error) {
      appLogger.error('Error creating category:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to create category. Please try again.',
        actions: [{text: 'OK', variant: 'destructive'}],
      });
    } finally {
      setLoading(false);
    }
  }, [
    addCategory,
    addInvestmentCategory,
    categories,
    categoryName,
    selectedColor,
    selectedEmoji,
    showAlert,
    type,
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

  const applyTemplate = useCallback(
    (template: {name: string; emoji: string; color?: string; type?: AddCategoryType}) => {
      setCategoryName(template.name);
      setSelectedEmoji(template.emoji);
      setHasCustomIcon(true);
      if (template.color) setSelectedColor(template.color);
      if (template.type) setType(template.type);
    },
    [],
  );

  const handleSavePress = useCallback(() => {
    void handleSave();
  }, [handleSave]);

  return {
    applyTemplate,
    categoryName,
    closeEmojiPicker,
    handleSavePress,
    loading,
    openEmojiPicker,
    selectEmoji,
    selectedColor,
    selectedEmoji,
    setCategoryName: handleCategoryNameChange,
    setSelectedColor,
    setSelectedEmoji: handleIconChange,
    setType,
    showEmojiPicker,
    type,
  };
}
