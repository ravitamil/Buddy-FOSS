import type {SavingsGoal} from '@/types';
import {retirementPlanningService} from '@/services/RetirementPlanningService';

const getCurrentAge = (goal: SavingsGoal, currentYear: number) => {
  if (!goal.retirementAge) return 30;
  const retirementYear =
    goal.deadline instanceof Date
      ? goal.deadline.getFullYear()
      : new Date(goal.deadline).getFullYear();
  const remainingYears = Math.max(0, retirementYear - currentYear);
  return Math.max(18, goal.retirementAge - remainingYears);
};

export const buildRetirementAnalysis = (
  goal: SavingsGoal,
  currentYear = new Date().getFullYear(),
) => {
  const currentAge = getCurrentAge(goal, currentYear);
  const yearsToRetirement = Math.max(0, (goal.retirementAge || 65) - currentAge);

  const needs = retirementPlanningService.calculateRetirementNeeds(
    goal.currentAnnualExpenses || 0,
    goal.retirementAge || 65,
    currentAge,
    goal.lifeExpectancy || 85,
    goal.inflationRate ?? 0.03,
    goal.healthcareCostsEstimate ?? 0.05,
  );

  const targetAmount = goal.targetAmount || needs.totalRetirementSavingsNeeded;

  const projection = retirementPlanningService.projectRetirementSavings(
    goal.currentAmount || 0,
    goal.monthlyContribution || 0,
    yearsToRetirement,
    goal.expectedReturnRate ?? 0.07,
    goal.employerContribution || 0,
    targetAmount,
  );

  const readiness = retirementPlanningService.calculateRetirementReadiness(
    goal.currentAmount || 0,
    projection.projectedSavingsAtRetirement,
    targetAmount,
    yearsToRetirement,
  );

  const fireMilestones = retirementPlanningService.calculateFireMilestones(
    goal.currentAnnualExpenses || 0,
    goal.currentAmount || 0,
    yearsToRetirement,
    goal.expectedReturnRate ?? 0.07,
  );

  return {needs, projection, readiness, fireMilestones};
};

export type RetirementAnalysis = ReturnType<typeof buildRetirementAnalysis>;
