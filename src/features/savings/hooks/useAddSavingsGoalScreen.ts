import {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useToast} from '@/context/ToastContext';
import appLogger from '@/services/LoggerService';
import type {RecurrenceFrequency} from '@/types';
import {useSavingsState} from './useSavingsState';

export interface SavingsCategoryOption {
  name: string;
  color: string;
  icons: string[];
}

export interface AddSavingsGoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: Date;
  description: string;
  category: string;
  color: string;
  icon: string;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  intendedAmount: string;
  recurrenceEndDate?: Date;
}

export const SAVINGS_CATEGORIES: SavingsCategoryOption[] = [
  {name: 'Emergency Fund', color: '#EF4444', icons: ['shield', 'medkit', 'alert-circle']},
  {name: 'Vacation', color: '#3B82F6', icons: ['airplane', 'beach', 'camera']},
  {name: 'Home', color: '#10B981', icons: ['home', 'hammer', 'key']},
  {name: 'Education', color: '#8B5CF6', icons: ['school', 'book', 'graduation-cap']},
  {name: 'Retirement', color: '#F59E0B', icons: ['leaf', 'time', 'hourglass']},
  {name: 'Car', color: '#06B6D4', icons: ['car', 'car-sport', 'build']},
  {name: 'Wedding', color: '#EC4899', icons: ['heart', 'rose', 'diamond']},
  {name: 'Health', color: '#8B5CF6', icons: ['fitness', 'medkit', 'heart-pulse']},
  {name: 'Technology', color: '#6366F1', icons: ['laptop', 'phone-portrait', 'tablet']},
  {name: 'Hobby', color: '#14B8A6', icons: ['game-controller', 'musical-notes', 'brush']},
  {name: 'Charity', color: '#F97316', icons: ['heart', 'hand-left', 'people']},
  {name: 'Other', color: '#6B7280', icons: ['ellipsis-horizontal', 'apps', 'grid']},
];

export const RECURRENCE_FREQUENCIES: {value: RecurrenceFrequency; label: string}[] = [
  {value: 'daily', label: 'Daily'},
  {value: 'biweekly', label: 'Bi-weekly'},
  {value: 'monthly', label: 'Monthly'},
  {value: 'quarterly', label: 'Quarterly'},
  {value: 'semiannually', label: 'Semi-annually'},
  {value: 'annually', label: 'Annually'},
];

const defaultCategory = SAVINGS_CATEGORIES[0];

const createDefaultFormData = (): AddSavingsGoalFormData => ({
  name: '',
  targetAmount: '',
  currentAmount: '',
  deadline: new Date(),
  description: '',
  category: defaultCategory.name,
  color: defaultCategory.color,
  icon: defaultCategory.icons[0],
  isRecurring: false,
  recurrenceFrequency: 'monthly',
  intendedAmount: '',
  recurrenceEndDate: undefined,
});

