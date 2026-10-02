import type {SavingsGoal} from '@/types';

import {buildRetirementAnalysis} from './savingsGoalRetirementAnalysisModel';

const createRetirementGoal = (overrides: Partial<SavingsGoal> = {}): SavingsGoal =>
  ({
    currentAmount: 100_000,
    currentAnnualExpenses: 40_000,
    deadline: new Date('2055-01-01T00:00:00.000Z'),
    employerContribution: 0,
    expectedReturnRate: 0.05,
    healthcareCostsEstimate: 75_000,
    inflationRate: 0.03,
    isRetirementGoal: true,
    lifeExpectancy: 85,
    monthlyContribution: 1_000,
    pensionEstimate: 0,
    retirementAge: 65,
    socialSecurityEstimate: 0,
    ...overrides,
  }) as SavingsGoal;

describe('buildRetirementAnalysis', () => {
  it('derives retirement needs, savings projection, and FIRE milestones from the goal', () => {
    const analysis = buildRetirementAnalysis(createRetirementGoal(), 2025);

    expect(analysis.needs.yearsInRetirement).toBe(20);
    expect(analysis.needs.totalRetirementSavingsNeeded).toBeGreaterThan(0);

    const monthlyRate = 0.05 / 12;
    const expectedAnnuity = (1_000 * (Math.pow(1 + monthlyRate, 360) - 1)) / monthlyRate;
    const expectedInitial = 100_000 * Math.pow(1.05, 30);
    const expectedTotal = expectedInitial + expectedAnnuity;

    expect(analysis.projection.projectedSavingsAtRetirement).toBeCloseTo(expectedTotal, 0);
    expect(analysis.fireMilestones).toEqual(
      expect.objectContaining({
        leanFire: 800_000,
        standardFire: 1_000_000,
        fatFire: 1_200_000,
      }),
    );
  });

  it('caps readiness score to 100 when over target', () => {
    const analysis = buildRetirementAnalysis(
      createRetirementGoal({
        currentAmount: 2_000_000,
        currentAnnualExpenses: 40_000,
        expectedReturnRate: 0,
        monthlyContribution: 0,
        targetAmount: 1_000_000,
      }),
      2025,
    );

    expect(analysis.readiness.isOnTrack).toBe(true);
    expect(analysis.readiness.readinessScore).toBe(100);
    expect(analysis.readiness.recommendations.length).toBeGreaterThan(0);
  });
});
