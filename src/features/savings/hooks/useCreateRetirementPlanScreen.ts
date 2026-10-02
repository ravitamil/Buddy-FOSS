import {useCallback, useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useToast} from '@/context/ToastContext';
import {useAlert} from '@/hooks/useAlert';
import appLogger from '@/services/LoggerService';
import {retirementPlanningService} from '@/services/RetirementPlanningService';
import type {SavingsGoal} from '@/types';
import {useSavingsState} from './useSavingsState';

export type RetirementRiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface RetirementPlanFormData {
  planName: string;
  currentAge: string;
  retirementAge: string;
  lifeExpectancy: string;
  currentAnnualExpenses: string;
  currentSavings: string;
  monthlyContribution: string;
  expectedReturnRate: string;
  inflationRate: string;
  socialSecurityEstimate: string;
  pensionEstimate: string;
  healthcareCostsEstimate: string;
  riskTolerance: RetirementRiskTolerance;
}

const defaultFormData: RetirementPlanFormData = {
  planName: 'Financial Independence (FIRE)',
  currentAge: '30',
  retirementAge: '60',
  lifeExpectancy: '85',
  currentAnnualExpenses: '',
  currentSavings: '',
  monthlyContribution: '',
  expectedReturnRate: '7',
  inflationRate: '3',
  socialSecurityEstimate: '',
  pensionEstimate: '',
  healthcareCostsEstimate: '5',
  riskTolerance: 'moderate',
};

const createFormDataFromGoal = (goal: SavingsGoal): RetirementPlanFormData => {
  const deadlineYears = goal.deadline
    ? Math.max(0, dayjs(goal.deadline).diff(dayjs(), 'year'))
    : 30;
  const derivedCurrentAge = goal.retirementAge
    ? Math.max(18, goal.retirementAge - deadlineYears)
    : 30;

  return {
    planName: goal.name || defaultFormData.planName,
    currentAge: String(derivedCurrentAge),
    retirementAge:
      goal.retirementAge !== undefined ? String(goal.retirementAge) : defaultFormData.retirementAge,
    lifeExpectancy:
      goal.lifeExpectancy !== undefined
        ? String(goal.lifeExpectancy)
        : defaultFormData.lifeExpectancy,
    currentAnnualExpenses:
      goal.currentAnnualExpenses !== undefined ? String(goal.currentAnnualExpenses) : '',
    currentSavings: goal.currentAmount !== undefined ? String(goal.currentAmount) : '',
    monthlyContribution:
      goal.monthlyContribution !== undefined ? String(goal.monthlyContribution) : '',
    expectedReturnRate: String(goal.expectedReturnRate ? goal.expectedReturnRate * 100 : 7),
    inflationRate: String(goal.inflationRate ? goal.inflationRate * 100 : 3),
    socialSecurityEstimate:
      goal.socialSecurityEstimate !== undefined ? String(goal.socialSecurityEstimate) : '',
    pensionEstimate: goal.pensionEstimate !== undefined ? String(goal.pensionEstimate) : '',
    healthcareCostsEstimate: String(
      goal.healthcareCostsEstimate ? goal.healthcareCostsEstimate * 100 : 5,
    ),
    riskTolerance: goal.riskTolerance || 'moderate',
  };
};

