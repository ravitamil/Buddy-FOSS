import {useCallback, useEffect, useMemo, useState} from 'react';
import {useSettings} from '@/context/SettingsContext';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import type {LoanData, LoanFormData, LoanType} from '@/types/loan.types';
import {calculateLoanMetrics} from '@/features/loans/calculations';
import {
  LOAN_TYPE_CONFIG,
  type LoanDateField,
  type LoanFormErrors,
  type LoanFormProps,
  type LoanTypeConfig,
} from '../types/addEditLoanForm';
import {
  buildLoanSubmissionData,
  calculateLoanFormTotals,
  createInitialLoanFormData,
  validateLoanForm,
} from './addEditLoanScreenUtils';

const logger = appLogger.contextLogger('AddEditLoanScreen');

export interface UseAddEditLoanScreenResult {
  formData: LoanFormData;
  errors: LoanFormErrors;
  isEditing: boolean;
  loading: boolean;
  currency: string;
  formatCurrency: (amount: number) => string;
  showDatePicker: boolean;
  datePickerField: LoanDateField;
  showLoanTypeSheet: boolean;
  showLenderTypeSheet: boolean;
  showReminderSheet: boolean;
  showPayoffStrategySheet: boolean;
  showInterestTypeSheet: boolean;
  selectedLoanTypeConfig: LoanTypeConfig;
  hasCalculatedValues: boolean;
  updateFormData: <K extends keyof LoanFormData>(field: K, value: LoanFormData[K]) => void;
  renderErrorText: (field: keyof LoanFormData) => string | undefined;
  openDatePicker: (field: LoanDateField) => void;
  closeDatePicker: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  setShowLoanTypeSheet: (show: boolean) => void;
  setShowLenderTypeSheet: (show: boolean) => void;
  setShowReminderSheet: (show: boolean) => void;
  setShowPayoffStrategySheet: (show: boolean) => void;
  setShowInterestTypeSheet: (show: boolean) => void;
  handleSubmit: () => void;
  handleCancel: () => void;
}

