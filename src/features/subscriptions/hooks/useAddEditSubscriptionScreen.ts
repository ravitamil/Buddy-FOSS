import {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';

import {useSettings, useSubscription} from '@/context';
import {useToast} from '@/context/ToastContext';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import type {AddEditSubscriptionFormData, SubscriptionCategory} from '../types';
import {SUBSCRIPTION_CATEGORIES} from '../types';

const initialFormData: AddEditSubscriptionFormData = {
  name: '',
  amount: '',
  billingCycle: 'monthly',
  nextBilling: new Date(),
  category: 'Entertainment',
  icon: 'tv',
  color: '#E50914',
  description: '',
  website: '',
  autoPayEnabled: true,
  reminderEnabled: true,
  reminderDaysBefore: 3,
};

type DateChangeEvent = Parameters<
  NonNullable<
    React.ComponentProps<
      typeof import('@react-native-community/datetimepicker').default
    >['onChange']
  >
>[0];

export function useAddEditSubscriptionScreen() {
  const {currency} = useSettings();
  const {showToast} = useToast();
  const {showAlert} = useAlert();
  const params = useLocalSearchParams();
  const {addSubscription, getSubscriptionById, updateSubscription} = useSubscription();

  const subscriptionId = typeof params.subscriptionId === 'string' ? params.subscriptionId : '';
  const isEditing = subscriptionId.length > 0;

  const [formData, setFormData] = useState<AddEditSubscriptionFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBillingCycleDropdown, setShowBillingCycleDropdown] = useState(false);
  const [showReminderDaysDropdown, setShowReminderDaysDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialFormData.category);
  const [selectedIcon, setSelectedIcon] = useState(initialFormData.icon);

  const loadSubscriptionData = useCallback(() => {
    try {
      setLoading(true);
      const subscription = getSubscriptionById(subscriptionId);

      if (subscription) {
        setFormData({
          name: subscription.name,
          amount: subscription.amount.toString(),
          billingCycle: subscription.billingCycle,
          nextBilling: new Date(subscription.nextBilling),
          category: subscription.category,
          icon: subscription.icon,
          color: subscription.color,
          description: subscription.description || '',
          website: subscription.website || '',
          autoPayEnabled: subscription.autoPayEnabled,
          reminderEnabled: subscription.reminderEnabled,
          reminderDaysBefore: subscription.reminderDaysBefore,
        });
        setSelectedCategory(subscription.category);
        setSelectedIcon(subscription.icon);
      }
    } catch (error) {
      appLogger.error('Error loading subscription:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to load subscription data. Please try again.',
        actions: [{text: 'OK'}],
      });
    } finally {
      setLoading(false);
    }
  }, [getSubscriptionById, showAlert, subscriptionId]);

  useEffect(() => {
    if (isEditing && subscriptionId) {
      loadSubscriptionData();
    }
  }, [isEditing, loadSubscriptionData, subscriptionId]);

  const currentCategory = useMemo(
    () =>
      SUBSCRIPTION_CATEGORIES.find((category) => category.name === selectedCategory) ||
      SUBSCRIPTION_CATEGORIES[0],
    [selectedCategory],
  );

  const updateForm = useCallback((patch: Partial<AddEditSubscriptionFormData>) => {
    setFormData((previous) => ({...previous, ...patch}));
  }, []);

  const handleCategorySelect = useCallback(
    (category: SubscriptionCategory) => {
      setSelectedCategory(category.name);
      setSelectedIcon(category.icons[0]);
      updateForm({
        category: category.name,
        color: category.color,
        icon: category.icons[0],
      });
    },
    [updateForm],
  );

  const handleIconSelect = useCallback(
    (icon: string) => {
      setSelectedIcon(icon);
      updateForm({icon});
    },
    [updateForm],
  );

  const handleDateChange = useCallback(
    (_event: DateChangeEvent, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        updateForm({nextBilling: selectedDate});
      }
    },
    [updateForm],
  );

  const normalizeWebsite = useCallback(() => {
    let url = formData.website;
    if (url && !/^(?:f|ht)tps?:\/\//.test(url)) {
      url = `https://${url}`;
    }
    updateForm({website: url});
  }, [formData.website, updateForm]);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a subscription name.',
        actions: [{text: 'OK'}],
      });
      return false;
    }

    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid amount.',
        actions: [{text: 'OK'}],
      });
      return false;
    }

    if (
      formData.reminderEnabled &&
      (formData.reminderDaysBefore < 1 || formData.reminderDaysBefore > 30)
    ) {
      showAlert({
        title: 'Validation Error',
        message: 'Reminder days should be between 1 and 30.',
        actions: [{text: 'OK'}],
      });
      return false;
    }

    return true;
  }, [formData, showAlert]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      appLogger.debug('handleSave: Starting save process', {isEditing, subscriptionId});

      const subscriptionData = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        billingCycle: formData.billingCycle,
        nextBilling: formData.nextBilling.toISOString().split('T')[0],
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
        description: formData.description.trim(),
        website: formData.website.trim(),
        autoPayEnabled: formData.autoPayEnabled,
        reminderEnabled: formData.reminderEnabled,
        reminderDaysBefore: formData.reminderDaysBefore,
        status: 'active' as const,
        paymentHistory: [],
      };

      if (isEditing) {
        appLogger.debug('handleSave: Updating existing subscription');
        await updateSubscription(subscriptionId, subscriptionData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Subscription updated successfully!',
        });
      } else {
        appLogger.debug('handleSave: Adding new subscription');
        await addSubscription(subscriptionData);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Subscription added successfully!',
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      router.replace('/(tabs)/trackers');
    } catch (error) {
      appLogger.error('Error saving subscription:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save subscription. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [
    addSubscription,
    formData,
    isEditing,
    showToast,
    subscriptionId,
    updateSubscription,
    validateForm,
  ]);

  return {
    currency,
    currentCategory,
    formData,
    handleCategorySelect,
    handleDateChange,
    handleIconSelect,
    handleSave,
    isEditing,
    loading,
    normalizeWebsite,
    selectedCategory,
    selectedIcon,
    setShowBillingCycleDropdown,
    setShowCategoryDropdown,
    setShowDatePicker,
    setShowReminderDaysDropdown,
    showBillingCycleDropdown,
    showCategoryDropdown,
    showDatePicker,
    showReminderDaysDropdown,
    updateForm,
  };
}

export type AddEditSubscriptionScreenState = ReturnType<typeof useAddEditSubscriptionScreen>;