export const useCreateRetirementPlanScreen = () => {
  const params = useLocalSearchParams<{id?: string | string[]}>();
  const rawGoalId = params.id;
  const goalId = Array.isArray(rawGoalId) ? rawGoalId[0] : rawGoalId;
  const router = useRouter();
  const {savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal} = useSavingsState();
  const {showToast} = useToast();
  const {showAlert} = useAlert();

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState<RetirementPlanFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRiskProfileSheet, setShowRiskProfileSheet] = useState(false);

  useEffect(() => {
    if (!goalId) return;

    const goalData = savingsGoals.find((item) => item.id === goalId);
    if (!goalData?.isRetirementGoal) return;

    setGoal(goalData);
    setFormData(createFormDataFromGoal(goalData));
  }, [goalId, savingsGoals]);

  const updateField = useCallback(
    <Field extends keyof RetirementPlanFormData>(
      field: Field,
      value: RetirementPlanFormData[Field],
    ) => {
      setErrors((current) => (current[field] ? {...current, [field]: ''} : current));
      setFormData((current) => ({...current, [field]: value}));
    },
    [],
  );

  const annualExpenses = parseFloat(formData.currentAnnualExpenses) || 0;
  const currentSavings = parseFloat(formData.currentSavings) || 0;
  const currentAgeNum = parseInt(formData.currentAge, 10) || 30;
  const retirementAgeNum = parseInt(formData.retirementAge, 10) || 60;
  const yearsToRetirement = Math.max(0, retirementAgeNum - currentAgeNum);
  const expectedReturnRate = (parseFloat(formData.expectedReturnRate) || 7) / 100;

  const fireMilestones = useMemo(
    () =>
      retirementPlanningService.calculateFireMilestones(
        annualExpenses,
        currentSavings,
        yearsToRetirement,
        expectedReturnRate,
      ),
    [annualExpenses, currentSavings, yearsToRetirement, expectedReturnRate],
  );

  const fireNumber = fireMilestones.standardFire;

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const currentAnnualExpenses = formData.currentAnnualExpenses;
    const currentAge = formData.currentAge;
    const retirementAge = formData.retirementAge;
    const lifeExpectancy = formData.lifeExpectancy;

    if (!formData.planName.trim()) {
      newErrors.planName = 'Plan name is required';
    }

    if (!currentAnnualExpenses.trim()) {
      newErrors.currentAnnualExpenses = 'Current annual expenses is required';
    } else if (parseFloat(currentAnnualExpenses) <= 0) {
      newErrors.currentAnnualExpenses = 'Current annual expenses must be greater than 0';
    }

    if (!currentAge.trim()) {
      newErrors.currentAge = 'Current age is required';
    } else {
      const parsedCurrentAge = parseInt(currentAge, 10);
      if (parsedCurrentAge < 18 || parsedCurrentAge > 100) {
        newErrors.currentAge = 'Current age must be between 18 and 100';
      }
    }

    if (!retirementAge.trim()) {
      newErrors.retirementAge = 'Retirement / FIRE age is required';
    } else {
      const age = parseInt(retirementAge, 10);
      const parsedCurrentAge = parseInt(currentAge, 10) || 18;
      if (age <= parsedCurrentAge) {
        newErrors.retirementAge = 'Retirement age must be greater than current age';
      } else if (age > 100) {
        newErrors.retirementAge = 'Retirement age must be under 100';
      }
    }

    if (!lifeExpectancy.trim()) {
      newErrors.lifeExpectancy = 'Life expectancy is required';
    } else {
      const lifeExp = parseInt(lifeExpectancy, 10);
      const retireAge = parseInt(retirementAge, 10);

      if (lifeExp <= 0) {
        newErrors.lifeExpectancy = 'Life expectancy must be greater than 0';
      } else if (lifeExp <= retireAge) {
        newErrors.lifeExpectancy = 'Life expectancy must be greater than retirement age';
      } else if (lifeExp > 120) {
        newErrors.lifeExpectancy = 'Life expectancy must be reasonable (under 120)';
      }
    }

    if (formData.currentSavings && parseFloat(formData.currentSavings) < 0) {
      newErrors.currentSavings = 'Current savings cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const buildRetirementGoalData = useCallback(() => {
    const annualExpenses = parseFloat(formData.currentAnnualExpenses) || 0;
    const currentAge = parseInt(formData.currentAge, 10) || 30;
    const retirementAge = parseInt(formData.retirementAge, 10) || 60;
    const yearsToRetirement = Math.max(1, retirementAge - currentAge);
    const calculatedTarget = Math.round(annualExpenses * 25);
    const targetDate = dayjs().add(yearsToRetirement, 'year').toDate();

    return {
      name: formData.planName.trim() || 'Financial Independence (FIRE)',
      isRetirementGoal: true,
      category: 'Retirement',
      targetAmount: calculatedTarget > 0 ? calculatedTarget : 1000000,
      currentAmount: parseFloat(formData.currentSavings) || 0,
      deadline: targetDate,
      retirementAge,
      lifeExpectancy: parseInt(formData.lifeExpectancy, 10) || 85,
      currentAnnualExpenses: annualExpenses,
      monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
      expectedReturnRate: (parseFloat(formData.expectedReturnRate) || 7) / 100,
      inflationRate: (parseFloat(formData.inflationRate) || 3) / 100,
      socialSecurityEstimate: parseFloat(formData.socialSecurityEstimate) || 0,
      pensionEstimate: parseFloat(formData.pensionEstimate) || 0,
      healthcareCostsEstimate: (parseFloat(formData.healthcareCostsEstimate) || 5) / 100,
      riskTolerance: formData.riskTolerance,
      annualRetirementIncome: annualExpenses,
      description: 'Financial Independence, Retire Early (FIRE) & Retirement Plan',
    };
  }, [formData]);

  const handleCreateRetirementGoal = useCallback(async () => {
    if (!validateForm()) return;

    const existingRetirementPlan = savingsGoals.find((item) => item.isRetirementGoal);
    if (existingRetirementPlan && !goalId) {
      showToast({
        title: 'FIRE Plan Exists',
        message: 'You already have a retirement plan. You can edit or delete the existing plan.',
        type: 'error',
      });
      return;
    }

    try {
      const newGoal: Omit<SavingsGoal, 'id'> = {
        ...buildRetirementGoalData(),
      };

      const createdGoal = await addSavingsGoal(newGoal);
      setGoal(createdGoal);
      showToast({
        title: 'Success',
        message: 'FIRE & Retirement goal created successfully!',
        type: 'success',
      });
      router.push({
        pathname: '/savings/[id]',
        params: {id: createdGoal.id, fromCreation: 'true'},
      });
    } catch (error) {
      appLogger.error('Error creating retirement goal:', error);
      showToast({
        title: 'Error',
        message: 'Failed to create retirement goal. Please try again.',
        type: 'error',
      });
    }
  }, [
    addSavingsGoal,
    buildRetirementGoalData,
    goalId,
    router,
    savingsGoals,
    showToast,
    validateForm,
  ]);

  const handleSaveRetirementPlan = useCallback(async () => {
    if (!goal || !validateForm()) return;

    try {
      await updateSavingsGoal(goal.id, buildRetirementGoalData());
      showToast({
        title: 'Success',
        message: 'FIRE & Retirement plan saved successfully!',
        type: 'success',
      });
      router.push({pathname: '/savings/[id]', params: {id: goal.id}});
    } catch (error) {
      appLogger.error('Error saving retirement plan:', error);
      showToast({
        title: 'Error',
        message: 'Failed to save retirement plan. Please try again.',
        type: 'error',
      });
    }
  }, [buildRetirementGoalData, goal, router, showToast, updateSavingsGoal, validateForm]);

  const handleDeleteRetirementGoal = useCallback(() => {
    if (!goal) return;

    showAlert({
      title: 'Delete Retirement Plan',
      message:
        'Are you sure you want to delete your retirement plan? This action cannot be undone.',
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteSavingsGoal(goal.id);
                showToast({
                  title: 'Success',
                  message: 'Retirement plan deleted successfully',
                  type: 'success',
                });
                router.replace('/savings-goals');
              } catch (error) {
                appLogger.error('Error deleting retirement plan:', error);
                showToast({
                  title: 'Error',
                  message: 'Failed to delete retirement plan',
                  type: 'error',
                });
              }
            })();
          },
        },
      ],
    });
  }, [deleteSavingsGoal, goal, router, showAlert, showToast]);

  const handleSubmit = useCallback(() => {
    void (goal ? handleSaveRetirementPlan() : handleCreateRetirementGoal());
  }, [goal, handleCreateRetirementGoal, handleSaveRetirementPlan]);

  return {
    errors,
    fireMilestones,
    fireNumber,
    formData,
    goal,
    handleDeleteRetirementGoal,
    handleSubmit,
    router,
    setShowRiskProfileSheet,
    showRiskProfileSheet,
    updateField,
  };
};