export const useAddEditLoanScreen = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}: LoanFormProps): UseAddEditLoanScreenResult => {
  const {currency, formatCurrency} = useSettings();
  const {showAlert} = useAlert();
  const [formData, setFormData] = useState<LoanFormData>(() =>
    createInitialLoanFormData(initialData),
  );
  const [errors, setErrors] = useState<LoanFormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<LoanDateField>('sanctionDate');
  const [showLoanTypeSheet, setShowLoanTypeSheet] = useState(false);
  const [showLenderTypeSheet, setShowLenderTypeSheet] = useState(false);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [showPayoffStrategySheet, setShowPayoffStrategySheet] = useState(false);
  const [showInterestTypeSheet, setShowInterestTypeSheet] = useState(false);

  const logAction = useCallback(
    (action: string, data?: unknown) => {
      logger.debug(action, {timestamp: new Date().toISOString(), isEditing, data});
    },
    [isEditing],
  );

  useEffect(() => {
    if (initialData && isEditing) {
      logAction('Updating form with initial data', initialData);
      setFormData(createInitialLoanFormData(initialData));
    }
  }, [initialData, isEditing, logAction]);

  useEffect(() => {
    if (formData.emiAmount && formData.tenure) {
      setFormData((prev) => ({
        ...prev,
        ...calculateLoanFormTotals(formData),
      }));
    }
  }, [formData.emiAmount, formData.principalAmount, formData.tenure]);

  const selectedLoanTypeConfig = useMemo(
    () => LOAN_TYPE_CONFIG[formData.loanType ?? 'PERSONAL'],
    [formData.loanType],
  );

  const validateForm = useCallback((): boolean => {
    logAction('Form validation started');
    const newErrors = validateLoanForm(formData);

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    logAction('Form validation completed', {isValid, errors: newErrors});
    return isValid;
  }, [formData, logAction]);

  const updateFormData = useCallback(
    <K extends keyof LoanFormData>(field: K, value: LoanFormData[K]) => {
      logAction('Field updated', {field, value, previousValue: formData[field]});

      setFormData((prev) => {
        if (field === 'loanType') {
          const loanType = (value ?? 'PERSONAL') as LoanType;
          const loanConfig = LOAN_TYPE_CONFIG[loanType];
          return {...prev, loanType, icon: loanConfig.icon, color: loanConfig.color};
        }

        return {...prev, [field]: value};
      });

      if (errors[field]) {
        setErrors((prev) => ({...prev, [field]: undefined}));
      }
    },
    [errors, formData, logAction],
  );

  const submitForm = useCallback(async () => {
    logAction('Form submission started');

    if (!validateForm()) {
      logAction('Form submission failed - validation errors');
      return;
    }

    if (formData.firstEmiDate && formData.tenure && formData.emiAmount) {
      const metricsLoan: LoanData = {
        id: formData.id ?? 'preview',
        name: formData.name ?? '',
        lenderName: formData.lenderName ?? '',
        loanType: formData.loanType ?? 'PERSONAL',
        principalAmount: formData.principalAmount ?? 0,
        interestRate: formData.interestRate ?? 0,
        tenure: formData.tenure,
        emiAmount: formData.emiAmount,
        startDate: formData.firstEmiDate,
        nextEmiDate: formData.firstEmiDate,
        paymentFrequency: 'MONTHLY',
        status: 'ACTIVE',
        currency,
        paymentHistory: [],
        createdAt: '',
        updatedAt: '',
        totalAmount: formData.totalAmount ?? 0,
        totalInterest: formData.totalInterest ?? 0,
        currentOutstanding: formData.currentOutstanding ?? 0,
        outstandingBalance: formData.outstandingBalance ?? 0,
        amortizationSchedule: [],
        reminderEnabled: formData.reminderEnabled ?? true,
        autoPayEnabled: formData.autoPayEnabled ?? true,
      };
      const metrics = calculateLoanMetrics(metricsLoan);

      if (metrics.isLoanCompleted) {
        const maturityDate = new Date(metrics.maturityDate).toLocaleDateString();
        const currentDate = new Date().toLocaleDateString();
        const monthsOverdue = metrics.completedTenure - formData.tenure;

        showAlert({
          title: 'Loan Already Completed',
          message:
            `This loan has already completed its tenure.\n\n` +
            `Loan Details:\n` +
            `- Start Date: ${new Date(formData.firstEmiDate).toLocaleDateString()}\n` +
            `- Tenure: ${formData.tenure} months\n` +
            `- Maturity Date: ${maturityDate}\n` +
            `- Current Date: ${currentDate}\n\n` +
            `The loan completed ${monthsOverdue} months ago. ` +
            `You cannot add a loan that has already finished its tenure.`,
          actions: [{text: 'OK'}],
        });
        return;
      }
    }

    try {
      const now = new Date().toISOString();
      const submissionData = buildLoanSubmissionData(formData, now);

      logAction('Submitting form data', {submissionData});
      await onSubmit(submissionData);
      logAction('Form submission successful');
    } catch (error) {
      logAction('Form submission failed', {error});
      logger.error('Form submission error', error);
    }
  }, [currency, formData, logAction, onSubmit, showAlert, validateForm]);

  const openDatePicker = useCallback((field: LoanDateField) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  }, []);

  const setSelectedDate = useCallback(
    (date: Date | undefined) => {
      setShowDatePicker(false);
      if (!date) {
        return;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      updateFormData(datePickerField, `${year}-${month}-${day}`);
    },
    [datePickerField, updateFormData],
  );

  return {
    formData,
    errors,
    isEditing,
    loading,
    currency,
    formatCurrency,
    showDatePicker,
    datePickerField,
    showLoanTypeSheet,
    showLenderTypeSheet,
    showReminderSheet,
    showPayoffStrategySheet,
    showInterestTypeSheet,
    selectedLoanTypeConfig,
    hasCalculatedValues:
      (formData.principalAmount ?? 0) > 0 &&
      (formData.emiAmount ?? 0) > 0 &&
      (formData.tenure ?? 0) > 0,
    updateFormData,
    renderErrorText: (field) => errors[field],
    openDatePicker,
    closeDatePicker: () => setShowDatePicker(false),
    setSelectedDate,
    setShowLoanTypeSheet,
    setShowLenderTypeSheet,
    setShowReminderSheet,
    setShowPayoffStrategySheet,
    setShowInterestTypeSheet,
    handleSubmit: () => {
      void submitForm();
    },
    handleCancel: onCancel,
  };
};