export const useAddSavingsGoalScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{id?: string | string[]}>();
  const rawId = params.id;
  const goalId = Array.isArray(rawId) ? rawId[0] : rawId;
  const isEditing = Boolean(goalId);

  const {addSavingsGoal, updateSavingsGoal, getSavingsGoalById} = useSavingsState();
  const {showToast} = useToast();

  const [loading, setLoading] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showFrequencySheet, setShowFrequencySheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);
  const [formData, setFormData] = useState<AddSavingsGoalFormData>(createDefaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditing || !goalId) return;

    const goal = getSavingsGoalById(goalId);
    if (!goal) return;

    const category =
      SAVINGS_CATEGORIES.find((item) => item.name === goal.category) ?? defaultCategory;

    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      deadline: new Date(goal.deadline),
      description: goal.description || '',
      category: goal.category || defaultCategory.name,
      color: category.color,
      icon: category.icons[0],
      isRecurring: goal.isRecurring || false,
      recurrenceFrequency: goal.recurrenceFrequency || 'monthly',
      intendedAmount: goal.intendedAmount !== undefined ? String(goal.intendedAmount) : '',
      recurrenceEndDate: goal.recurrenceEndDate ? new Date(goal.recurrenceEndDate) : undefined,
    });
  }, [getSavingsGoalById, goalId, isEditing]);

  useEffect(() => {
    if (!formData.isRecurring || !formData.recurrenceEndDate) return;

    if (
      formData.recurrenceEndDate > formData.deadline ||
      formData.recurrenceEndDate.getTime() === formData.deadline.getTime()
    ) {
      setFormData((current) => ({
        ...current,
        recurrenceEndDate: current.deadline,
      }));
    }
  }, [formData.deadline, formData.isRecurring, formData.recurrenceEndDate]);

  const currentCategory = useMemo(
    () =>
      SAVINGS_CATEGORIES.find((category) => category.name === formData.category) ?? defaultCategory,
    [formData.category],
  );

  const updateField = useCallback(
    <Field extends keyof AddSavingsGoalFormData>(
      field: Field,
      value: AddSavingsGoalFormData[Field],
    ) => {
      setFormData((current) => ({...current, [field]: value}));
    },
    [],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (formData.deadline <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.deadline, formData.name, formData.targetAmount]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const goalData = {
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: formData.deadline,
        description: formData.description.trim(),
        category: formData.category,
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency : undefined,
        intendedAmount: formData.isRecurring ? parseFloat(formData.intendedAmount) : undefined,
        recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : undefined,
      };

      if (isEditing && goalId) {
        await updateSavingsGoal(goalId, goalData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Savings goal updated successfully!',
        });
      } else {
        await addSavingsGoal(goalData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Savings goal added successfully!',
        });
      }

      router.back();
    } catch (error) {
      appLogger.error('Error saving goal:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save savings goal. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [
    addSavingsGoal,
    formData,
    goalId,
    isEditing,
    router,
    showToast,
    updateSavingsGoal,
    validateForm,
  ]);

  const handleCategorySelect = useCallback((category: SavingsCategoryOption) => {
    setFormData((current) => ({
      ...current,
      category: category.name,
      color: category.color,
      icon: category.icons[0],
    }));
    setShowCategorySheet(false);
  }, []);

  const handleDeadlineChange = useCallback((_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (!selectedDate) return;

    setFormData((current) => ({
      ...current,
      deadline: selectedDate,
      recurrenceEndDate: current.isRecurring ? selectedDate : current.recurrenceEndDate,
    }));
  }, []);

  const handleRecurringChange = useCallback((value: boolean) => {
    setFormData((current) => ({
      ...current,
      isRecurring: value,
      recurrenceEndDate:
        value && !current.recurrenceEndDate ? current.deadline : current.recurrenceEndDate,
    }));
  }, []);

  const handleFrequencySelect = useCallback((frequency: RecurrenceFrequency) => {
    setFormData((current) => ({...current, recurrenceFrequency: frequency}));
    setShowFrequencySheet(false);
  }, []);

  const handleRecurrenceEndDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowRecurrenceEndDatePicker(false);
      if (!selectedDate) return;

      setFormData((current) => ({
        ...current,
        recurrenceEndDate: selectedDate > current.deadline ? current.deadline : selectedDate,
      }));
    },
    [],
  );

  return {
    currentCategory,
    errors,
    formData,
    handleCategorySelect,
    handleDeadlineChange,
    handleFrequencySelect,
    handleRecurrenceEndDateChange,
    handleRecurringChange,
    handleSave,
    isEditing,
    loading,
    router,
    setShowCategorySheet,
    setShowDatePicker,
    setShowFrequencySheet,
    setShowRecurrenceEndDatePicker,
    showCategorySheet,
    showDatePicker,
    showFrequencySheet,
    showRecurrenceEndDatePicker,
    updateField,
  };
};
